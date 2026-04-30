const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
  static async findByUsername(username) {
    return await db.getAsync('SELECT * FROM admins WHERE username = ?', [username]);
  }

  static async seedDefaultAdmin() {
    const admin = await db.getAsync('SELECT * FROM admins LIMIT 1');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Nexavo@2024', 10);
      await db.runAsync(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['nexavo', hashedPassword]
      );
      console.log('✅ Default admin created: username=nexavo, password=Nexavo@2024');
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Admin;