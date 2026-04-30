const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const { category } = req.query;
    const projects = await Project.getAll(category);
    res.json({ success: true, projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get single project
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.getById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project (Admin only)
const createProject = async (req, res) => {
  try {
    const { title, description, category, live_url } = req.body;
    
    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }
    
    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ error: 'Project thumbnail is required' });
    }
    
    const project = await Project.create({
      title,
      description,
      category,
      image_url,
      live_url: live_url || null,
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project (Admin only)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, live_url } = req.body;
    
    const existingProject = await Project.getById(id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    let image_url = existingProject.image_url;
    
    // Handle new image upload
    if (req.file) {
      // Delete old image
      const oldImagePath = path.join(__dirname, '../../', existingProject.image_url);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      image_url = `/uploads/${req.file.filename}`;
    }
    
    const project = await Project.update(id, {
      title: title || existingProject.title,
      description: description || existingProject.description,
      category: category || existingProject.category,
      image_url,
      live_url: live_url !== undefined ? live_url : existingProject.live_url,
    });
    
    res.json({ success: true, project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project (Admin only)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await Project.getById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete image file
    const imagePath = path.join(__dirname, '../../', project.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await Project.delete(id);
    
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};