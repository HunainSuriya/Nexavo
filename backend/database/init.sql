-- Create database (run this first in PostgreSQL)
-- CREATE DATABASE nexavo_db;

-- Drop existing tables (if any)
DROP TABLE IF EXISTS enquiries CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    live_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enquiries table
CREATE TABLE enquiries (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_enquiries_timestamp ON enquiries(timestamp);
CREATE INDEX idx_admins_username ON admins(username);

-- Insert default admin (password: Nexavo@2024)
-- Run this after backend is started, it will be auto-seeded
-- But here's the SQL for reference:
-- INSERT INTO admins (username, password_hash) 
-- VALUES ('nexavo', '$2b$10$YourHashedPasswordWillBeGeneratedByBackend');

-- Sample projects for testing (optional)
INSERT INTO projects (title, description, category, image_url, live_url) VALUES
('ERPNext Implementation for Manufacturing Co.', 'Complete ERP solution with inventory management and production planning.', 'ERPNext', '/uploads/sample-erp.jpg', 'https://example.com'),
('E-commerce Platform for Retail Brand', 'Modern full-stack e-commerce with payment integration.', 'Web Development', '/uploads/sample-web.jpg', 'https://example.com'),
('Desktop POS System for Restaurant', 'Offline-capable POS system with reporting dashboard.', 'Desktop App', '/uploads/sample-desktop.jpg', 'https://example.com')
ON CONFLICT DO NOTHING;