const database = require('./database');

class MatchRequest {
  static async create(requestData) {
    const { mentorId, menteeId, message } = requestData;
    
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO match_requests (mentor_id, mentee_id, message)
        VALUES (?, ?, ?)
      `;
      
      database.getDb().run(query, [mentorId, menteeId, message], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            reject(new Error('Request already exists between this mentor and mentee'));
          } else {
            reject(err);
          }
        } else {
          resolve({ 
            id: this.lastID, 
            mentorId, 
            menteeId, 
            message, 
            status: 'pending' 
          });
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM match_requests WHERE id = ?';
      
      database.getDb().get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findIncomingRequests(mentorId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT mr.*, u.name as mentee_name, u.email as mentee_email
        FROM match_requests mr
        JOIN users u ON mr.mentee_id = u.id
        WHERE mr.mentor_id = ?
        ORDER BY mr.created_at DESC
      `;
      
      database.getDb().all(query, [mentorId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async findOutgoingRequests(menteeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT mr.*, u.name as mentor_name, u.email as mentor_email
        FROM match_requests mr
        JOIN users u ON mr.mentor_id = u.id
        WHERE mr.mentee_id = ?
        ORDER BY mr.created_at DESC
      `;
      
      database.getDb().all(query, [menteeId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async updateStatus(id, status, userId, userRole) {
    return new Promise((resolve, reject) => {
      // 권한 확인을 위한 쿼리
      let authQuery;
      if (userRole === 'mentor') {
        authQuery = 'SELECT * FROM match_requests WHERE id = ? AND mentor_id = ?';
      } else {
        authQuery = 'SELECT * FROM match_requests WHERE id = ? AND mentee_id = ?';
      }

      database.getDb().get(authQuery, [id, userId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          reject(new Error('Request not found or unauthorized'));
          return;
        }

        // 상태 업데이트
        const updateQuery = `
          UPDATE match_requests 
          SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        database.getDb().run(updateQuery, [status, id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ ...row, status });
          }
        });
      });
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      // 권한 확인 (멘티만 삭제 가능)
      const authQuery = 'SELECT * FROM match_requests WHERE id = ? AND mentee_id = ?';

      database.getDb().get(authQuery, [id, userId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!row) {
          reject(new Error('Request not found or unauthorized'));
          return;
        }

        // 상태를 cancelled로 변경 (실제로는 삭제하지 않음)
        const updateQuery = `
          UPDATE match_requests 
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        database.getDb().run(updateQuery, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ ...row, status: 'cancelled' });
          }
        });
      });
    });
  }

  static async checkPendingRequests(menteeId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM match_requests 
        WHERE mentee_id = ? AND status = 'pending'
      `;
      
      database.getDb().get(query, [menteeId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  static async checkAcceptedRequests(mentorId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM match_requests 
        WHERE mentor_id = ? AND status = 'accepted'
      `;
      
      database.getDb().get(query, [mentorId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }
}

module.exports = MatchRequest;
