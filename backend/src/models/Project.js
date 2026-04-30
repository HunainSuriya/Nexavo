const db = require('../config/database');

class Project {
  static async getAll(category = null) {
    if (category && category !== 'all') {
      return await db.allAsync(
        'SELECT * FROM projects WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
    }
    return await db.allAsync('SELECT * FROM projects ORDER BY created_at DESC');
  }

  static async getById(id) {
    return await db.getAsync('SELECT * FROM projects WHERE id = ?', [id]);
  }

  static async create(projectData) {
    const { title, description, category, image_url, live_url } = projectData;
    const result = await db.runAsync(
      `INSERT INTO projects (title, description, category, image_url, live_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, category, image_url, live_url]
    );
    return await this.getById(result.lastID);
  }

  static async update(id, projectData) {
    const { title, description, category, image_url, live_url } = projectData;
    await db.runAsync(
      `UPDATE projects 
       SET title = ?, description = ?, category = ?, image_url = ?, live_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, category, image_url, live_url, id]
    );
    return await this.getById(id);
  }

  static async delete(id) {
    const project = await this.getById(id);
    await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
    return project;
  }
}

module.exports = Project;