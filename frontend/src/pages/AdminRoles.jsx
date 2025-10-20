/**
 * Admin Roles Management Page
 * Provides comprehensive role and user management interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  UsersIcon,
  FolderIcon,
  EyeIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import useAuthStore from '../stores/authStore';
import usePermissions from '../hooks/usePermissions';

const AdminRoles = () => {
  // State management
  const [activeTab, setActiveTab] = useState('roles');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data state
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [projectMembers, setProjectMembers] = useState({});
  
  // Modal state
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showProjectMembersModal, setShowProjectMembersModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [assignForm, setAssignForm] = useState({
    userId: '',
    roleId: ''
  });
  const [projectForm, setProjectForm] = useState({
    projectId: '',
    userId: '',
    roleName: ''
  });

  // Available resources and actions for permission editor
  const availableResources = [
    { value: 'global', label: 'Global', description: 'System-wide access' },
    { value: 'project', label: 'Project', description: 'Project management' },
    { value: 'design', label: 'Design', description: 'Design workflows' },
    { value: 'prototype', label: 'Prototype', description: 'Prototype management' },
    { value: 'roles', label: 'Roles', description: 'Role management' },
    { value: 'users', label: 'Users', description: 'User management' }
  ];

  const availableActions = [
    { value: '*', label: 'All Actions', description: 'Full access' },
    { value: 'manage', label: 'Manage', description: 'Full management access' },
    { value: 'create', label: 'Create', description: 'Create new items' },
    { value: 'view', label: 'View', description: 'View items' },
    { value: 'update', label: 'Update', description: 'Edit items' },
    { value: 'delete', label: 'Delete', description: 'Delete items' },
    { value: 'prd', label: 'PRD', description: 'Product requirements' },
    { value: 'research', label: 'Research', description: 'User research' },
    { value: 'ux', label: 'UX', description: 'User experience design' },
    { value: 'ui', label: 'UI', description: 'User interface design' },
    { value: 'visual', label: 'Visual', description: 'Visual design' },
    { value: 'content', label: 'Content', description: 'Content strategy' },
    { value: 'export', label: 'Export', description: 'Export designs' }
  ];

  // Auth and permissions
  const { assignRoleToUser, removeRoleFromUser, assignProjectMember, removeProjectMember } = useAuthStore();
  const { canManageRoles, canManageUsers, isAdmin } = usePermissions();

  // Load data on component mount
  useEffect(() => {
    loadRoles();
    loadUsers();
    loadProjects();
  }, []);

  // Load roles
  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/roles');
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const response = await api.get('/admin/roles/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      // For now, we'll create mock projects since we don't have a projects API yet
      setProjects([
        { id: '1', name: 'Mobile Banking App', description: 'New mobile banking application' },
        { id: '2', name: 'Investment Platform', description: 'Investment and trading platform' },
        { id: '3', name: 'Credit Card App', description: 'Credit card management app' }
      ]);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Load user roles for a specific user
  const loadUserRoles = async (userId) => {
    try {
      const response = await api.get(`/admin/roles/users/${userId}/roles`);
      setUserRoles(prev => ({
        ...prev,
        [userId]: response.data.roles || []
      }));
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  // Load project members for a specific project
  const loadProjectMembers = async (projectId) => {
    try {
      const response = await api.get(`/admin/roles/projects/${projectId}/members`);
      setProjectMembers(prev => ({
        ...prev,
        [projectId]: response.data.members || []
      }));
    } catch (error) {
      console.error('Error loading project members:', error);
    }
  };

  // Create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/roles', roleForm);
      toast.success('Role created successfully');
      setShowCreateRoleModal(false);
      setRoleForm({ name: '', description: '', permissions: [] });
      loadRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Failed to create role');
    }
  };

  // Update role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/roles/${selectedRole.id}`, roleForm);
      toast.success('Role updated successfully');
      setShowEditRoleModal(false);
      setSelectedRole(null);
      setRoleForm({ name: '', description: '', permissions: [] });
      loadRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await api.delete(`/admin/roles/${roleId}`);
      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  // Assign role to user
  const handleAssignRole = async (e) => {
    e.preventDefault();
    try {
      await assignRoleToUser(assignForm.userId, assignForm.roleId);
      toast.success('Role assigned successfully');
      setShowAssignRoleModal(false);
      setAssignForm({ userId: '', roleId: '' });
      loadUserRoles(assignForm.userId);
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
    }
  };

  // Remove role from user
  const handleRemoveRole = async (userId, roleId) => {
    try {
      await removeRoleFromUser(userId, roleId);
      toast.success('Role removed successfully');
      loadUserRoles(userId);
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  // Assign project member
  const handleAssignProjectMember = async (e) => {
    e.preventDefault();
    try {
      await assignProjectMember(projectForm.projectId, projectForm.userId, projectForm.roleName);
      toast.success('Project member assigned successfully');
      setShowProjectMembersModal(false);
      setProjectForm({ projectId: '', userId: '', roleName: '' });
      loadProjectMembers(projectForm.projectId);
    } catch (error) {
      console.error('Error assigning project member:', error);
      toast.error('Failed to assign project member');
    }
  };

  // Remove project member
  const handleRemoveProjectMember = async (projectId, memberId) => {
    try {
      await removeProjectMember(projectId, memberId);
      toast.success('Project member removed successfully');
      loadProjectMembers(projectId);
    } catch (error) {
      console.error('Error removing project member:', error);
      toast.error('Failed to remove project member');
    }
  };

  // Permission management
  const togglePermission = (resource, action) => {
    setRoleForm(prev => {
      const existingPermission = prev.permissions.find(
        p => p.resource === resource && p.action === action
      );
      
      if (existingPermission) {
        return {
          ...prev,
          permissions: prev.permissions.filter(
            p => !(p.resource === resource && p.action === action)
          )
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, { resource, action, allowed: true }]
        };
      }
    });
  };

  const hasPermission = (resource, action) => {
    return roleForm.permissions.some(
      p => p.resource === resource && p.action === action
    );
  };

  // Open edit modal
  const openEditModal = (role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setShowEditRoleModal(true);
  };

  // Filter data based on search query
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage roles, users, and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'roles', name: 'Global Roles', icon: ShieldCheckIcon },
              { id: 'users', name: 'User Assignments', icon: UsersIcon },
              { id: 'projects', name: 'Project Members', icon: FolderIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {/* Global Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">System Roles</h2>
                {canManageRoles() && (
                  <button
                    onClick={() => setShowCreateRoleModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Role
                  </button>
                )}
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredRoles.map((role) => (
                    <li key={role.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-sm font-medium text-gray-900">
                              {role.name}
                            </h3>
                            {role.is_system_role && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                System
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {role.description}
                          </p>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {role.permissions?.slice(0, 5).map((permission, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                >
                                  {permission.resource}:{permission.action}
                                </span>
                              ))}
                              {role.permissions?.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{role.permissions.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {canManageRoles() && !role.is_system_role && (
                            <>
                              <button
                                onClick={() => openEditModal(role)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteRole(role.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* User Assignments Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">User Role Assignments</h2>
                {canManageUsers() && (
                  <button
                    onClick={() => setShowAssignRoleModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Assign Role
                  </button>
                )}
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <li key={user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              {userRoles[user.id]?.map((role, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {role.name}
                                  {canManageUsers() && (
                                    <button
                                      onClick={() => handleRemoveRole(user.id, role.id)}
                                      className="ml-1 text-blue-600 hover:text-blue-900"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => loadUserRoles(user.id)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Project Members Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Project Members</h2>
                <button
                  onClick={() => setShowProjectMembersModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Assign Member
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.description}</p>
                    </div>
                    <div className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {projectMembers[project.id]?.map((member, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {member.user_name} ({member.role_name})
                            <button
                              onClick={() => handleRemoveProjectMember(project.id, member.id)}
                              className="ml-2 text-purple-600 hover:text-purple-900"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </span>
                        ))}
                        {(!projectMembers[project.id] || projectMembers[project.id].length === 0) && (
                          <span className="text-sm text-gray-500">No members assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      <AnimatePresence>
        {showCreateRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Create New Role</h3>
                  <button
                    onClick={() => setShowCreateRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateRole} className="px-6 py-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., DESIGN_LEAD"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the role's responsibilities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {availableResources.map((resource) => (
                      <div key={resource.value} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {resource.label}
                          <span className="text-sm text-gray-500 ml-2">({resource.description})</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {availableActions.map((action) => (
                            <label
                              key={`${resource.value}-${action.value}`}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={hasPermission(resource.value, action.value)}
                                onChange={() => togglePermission(resource.value, action.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {action.label}
                                <span className="text-gray-500 ml-1">({action.description})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Create Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Role Modal */}
      <AnimatePresence>
        {showEditRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Edit Role</h3>
                  <button
                    onClick={() => setShowEditRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpdateRole} className="px-6 py-4 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {availableResources.map((resource) => (
                      <div key={resource.value} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {resource.label}
                          <span className="text-sm text-gray-500 ml-2">({resource.description})</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {availableActions.map((action) => (
                            <label
                              key={`${resource.value}-${action.value}`}
                              className="flex items-center space-x-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={hasPermission(resource.value, action.value)}
                                onChange={() => togglePermission(resource.value, action.value)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">
                                {action.label}
                                <span className="text-gray-500 ml-1">({action.description})</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditRoleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Update Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Role Modal */}
      <AnimatePresence>
        {showAssignRoleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Assign Role to User</h3>
                  <button
                    onClick={() => setShowAssignRoleModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignRole} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <select
                    value={assignForm.userId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={assignForm.roleId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, roleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssignRoleModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Assign Role
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Members Modal */}
      <AnimatePresence>
        {showProjectMembersModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Assign Project Member</h3>
                  <button
                    onClick={() => setShowProjectMembersModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignProjectMember} className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={projectForm.projectId}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, projectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User
                  </label>
                  <select
                    value={projectForm.userId}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Role
                  </label>
                  <select
                    value={projectForm.roleName}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, roleName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="PM">Project Manager</option>
                    <option value="UX_DESIGNER">UX Designer</option>
                    <option value="UI_DESIGNER">UI Designer</option>
                    <option value="VISUAL_DESIGNER">Visual Designer</option>
                    <option value="CONTENT_EDITOR">Content Editor</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectMembersModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
                  >
                    Assign Member
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRoles;
