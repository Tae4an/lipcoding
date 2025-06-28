const bcrypt = require('bcryptjs');
const database = require('./database');

class User {
  static async create(userData) {
    const { email, password, name, role } = userData;
    
    // 비밀번호 해싱
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO users (email, password_hash, name, role)
        VALUES (?, ?, ?, ?)
      `;
      
      database.getDb().run(query, [email, password_hash, name, role], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            reject(new Error('Email already exists'));
          } else {
            reject(err);
          }
        } else {
          resolve({ id: this.lastID, email, name, role });
        }
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE email = ?';
      
      database.getDb().get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE id = ?';
      
      database.getDb().get(query, [id], (err, row) => {
        if (err) {
          console.error('Database error in findById:', err);
          reject(err);
        } else {
          if (row) {
            try {
              // skills를 JSON으로 파싱 (안전하게)
              row.skills = JSON.parse(row.skills || '[]');
            } catch (jsonError) {
              console.warn('Failed to parse skills JSON, using empty array:', jsonError);
              row.skills = [];
            }
          }
          resolve(row);
        }
      });
    });
  }

  static async updateProfile(id, profileData) {
    const { name, bio, image, skills } = profileData;
    
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE users 
        SET name = ?, bio = ?, image_data = ?, skills = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const skillsJson = skills ? JSON.stringify(skills) : '[]';
      
      database.getDb().run(query, [name, bio, image, skillsJson, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, name, bio, skills });
        }
      });
    });
  }

  static async findMentors(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT id, email, role, name, bio, image_data, skills
        FROM users 
        WHERE role = 'mentor'
      `;
      const params = [];

      // 스킬 필터링
      if (filters.skill) {
        query += ' AND skills LIKE ?';
        params.push(`%"${filters.skill}"%`);
      }

      // 정렬
      if (filters.orderBy === 'name') {
        query += ' ORDER BY name ASC';
      } else if (filters.orderBy === 'skill') {
        query += ' ORDER BY skills ASC';
      } else {
        query += ' ORDER BY id ASC';
      }

      database.getDb().all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // skills를 JSON으로 파싱
          const mentors = rows.map(row => ({
            ...row,
            skills: JSON.parse(row.skills || '[]')
          }));
          resolve(mentors);
        }
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;
