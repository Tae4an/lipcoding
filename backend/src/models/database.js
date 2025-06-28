const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, '../../database.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async initializeTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('mentor', 'mentee')) NOT NULL,
        bio TEXT DEFAULT '',
        image_data TEXT,
        skills TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createMatchRequestsTable = `
      CREATE TABLE IF NOT EXISTS match_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentor_id INTEGER NOT NULL,
        mentee_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'cancelled')) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users(id),
        FOREIGN KEY (mentee_id) REFERENCES users(id),
        UNIQUE(mentor_id, mentee_id)
      )
    `;

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(createUsersTable, (err) => {
          if (err) {
            console.error('Error creating users table:', err);
            reject(err);
            return;
          }
          console.log('Users table created or already exists');
        });

        this.db.run(createMatchRequestsTable, (err) => {
          if (err) {
            console.error('Error creating match_requests table:', err);
            reject(err);
            return;
          }
          console.log('Match requests table created or already exists');
          resolve();
        });
      });
    });
  }

  getDb() {
    return this.db;
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
