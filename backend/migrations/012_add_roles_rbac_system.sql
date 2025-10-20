-- RBAC System Migration for Avinci Admin Panel
-- This migration adds comprehensive role-based access control for the design feature

-- Roles table for defining system roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]', -- Array of {resource: string, action: string, allowed: boolean}
    is_system_role BOOLEAN DEFAULT false, -- System roles cannot be deleted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- User-Role junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES admin_users(id),
    UNIQUE(user_id, role_id)
);

-- Project members table for project-specific role assignments
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL, -- Will reference projects table when created
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role_name VARCHAR(50) NOT NULL, -- 'PM', 'UX_DESIGNER', 'UI_DESIGNER', etc.
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES admin_users(id),
    UNIQUE(project_id, user_id)
);

-- Projects table (if not exists) for design workflows
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- Add foreign key constraint for project_members
ALTER TABLE project_members 
ADD CONSTRAINT fk_project_members_project_id 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Insert default system roles with comprehensive permissions
INSERT INTO roles (name, description, permissions, is_system_role, created_by) VALUES
(
    'ADMIN',
    'Full system administrator with complete access',
    '[
        {"resource": "prototype", "action": "import", "allowed": true},
        {"resource": "prototype", "action": "export", "allowed": true},
        {"resource": "prototype", "action": "manage", "allowed": true},
        {"resource": "project", "action": "manage", "allowed": true},
        {"resource": "project", "action": "create", "allowed": true},
        {"resource": "project", "action": "delete", "allowed": true},
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "design", "action": "research", "allowed": true},
        {"resource": "design", "action": "ux", "allowed": true},
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "design", "action": "visual", "allowed": true},
        {"resource": "design", "action": "content", "allowed": true},
        {"resource": "design", "action": "export", "allowed": true},
        {"resource": "design", "action": "manage", "allowed": true},
        {"resource": "global", "action": "*", "allowed": true},
        {"resource": "roles", "action": "manage", "allowed": true},
        {"resource": "users", "action": "manage", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'PROJECT_ADMIN',
    'Project administrator with project management capabilities',
    '[
        {"resource": "project", "action": "manage", "allowed": true},
        {"resource": "project", "action": "create", "allowed": true},
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "design", "action": "research", "allowed": true},
        {"resource": "design", "action": "ux", "allowed": true},
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "design", "action": "visual", "allowed": true},
        {"resource": "design", "action": "content", "allowed": true},
        {"resource": "design", "action": "export", "allowed": true},
        {"resource": "design", "action": "manage", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'PM',
    'Product Manager with PRD and project oversight capabilities',
    '[
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "design", "action": "research", "allowed": true},
        {"resource": "design", "action": "ux", "allowed": true},
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "design", "action": "visual", "allowed": true},
        {"resource": "design", "action": "content", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'RESEARCHER',
    'User Research specialist with research and analysis capabilities',
    '[
        {"resource": "design", "action": "research", "allowed": true},
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'UX_DESIGNER',
    'UX Designer with user experience design capabilities',
    '[
        {"resource": "design", "action": "ux", "allowed": true},
        {"resource": "design", "action": "research", "allowed": true},
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'UI_DESIGNER',
    'UI Designer with interface design capabilities',
    '[
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "design", "action": "ux", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'VISUAL_DESIGNER',
    'Visual Designer with visual design and branding capabilities',
    '[
        {"resource": "design", "action": "visual", "allowed": true},
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'CONTENT_EDITOR',
    'Content Editor with content strategy and copywriting capabilities',
    '[
        {"resource": "design", "action": "content", "allowed": true},
        {"resource": "design", "action": "prd", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
),
(
    'DEVELOPER',
    'Developer with design export and implementation capabilities',
    '[
        {"resource": "design", "action": "export", "allowed": true},
        {"resource": "design", "action": "ui", "allowed": true},
        {"resource": "project", "action": "view", "allowed": true}
    ]'::jsonb,
    true,
    (SELECT id FROM admin_users LIMIT 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_system_role ON roles(is_system_role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

-- Assign ADMIN role to existing admin users
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
    au.id,
    r.id,
    au.id
FROM admin_users au
CROSS JOIN roles r
WHERE r.name = 'ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = au.id AND ur.role_id = r.id
);

-- Create updated_at trigger for roles table
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
