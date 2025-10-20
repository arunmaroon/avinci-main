/**
 * Admin Roles Management API
 * Provides CRUD operations for roles and user assignments
 * Requires ADMIN role for all operations
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// Middleware to check if user has admin permissions
const requireAdmin = async (req, res, next) => {
    try {
        // For now, we'll use a simple check - in production, this would verify JWT token
        // and check user's roles in the database
        const userId = req.headers['x-user-id'] || req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Check if user has ADMIN role
        const roleCheck = await pool.query(`
            SELECT r.name 
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1 AND r.name = 'ADMIN'
        `, [userId]);

        if (roleCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Apply admin middleware to all routes
router.use(requireAdmin);

/**
 * GET /api/admin/roles
 * Fetch all roles with permissions
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                description,
                permissions,
                is_system_role,
                created_at,
                updated_at
            FROM roles 
            ORDER BY name
        `);

        res.json({
            success: true,
            roles: result.rows
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
});

/**
 * POST /api/admin/roles
 * Create a new role
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, permissions = [] } = req.body;

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Role name is required' });
        }

        // Validate permissions format
        if (!Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permissions must be an array' });
        }

        // Validate each permission
        for (const permission of permissions) {
            if (!permission.resource || !permission.action || typeof permission.allowed !== 'boolean') {
                return res.status(400).json({ 
                    error: 'Each permission must have resource, action, and allowed fields' 
                });
            }
        }

        // Check if role name already exists
        const existingRole = await pool.query(
            'SELECT id FROM roles WHERE name = $1',
            [name.trim()]
        );

        if (existingRole.rows.length > 0) {
            return res.status(409).json({ error: 'Role name already exists' });
        }

        // Create the role
        const result = await pool.query(`
            INSERT INTO roles (id, name, description, permissions, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [uuidv4(), name.trim(), description || null, JSON.stringify(permissions), req.userId]);

        res.status(201).json({
            success: true,
            role: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
});

/**
 * PUT /api/admin/roles/:id
 * Update a role by ID
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, permissions } = req.body;

        // Check if role exists
        const existingRole = await pool.query(
            'SELECT id, is_system_role FROM roles WHERE id = $1',
            [id]
        );

        if (existingRole.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Prevent modification of system roles
        if (existingRole.rows[0].is_system_role) {
            return res.status(403).json({ error: 'Cannot modify system roles' });
        }

        // Validate permissions if provided
        if (permissions && !Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permissions must be an array' });
        }

        // Check if new name conflicts (if name is being changed)
        if (name && name !== existingRole.rows[0].name) {
            const nameConflict = await pool.query(
                'SELECT id FROM roles WHERE name = $1 AND id != $2',
                [name.trim(), id]
            );

            if (nameConflict.rows.length > 0) {
                return res.status(409).json({ error: 'Role name already exists' });
            }
        }

        // Update the role
        const updateFields = [];
        const updateValues = [];
        let paramCount = 1;

        if (name !== undefined) {
            updateFields.push(`name = $${paramCount++}`);
            updateValues.push(name.trim());
        }

        if (description !== undefined) {
            updateFields.push(`description = $${paramCount++}`);
            updateValues.push(description);
        }

        if (permissions !== undefined) {
            updateFields.push(`permissions = $${paramCount++}`);
            updateValues.push(JSON.stringify(permissions));
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const result = await pool.query(`
            UPDATE roles 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `, [...updateValues]);

        res.json({
            success: true,
            role: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating role:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

/**
 * DELETE /api/admin/roles/:id
 * Delete a role by ID
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if role exists
        const existingRole = await pool.query(
            'SELECT id, is_system_role FROM roles WHERE id = $1',
            [id]
        );

        if (existingRole.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Prevent deletion of system roles
        if (existingRole.rows[0].is_system_role) {
            return res.status(403).json({ error: 'Cannot delete system roles' });
        }

        // Check if role is assigned to any users
        const userAssignments = await pool.query(
            'SELECT COUNT(*) as count FROM user_roles WHERE role_id = $1',
            [id]
        );

        if (parseInt(userAssignments.rows[0].count) > 0) {
            return res.status(409).json({ 
                error: 'Cannot delete role that is assigned to users. Remove all assignments first.' 
            });
        }

        // Delete the role
        await pool.query('DELETE FROM roles WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        res.status(500).json({ error: 'Failed to delete role' });
    }
});

/**
 * GET /api/admin/users/:userId/roles
 * Fetch user's assigned roles
 */
router.get('/users/:userId/roles', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(`
            SELECT 
                r.id,
                r.name,
                r.description,
                r.permissions,
                ur.assigned_at,
                ur.assigned_by
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = $1
            ORDER BY ur.assigned_at DESC
        `, [userId]);

        res.json({
            success: true,
            roles: result.rows
        });
    } catch (error) {
        console.error('Error fetching user roles:', error);
        res.status(500).json({ error: 'Failed to fetch user roles' });
    }
});

/**
 * POST /api/admin/users/:userId/roles
 * Assign a role to a user
 */
router.post('/users/:userId/roles', async (req, res) => {
    try {
        const { userId } = req.params;
        const { roleId } = req.body;

        if (!roleId) {
            return res.status(400).json({ error: 'Role ID is required' });
        }

        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM admin_users WHERE id = $1',
            [userId]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if role exists
        const roleExists = await pool.query(
            'SELECT id FROM roles WHERE id = $1',
            [roleId]
        );

        if (roleExists.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        // Check if assignment already exists
        const existingAssignment = await pool.query(
            'SELECT id FROM user_roles WHERE user_id = $1 AND role_id = $2',
            [userId, roleId]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(409).json({ error: 'Role already assigned to user' });
        }

        // Create the assignment
        const result = await pool.query(`
            INSERT INTO user_roles (id, user_id, role_id, assigned_by)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [uuidv4(), userId, roleId, req.userId]);

        res.status(201).json({
            success: true,
            assignment: result.rows[0]
        });
    } catch (error) {
        console.error('Error assigning role:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
});

/**
 * DELETE /api/admin/users/:userId/roles/:roleId
 * Remove role assignment from user
 */
router.delete('/users/:userId/roles/:roleId', async (req, res) => {
    try {
        const { userId, roleId } = req.params;

        // Check if assignment exists
        const assignment = await pool.query(
            'SELECT id FROM user_roles WHERE user_id = $1 AND role_id = $2',
            [userId, roleId]
        );

        if (assignment.rows.length === 0) {
            return res.status(404).json({ error: 'Role assignment not found' });
        }

        // Remove the assignment
        await pool.query(
            'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
            [userId, roleId]
        );

        res.json({
            success: true,
            message: 'Role assignment removed successfully'
        });
    } catch (error) {
        console.error('Error removing role assignment:', error);
        res.status(500).json({ error: 'Failed to remove role assignment' });
    }
});

/**
 * GET /api/admin/users
 * Fetch all users for role assignment
 */
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                email,
                role as current_role,
                is_active,
                created_at,
                last_login
            FROM admin_users 
            ORDER BY name
        `);

        res.json({
            success: true,
            users: result.rows
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

/**
 * POST /api/projects/:projectId/members
 * Assign project-specific role to user
 */
router.post('/projects/:projectId/members', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, roleName } = req.body;

        if (!userId || !roleName) {
            return res.status(400).json({ error: 'User ID and role name are required' });
        }

        // Check if project exists
        const projectExists = await pool.query(
            'SELECT id FROM projects WHERE id = $1',
            [projectId]
        );

        if (projectExists.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check if user exists
        const userExists = await pool.query(
            'SELECT id FROM admin_users WHERE id = $1',
            [userId]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if assignment already exists
        const existingAssignment = await pool.query(
            'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
            [projectId, userId]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(409).json({ error: 'User already assigned to project' });
        }

        // Create the project member assignment
        const result = await pool.query(`
            INSERT INTO project_members (id, project_id, user_id, role_name, assigned_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [uuidv4(), projectId, userId, roleName, req.userId]);

        res.status(201).json({
            success: true,
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Error assigning project member:', error);
        res.status(500).json({ error: 'Failed to assign project member' });
    }
});

/**
 * GET /api/projects/:projectId/members
 * Fetch project members
 */
router.get('/projects/:projectId/members', async (req, res) => {
    try {
        const { projectId } = req.params;

        const result = await pool.query(`
            SELECT 
                pm.id,
                pm.role_name,
                pm.assigned_at,
                u.name as user_name,
                u.email as user_email
            FROM project_members pm
            JOIN admin_users u ON pm.user_id = u.id
            WHERE pm.project_id = $1
            ORDER BY pm.assigned_at DESC
        `, [projectId]);

        res.json({
            success: true,
            members: result.rows
        });
    } catch (error) {
        console.error('Error fetching project members:', error);
        res.status(500).json({ error: 'Failed to fetch project members' });
    }
});

/**
 * DELETE /api/projects/:projectId/members/:memberId
 * Remove project member
 */
router.delete('/projects/:projectId/members/:memberId', async (req, res) => {
    try {
        const { projectId, memberId } = req.params;

        // Check if member assignment exists
        const assignment = await pool.query(
            'SELECT id FROM project_members WHERE id = $1 AND project_id = $2',
            [memberId, projectId]
        );

        if (assignment.rows.length === 0) {
            return res.status(404).json({ error: 'Project member assignment not found' });
        }

        // Remove the assignment
        await pool.query(
            'DELETE FROM project_members WHERE id = $1',
            [memberId]
        );

        res.json({
            success: true,
            message: 'Project member removed successfully'
        });
    } catch (error) {
        console.error('Error removing project member:', error);
        res.status(500).json({ error: 'Failed to remove project member' });
    }
});

module.exports = router;
