/**
 * Auth Store with Roles and Permissions
 * Manages user authentication, roles, and permissions for RBAC
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Types for TypeScript-like documentation
/**
 * @typedef {Object} Role
 * @property {string} id - Role ID
 * @property {string} name - Role name (e.g., 'ADMIN', 'PM', 'UX_DESIGNER')
 * @property {string} description - Role description
 * @property {Array<Permission>} permissions - Array of permissions
 * @property {boolean} is_system_role - Whether this is a system role
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Permission
 * @property {string} resource - Resource name (e.g., 'design', 'project', 'global')
 * @property {string} action - Action name (e.g., 'manage', 'create', 'view', '*')
 * @property {boolean} allowed - Whether the action is allowed
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - Current role
 * @property {boolean} is_active - Whether user is active
 * @property {string} created_at - Creation timestamp
 * @property {string} last_login - Last login timestamp
 */

/**
 * @typedef {Object} ProjectMember
 * @property {string} id - Member ID
 * @property {string} role_name - Project-specific role name
 * @property {string} assigned_at - Assignment timestamp
 * @property {string} user_name - User name
 * @property {string} user_email - User email
 */

const useAuthStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to check for existing session

      // Roles and permissions
      roles: [],
      userPermissions: [],
      projectRoles: {}, // Map of projectId to assigned roles

      // Actions
      initialize: () => {
        // This will be called after the store is rehydrated
        set({ isLoading: false });
      },

      login: async (userData) => {
        set({ isLoading: true });
        try {
          // Store user data
          set({ 
            user: userData, 
            isAuthenticated: true,
            isLoading: false 
          });

          // Fetch user roles and permissions
          await get().fetchUserRoles();
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          roles: [],
          userPermissions: [],
          projectRoles: {},
          isLoading: false
        });
      },

      // Fetch user roles and compute permissions
      fetchUserRoles: async () => {
        const { user } = get();
        if (!user?.id) return;

        try {
          // For demo purposes, create roles based on user's role
          const roleMap = {
            'admin': {
              name: 'ADMIN',
              permissions: [
                { resource: 'global', action: '*', allowed: true },
                { resource: 'roles', action: 'manage', allowed: true },
                { resource: 'users', action: 'manage', allowed: true },
                { resource: 'project', action: 'manage', allowed: true },
                { resource: 'design', action: 'manage', allowed: true }
              ]
            },
            'pm': {
              name: 'PM',
              permissions: [
                { resource: 'project', action: 'manage', allowed: true },
                { resource: 'design', action: 'prd', allowed: true },
                { resource: 'design', action: 'research', allowed: true },
                { resource: 'design', action: 'ux', allowed: true },
                { resource: 'design', action: 'ui', allowed: true },
                { resource: 'design', action: 'visual', allowed: true },
                { resource: 'design', action: 'content', allowed: true }
              ]
            },
            'researcher': {
              name: 'RESEARCHER',
              permissions: [
                { resource: 'design', action: 'research', allowed: true },
                { resource: 'design', action: 'prd', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            },
            'ux_designer': {
              name: 'UX_DESIGNER',
              permissions: [
                { resource: 'design', action: 'ux', allowed: true },
                { resource: 'design', action: 'research', allowed: true },
                { resource: 'design', action: 'prd', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            },
            'ui_designer': {
              name: 'UI_DESIGNER',
              permissions: [
                { resource: 'design', action: 'ui', allowed: true },
                { resource: 'design', action: 'ux', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            },
            'visual_designer': {
              name: 'VISUAL_DESIGNER',
              permissions: [
                { resource: 'design', action: 'visual', allowed: true },
                { resource: 'design', action: 'ui', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            },
            'content_editor': {
              name: 'CONTENT_EDITOR',
              permissions: [
                { resource: 'design', action: 'content', allowed: true },
                { resource: 'design', action: 'prd', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            },
            'developer': {
              name: 'DEVELOPER',
              permissions: [
                { resource: 'design', action: 'export', allowed: true },
                { resource: 'design', action: 'ui', allowed: true },
                { resource: 'project', action: 'view', allowed: true }
              ]
            }
          };

          const userRole = roleMap[user.role] || roleMap['admin'];
          const roles = [userRole];

          set({ roles });

          // Compute user permissions from roles
          const permissions = [];
          roles.forEach(role => {
            if (role.permissions) {
              role.permissions.forEach(permission => {
                if (permission.allowed) {
                  permissions.push({
                    resource: permission.resource,
                    action: permission.action
                  });
                }
              });
            }
          });

          set({ userPermissions: permissions });
          console.log('User roles and permissions set:', { roles, permissions });
        } catch (error) {
          console.error('Error fetching user roles:', error);
          // Don't throw error to avoid breaking login flow
        }
      },

      // Assign role to user
      assignRoleToUser: async (userId, roleId) => {
        try {
          await api.post(`/admin/roles/users/${userId}/roles`, { roleId });
          
          // If assigning to current user, refetch roles
          const { user } = get();
          if (user?.id === userId) {
            await get().fetchUserRoles();
          }
        } catch (error) {
          console.error('Error assigning role:', error);
          throw error;
        }
      },

      // Remove role from user
      removeRoleFromUser: async (userId, roleId) => {
        try {
          await api.delete(`/admin/roles/users/${userId}/roles/${roleId}`);
          
          // If removing from current user, refetch roles
          const { user } = get();
          if (user?.id === userId) {
            await get().fetchUserRoles();
          }
        } catch (error) {
          console.error('Error removing role:', error);
          throw error;
        }
      },

      // Fetch project members
      fetchProjectMembers: async (projectId) => {
        try {
          const response = await api.get(`/admin/roles/projects/${projectId}/members`);
          const members = response.data.members || [];
          
          // Update project roles
          const { projectRoles } = get();
          set({
            projectRoles: {
              ...projectRoles,
              [projectId]: members
            }
          });

          return members;
        } catch (error) {
          console.error('Error fetching project members:', error);
          throw error;
        }
      },

      // Assign project member
      assignProjectMember: async (projectId, userId, roleName) => {
        try {
          await api.post(`/admin/roles/projects/${projectId}/members`, {
            userId,
            roleName
          });
          
          // Refetch project members
          await get().fetchProjectMembers(projectId);
        } catch (error) {
          console.error('Error assigning project member:', error);
          throw error;
        }
      },

      // Remove project member
      removeProjectMember: async (projectId, memberId) => {
        try {
          await api.delete(`/admin/roles/projects/${projectId}/members/${memberId}`);
          
          // Refetch project members
          await get().fetchProjectMembers(projectId);
        } catch (error) {
          console.error('Error removing project member:', error);
          throw error;
        }
      },

      // Permission checking
      can: (resource, action, projectId = null) => {
        const { userPermissions, projectRoles } = get();

        // Check global permissions first
        const hasGlobalPermission = userPermissions.some(
          p => p.resource === 'global' && p.action === '*'
        );
        if (hasGlobalPermission) return true;

        // Check specific resource-action permission
        const hasPermission = userPermissions.some(
          p => p.resource === resource && p.action === action
        );
        if (hasPermission) return true;

        // Check project-specific permissions if projectId provided
        if (projectId) {
          const projectMembers = projectRoles[projectId] || [];
          // For now, we'll implement basic project role checking
          // In a full implementation, you'd check the project member's role permissions
          return projectMembers.length > 0;
        }

        return false;
      },

      // Check if user has specific role
      hasRole: (roleName) => {
        const { roles } = get();
        return roles.some(role => role.name === roleName);
      },

      // Check if user is admin
      isAdmin: () => {
        return get().hasRole('ADMIN');
      },

      // Get user's roles as array of names
      getRoleNames: () => {
        const { roles } = get();
        return roles.map(role => role.name);
      },

      // Get permissions for a specific resource
      getResourcePermissions: (resource) => {
        const { userPermissions } = get();
        return userPermissions.filter(p => p.resource === resource);
      },

      // Check if user can perform any action on a resource
      canAccessResource: (resource) => {
        const { userPermissions } = get();
        
        // Check global access
        const hasGlobalAccess = userPermissions.some(
          p => p.resource === 'global' && p.action === '*'
        );
        if (hasGlobalAccess) return true;

        // Check resource-specific access
        return userPermissions.some(p => p.resource === resource);
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        roles: state.roles,
        userPermissions: state.userPermissions
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && state?.isAuthenticated) {
          console.log('Rehydrating auth state:', state.user);
        }
      }
    }
  )
);

export default useAuthStore;
