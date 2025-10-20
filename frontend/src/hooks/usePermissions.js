/**
 * usePermissions Hook
 * Provides convenient permission checking functions
 */

import { useCallback } from 'react';
import useAuthStore from '../stores/authStore';

/**
 * Custom hook for permission checking
 * @returns {Object} Permission checking functions and user data
 */
export const usePermissions = () => {
  const {
    user,
    roles,
    userPermissions,
    projectRoles,
    can: canAction,
    hasRole,
    isAdmin,
    getRoleNames,
    getResourcePermissions,
    canAccessResource
  } = useAuthStore();

  // Memoized permission checking functions
  const can = useCallback((resource, action, projectId = null) => {
    return canAction(resource, action, projectId);
  }, [canAction]);

  const canManage = useCallback((resource, projectId = null) => {
    return canAction(resource, 'manage', projectId);
  }, [canAction]);

  const canCreate = useCallback((resource, projectId = null) => {
    return canAction(resource, 'create', projectId);
  }, [canAction]);

  const canView = useCallback((resource, projectId = null) => {
    return canAction(resource, 'view', projectId) || canAction(resource, 'manage', projectId);
  }, [canAction]);

  const canEdit = useCallback((resource, projectId = null) => {
    return canAction(resource, 'update', projectId) || canAction(resource, 'manage', projectId);
  }, [canAction]);

  const canDelete = useCallback((resource, projectId = null) => {
    return canAction(resource, 'delete', projectId) || canAction(resource, 'manage', projectId);
  }, [canAction]);

  // Design-specific permissions
  const canDoDesign = useCallback((action, projectId = null) => {
    return canAction('design', action, projectId);
  }, [canAction]);

  const canDoResearch = useCallback((projectId = null) => {
    return canDoDesign('research', projectId);
  }, [canDoDesign]);

  const canDoUX = useCallback((projectId = null) => {
    return canDoDesign('ux', projectId);
  }, [canDoDesign]);

  const canDoUI = useCallback((projectId = null) => {
    return canDoDesign('ui', projectId);
  }, [canDoDesign]);

  const canDoVisual = useCallback((projectId = null) => {
    return canDoDesign('visual', projectId);
  }, [canDoDesign]);

  const canDoContent = useCallback((projectId = null) => {
    return canDoDesign('content', projectId);
  }, [canDoDesign]);

  const canDoPRD = useCallback((projectId = null) => {
    return canDoDesign('prd', projectId);
  }, [canDoDesign]);

  const canExport = useCallback((projectId = null) => {
    return canDoDesign('export', projectId);
  }, [canDoDesign]);

  // Project permissions
  const canManageProject = useCallback((projectId = null) => {
    return canAction('project', 'manage', projectId);
  }, [canAction]);

  const canCreateProject = useCallback(() => {
    return canAction('project', 'create');
  }, [canAction]);

  const canViewProject = useCallback((projectId = null) => {
    return canView('project', projectId);
  }, [canView]);

  // Admin permissions
  const canManageRoles = useCallback(() => {
    return canAction('roles', 'manage');
  }, [canAction]);

  const canManageUsers = useCallback(() => {
    return canAction('users', 'manage');
  }, [canAction]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roleNames) => {
    if (!Array.isArray(roleNames)) {
      return hasRole(roleNames);
    }
    return roleNames.some(roleName => hasRole(roleName));
  }, [hasRole]);

  // Check if user has all of the specified roles
  const hasAllRoles = useCallback((roleNames) => {
    if (!Array.isArray(roleNames)) {
      return hasRole(roleNames);
    }
    return roleNames.every(roleName => hasRole(roleName));
  }, [hasRole]);

  // Get user's role names as a readable string
  const getRoleDisplay = useCallback(() => {
    const roleNames = getRoleNames();
    if (roleNames.length === 0) return 'No roles assigned';
    if (roleNames.length === 1) return roleNames[0];
    return `${roleNames.slice(0, -1).join(', ')} and ${roleNames[roleNames.length - 1]}`;
  }, [getRoleNames]);

  // Check if user can access admin panel
  const canAccessAdmin = useCallback(() => {
    return isAdmin() || canManageRoles() || canManageUsers();
  }, [isAdmin, canManageRoles, canManageUsers]);

  // Get project-specific role for current user
  const getProjectRole = useCallback((projectId) => {
    const members = projectRoles[projectId] || [];
    const currentUserMember = members.find(member => member.user_id === user?.id);
    return currentUserMember?.role_name || null;
  }, [projectRoles, user?.id]);

  return {
    // User data
    user,
    roles,
    userPermissions,
    projectRoles,
    isAdmin: isAdmin(),
    roleNames: getRoleNames(),
    roleDisplay: getRoleDisplay(),

    // Basic permission checks
    can,
    canManage,
    canCreate,
    canView,
    canEdit,
    canDelete,

    // Design-specific permissions
    canDoDesign,
    canDoResearch,
    canDoUX,
    canDoUI,
    canDoVisual,
    canDoContent,
    canDoPRD,
    canExport,

    // Project permissions
    canManageProject,
    canCreateProject,
    canViewProject,

    // Admin permissions
    canManageRoles,
    canManageUsers,
    canAccessAdmin,

    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,

    // Resource access
    canAccessResource,
    getResourcePermissions,

    // Project-specific
    getProjectRole
  };
};

export default usePermissions;
