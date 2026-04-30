const db = require('../config/database');

class Enquiry {
  static async create(enquiryData) {
    const { client_name, email, project_type, message } = enquiryData;
    const result = await db.runAsync(
      `INSERT INTO enquiries (client_name, email, project_type, message) 
       VALUES (?, ?, ?, ?)`,
      [client_name, email, project_type, message]
    );
    return await db.getAsync('SELECT * FROM enquiries WHERE id = ?', [result.lastID]);
  }

  static async getAll() {
    return await db.allAsync('SELECT * FROM enquiries ORDER BY timestamp DESC');
  }

  static async getById(id) {
    return await db.getAsync('SELECT * FROM enquiries WHERE id = ?', [id]);
  }

  static async delete(id) {
    const enquiry = await this.getById(id);
    await db.runAsync('DELETE FROM enquiries WHERE id = ?', [id]);
    return enquiry;
  }
}

module.exports = Enquiry;