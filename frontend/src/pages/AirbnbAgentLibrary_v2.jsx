import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  BriefcaseIcon,
  UserGroupIcon,
  TruckIcon,
  ScissorsIcon,
  HomeModernIcon,
  CpuChipIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  EllipsisVerticalIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import OptimizedAgentHeader from '../components/OptimizedAgentHeader';
import AirbnbAgentDetailModal from '../components/AirbnbAgentDetailModal';
import EnhancedGenerateModal from '../components/EnhancedGenerateModal';
import api from '../utils/api';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';
import { toast } from 'react-hot-toast';

const formatTitleCase = (value = '') => {
  if (!value) return '';
  const clean = value.toString().replace(/_/g, ' ').toLowerCase();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const deriveEnglishLevel = (agent) => {
  if (agent.speech_patterns?.english_level) return agent.speech_patterns.english_level;
  if (agent.english_savvy) return agent.english_savvy;
  if (agent.communication_style?.english_proficiency) return agent.communication_style.english_proficiency;
  if (agent.communication_style?.english_level) return agent.communication_style.english_level;
  return 'Intermediate';
};

const normalizeStatus = (status) => {
  if (typeof status === 'boolean') {
    return status ? 'active' : 'archived';
  }
  if (typeof status === 'string') {
    return status.toLowerCase();
  }
  return 'active';
};

// Get profession-specific icon
const getProfessionIcon = (occupation) => {
  const occupationLower = (occupation || '').toLowerCase();
  
  if (occupationLower.includes('driver') || occupationLower.includes('delivery')) {
    return TruckIcon;
  }
  if (occupationLower.includes('manager') || occupationLower.includes('hr')) {
    return UserGroupIcon;
  }
  if (occupationLower.includes('analyst') || occupationLower.includes('consultant')) {
    return CpuChipIcon;
  }
  if (occupationLower.includes('designer') || occupationLower.includes('design')) {
    return AcademicCapIcon;
  }
  if (occupationLower.includes('tailor') || occupationLower.includes('craft')) {
    return ScissorsIcon;
  }
  if (occupationLower.includes('housekeeping') || occupationLower.includes('staff')) {
    return HomeModernIcon;
  }
  if (occupationLower.includes('restaurant') || occupationLower.includes('hotel')) {
    return ShoppingBagIcon;
  }
  if (occupationLower.includes('engineer') || occupationLower.includes('developer')) {
    return WrenchScrewdriverIcon;
  }
  if (occupationLower.includes('business') || occupationLower.includes('office')) {
    return BuildingOfficeIcon;
  }
  
  return BriefcaseIcon; // Default
};

// Vibrant color palette for agent categories with improved contrast
const categoryColors = [
  { bg: 'from-lime-400 to-lime-300', badge: 'text-lime-800 border-lime-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-purple-400 to-purple-300', badge: 'text-purple-800 border-purple-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-cyan-400 to-cyan-300', badge: 'text-cyan-800 border-cyan-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-pink-400 to-pink-300', badge: 'text-pink-800 border-pink-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-amber-400 to-amber-300', badge: 'text-amber-800 border-amber-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-emerald-400 to-emerald-300', badge: 'text-emerald-800 border-emerald-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-rose-400 to-rose-300', badge: 'text-rose-800 border-rose-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
  { bg: 'from-indigo-400 to-indigo-300', badge: 'text-indigo-800 border-indigo-600/40 shadow-sm', style: { backgroundColor: 'rgba(255, 255, 255, 0.3)' } },
];

const AirbnbAgentLibrary_v2 = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [modalAgent, setModalAgent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // Default sort by creation time
  const [sortOrder, setSortOrder] = useState('desc'); // Default to newest first
  const searchInputRef = useRef(null);
  const [searchKey, setSearchKey] = useState(0); // Key to force re-render
  const [deletedAgentIds, setDeletedAgentIds] = useState(new Set());

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    age: 'all',
    techLevel: 'all',
    englishLevel: 'all',
    location: 'all',
    product: 'all',
  });

  useEffect(() => {
    // IMMEDIATELY clear search before anything else
    setSearchTerm('');
    
    // Clear URL parameters
    const url = new URL(window.location);
    if (url.searchParams.has('search') || url.searchParams.has('q')) {
      url.searchParams.delete('search');
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }
    
    // Fetch agents
    fetchAgents();
    
    // Force clear the input field directly and immediately
    const clearInput = () => {
      if (searchInputRef.current) {
        searchInputRef.current.value = '';
        searchInputRef.current.defaultValue = '';
        searchInputRef.current.setAttribute('value', '');
        searchInputRef.current.blur();
      }
      setSearchTerm('');
    };
    
    // Clear immediately and repeatedly
    clearInput();
    requestAnimationFrame(clearInput);
    setTimeout(clearInput, 0);
    setTimeout(clearInput, 10);
    setTimeout(clearInput, 50);
    setTimeout(clearInput, 100);
    setTimeout(clearInput, 200);
    setTimeout(clearInput, 500);
    setTimeout(clearInput, 1000);
  }, []);

  // Debug: Watch for unexpected searchTerm changes and PREVENT them
  useEffect(() => {
    if (searchTerm && searchTerm !== '') {
      console.log('⚠️ Search term changed to:', searchTerm);
      console.trace('Stack trace for search term change');
      
      // If search term is not empty and we didn't set it intentionally, clear it
      // This prevents browser autocomplete from setting values
      const timer = setTimeout(() => {
        if (searchInputRef.current && searchInputRef.current.value !== searchTerm) {
          console.log('🚫 Blocking unwanted search value');
          searchInputRef.current.value = '';
          setSearchTerm('');
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  // Force clear search function
  const forceClearSearch = () => {
    console.log('🧹 Force clearing search');
    setSearchTerm('');
    setSearchKey(prev => prev + 1);
    if (searchInputRef.current) {
      // Completely reset the input
      searchInputRef.current.value = '';
      searchInputRef.current.blur();
      // Force clear any browser autocomplete
      searchInputRef.current.setAttribute('autocomplete', 'new-password');
      searchInputRef.current.setAttribute('autocorrect', 'off');
      searchInputRef.current.setAttribute('autocapitalize', 'off');
      searchInputRef.current.setAttribute('spellcheck', 'false');
      searchInputRef.current.setAttribute('data-lpignore', 'true');
      searchInputRef.current.setAttribute('data-1p-ignore', 'true');
      // Force a re-render by changing the key
      searchInputRef.current.setAttribute('key', Date.now().toString());
      
      // Additional aggressive clearing
      searchInputRef.current.setAttribute('value', '');
      searchInputRef.current.defaultValue = '';
      searchInputRef.current.placeholder = 'Search users...';
      
      // Clear any browser form data
      if (searchInputRef.current.form) {
        searchInputRef.current.form.reset();
      }
    }
  };

  // Add global clear function for debugging
  useEffect(() => {
    window.clearSearch = forceClearSearch;
    // Clear any cached search data from browser storage
    try {
      localStorage.removeItem('searchTerm');
      localStorage.removeItem('user-search-field');
      sessionStorage.removeItem('searchTerm');
      sessionStorage.removeItem('user-search-field');
    } catch (e) {
      console.log('No cached search data to clear');
    }
    return () => {
      delete window.clearSearch;
    };
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching agents from API...');
      const response = await api.get(`/agents/v5?view=short&_t=${Date.now()}`);
      console.log('📊 Raw API response:', response.data?.length, 'agents');
      const agentsData = response.data
        .filter(agent => !deletedAgentIds.has(agent.id)) // Filter out deleted agents
        .map(agent => ({
          ...agent,
          statusLabel: formatTitleCase(normalizeStatus(agent.status)),
          locationLabel: agent.location || 'Unknown',
          englishLevel: deriveEnglishLevel(agent),
        }));
      console.log('✅ Processed agents:', agentsData.length, 'agents');
      console.log('👥 Agent names:', agentsData.map(a => a.name));
      setAgents(agentsData);
    } catch (error) {
      console.error('❌ Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = () => {
    fetchAgents();
    setShowEnhancedCreator(false);
  };

  const handleViewDetails = (agent) => {
    setModalAgent(agent);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setModalAgent(null);
  };

  const handleGenerateFromUpload = async (transcript, requestId) => {
    try {
      // Show loading state
      setLoading(true);
      
      // Upload and process transcript using the ACCURATE extraction endpoint
      const response = await fetch('http://localhost:9001/api/accurate-transcript/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          transcript: transcript,
          requestId: requestId 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate users');
      }
      
      // Show success message
      const agentData = data.agent || data.agents?.[0];
      if (agentData) {
        alert(`Successfully generated user: ${agentData.name}!`);
        
        // Add new agent to the existing list
        setAgents(prevAgents => [agentData, ...prevAgents]);
      } else {
        alert('User generated successfully!');
        // Fallback to reloading
        await fetchAgents();
      }
      
    } catch (error) {
      console.error('Error generating from upload:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalChat = () => {
    if (modalAgent) {
      window.location.href = `/group-chat?agent=${modalAgent.id}`;
    }
  };

  const handleModalAudio = () => {
    if (modalAgent) {
      console.log('Starting audio call with:', modalAgent.name);
    }
  };

  const handleAgentStatusChange = async (agentId, newStatus) => {
    try {
      // Find the agent for user feedback
      const agentToUpdate = agents.find(agent => agent.id === agentId);
      
      // Try API call first, but don't fail if it doesn't work
      try {
        await api.put(`/agents/${agentId}/status`, { status: newStatus });
      } catch (apiError) {
        console.log('API call failed, updating locally:', apiError.message);
      }
      
      // Update local state regardless of API success
      setAgents(agents.map(agent =>
        agent.id === agentId
          ? { ...agent, status: newStatus, statusLabel: formatTitleCase(newStatus) }
          : agent
      ));
      
      // Show success message
      if (agentToUpdate) {
        const statusText = newStatus === 'sleeping' ? 'sleeping' : 'awake';
        toast.success(`${agentToUpdate.name} is now ${statusText}`);
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleDeleteAgent = async (agentId) => {
    console.log('🗑️ Delete agent called with ID:', agentId);
    console.log('📊 Current agents count:', agents.length);
    console.log('🔍 Current search term before delete:', searchTerm);
    
    try {
      // Find the agent to delete for user feedback
      const agentToDelete = agents.find(agent => agent.id === agentId);
      console.log('👤 Agent to delete:', agentToDelete?.name);
      
      // Add to deleted set to prevent reloading
      setDeletedAgentIds(prev => new Set([...prev, agentId]));
      
      // Update local state immediately for better UX
      const newAgents = agents.filter(agent => agent.id !== agentId);
      console.log('📊 New agents count after filter:', newAgents.length);
      setAgents(newAgents);
      
      // Try API call with retry logic
      let apiSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!apiSuccess && retryCount < maxRetries) {
        try {
          console.log(`🔄 Attempting API delete (attempt ${retryCount + 1}/${maxRetries})`);
          await api.delete(`/agents/v5/${agentId}`);
          console.log('✅ Agent deleted successfully via API');
          apiSuccess = true;
        } catch (apiError) {
          retryCount++;
          console.log(`⚠️ API call failed (attempt ${retryCount}):`, apiError.message);
          
          if (retryCount < maxRetries) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          } else {
            console.log('❌ All API attempts failed, but agent removed locally');
            toast.warning('Agent removed locally, but server deletion failed. Please refresh to verify.');
          }
        }
      }
      
      // Clear search term to show all remaining agents
      forceClearSearch();
      
      // Force multiple clearing attempts to ensure it's completely cleared
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
          searchInputRef.current.blur();
          searchInputRef.current.setAttribute('value', '');
        }
        setSearchTerm('');
      }, 50);
      
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.value = '';
          searchInputRef.current.blur();
        }
        setSearchTerm('');
      }, 200);
      
      // Show success message
      if (agentToDelete) {
        if (apiSuccess) {
          toast.success(`${agentToDelete.name} has been permanently deleted`);
        } else {
          toast.success(`${agentToDelete.name} has been removed locally`);
        }
        console.log(`✅ Successfully removed ${agentToDelete.name} from the list`);
      }
    } catch (error) {
      console.error('❌ Error deleting agent:', error);
      toast.error('Failed to delete user');
    }
  };

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    console.log('🔍 Filtering agents. Total agents:', agents.length);
    console.log('🔍 Current filters:', filters);
    console.log('🔍 Search term:', searchTerm);
    
    const filtered = agents.filter(agent => {
      if (filters.status !== 'all' && normalizeStatus(agent.status) !== filters.status) return false;
      if (filters.techLevel !== 'all' && agent.tech_savviness !== filters.techLevel) return false;
      if (filters.englishLevel !== 'all' && agent.englishLevel !== filters.englishLevel) return false;
      if (filters.location !== 'all' && agent.location !== filters.location) return false;
      if (filters.age !== 'all') {
        const age = agent.age || 0;
        if (filters.age === 'young' && (age < 18 || age > 30)) return false;
        if (filters.age === 'middle' && (age < 31 || age > 50)) return false;
        if (filters.age === 'senior' && age < 51) return false;
      }
      if (filters.product !== 'all' && agent.product !== filters.product) return false;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = agent.name?.toLowerCase().includes(searchLower);
        const occupationMatch = agent.occupation?.toLowerCase().includes(searchLower);
        const locationMatch = agent.location?.toLowerCase().includes(searchLower);
        if (!nameMatch && !occupationMatch && !locationMatch) return false;
      }
      return true;
    });

    // Sort the filtered agents
    const sorted = filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at || a.createdAt || 0);
          bValue = new Date(b.created_at || b.createdAt || 0);
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'occupation':
          aValue = (a.occupation || '').toLowerCase();
          bValue = (b.occupation || '').toLowerCase();
          break;
        default:
          aValue = new Date(a.created_at || a.createdAt || 0);
          bValue = new Date(b.created_at || b.createdAt || 0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    const result = sorted.map((agent, index) => ({
      ...agent,
      color: categoryColors[index % categoryColors.length]
    }));
    
    console.log('✅ Filtered agents count:', result.length);
    return result;
  }, [agents, filters, searchTerm, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const activeAgents = agents.filter(a => normalizeStatus(a.status) === 'active');
    const sleepingAgents = agents.filter(a => normalizeStatus(a.status) === 'sleeping');
    const archivedAgents = agents.filter(a => normalizeStatus(a.status) === 'archived');
    
    return {
      total: agents.length,
      active: activeAgents.length,
      sleeping: sleepingAgents.length,
      archived: archivedAgents.length,
    };
  }, [agents]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OptimizedAgentHeader
        key={searchKey}
        onGenerateAgent={() => setShowGenerateModal(true)}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        stats={stats}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchInputRef={searchInputRef}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Combined Filters + Sort (toggles with header button) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Filters & Sort</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="sleeping">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age Group</label>
                  <select
                    value={filters.age}
                    onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="young">18-30</option>
                    <option value="middle">31-50</option>
                    <option value="senior">51+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tech Level</label>
                  <select
                    value={filters.techLevel}
                    onChange={(e) => setFilters({ ...filters, techLevel: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Products</label>
                  <select
                    value={filters.product}
                    onChange={(e) => setFilters({ ...filters, product: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Products</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Web Platform">Web Platform</option>
                    <option value="API">API</option>
                    <option value="Desktop Software">Desktop Software</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="IoT">IoT</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>
              </div>
              
              {/* Sort Section - Separate Row */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-w-[140px]"
                    >
                      <option value="created_at">Generated Time</option>
                      <option value="name">Name</option>
                      <option value="age">Age</option>
                      <option value="occupation">Occupation</option>
                    </select>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm min-w-[100px]"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredAgents.length} user{filteredAgents.length !== 1 ? 's' : ''} found
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Agent Cards Grid - Vertical Flowing */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAgents.map((agent, index) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                color={agent.color}
                onViewDetails={handleViewDetails}
                onStatusChange={handleAgentStatusChange}
                onDelete={handleDeleteAgent}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-bold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-500 font-medium">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Enhanced Agent Creator Modal */}
      {showEnhancedCreator && (
        <EnhancedAgentCreator
          isOpen={showEnhancedCreator}
          onClose={() => setShowEnhancedCreator(false)}
          onAgentCreated={handleAgentCreated}
        />
      )}

      {/* Agent Detail Modal */}
      <AirbnbAgentDetailModal
        agent={modalAgent}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        onChat={handleModalChat}
        onAudio={handleModalAudio}
      />

      {/* Enhanced Generate User Modal */}
        <EnhancedGenerateModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={(personas) => {
            console.log('✅ Generated personas:', personas);
            fetchAgents(); // Refresh the list
          }}
        />
    </div>
  );
};

// Agent Card Component
const AgentCard = ({ agent, color, onViewDetails, onStatusChange, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const ProfessionIcon = getProfessionIcon(agent.occupation);
  
  // Get levels with proper formatting
  const techLevel = agent.tech_savviness || 'Medium';
  const englishLevel = agent.englishLevel || 'Intermediate';
  const domainLevel = agent.domain_savvy || 'Medium';
  
  // Get user status
  const userStatus = agent.status || 'active';
  
  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };
  
  const handleSleep = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onStatusChange?.(agent.id, 'sleeping');
  };
  
  const handleWake = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onStatusChange?.(agent.id, 'active');
  };
  
  const handleDeleteClick = (e) => {
    console.log('🗑️ Delete button clicked in menu');
    e.stopPropagation();
    setShowMenu(false);
    console.log('📋 Opening passcode modal...');
    setShowPasscodeModal(true);
    console.log('📋 showPasscodeModal set to true');
  };

  const handlePasscodeSubmit = async () => {
    console.log('🔐 Passcode submit clicked');
    console.log('🔐 Entered passcode:', passcode);
    
    if (passcode !== '12345') {
      console.log('❌ Invalid passcode');
      toast.error('Invalid passcode. Please try again.');
      return;
    }

    console.log('✅ Passcode correct, calling onDelete with agent ID:', agent.id);
    setIsDeleting(true);
    try {
      await onDelete?.(agent.id);
      console.log('✅ onDelete completed successfully');
      setShowPasscodeModal(false);
      setPasscode('');
    } catch (error) {
      console.error('❌ Error in onDelete:', error);
      toast.error('Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handlePasscodeCancel = () => {
    setShowPasscodeModal(false);
    setPasscode('');
  };
  

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 8) * 0.05 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
      onClick={() => onViewDetails(agent)}
    >
      {/* Colored Header - Compact */}
      <div className={`bg-gradient-to-br ${color.bg} p-4 relative`}>
        {/* 3-Dots Menu */}
        <div className="absolute top-3 right-3 menu-container">
          <button
            onClick={handleMenuToggle}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <EllipsisVerticalIcon className="w-4 h-4 text-white" />
          </button>
          
          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-8 w-48 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50"
              >
                {/* Status indicator */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${userStatus === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {userStatus === 'active' ? 'Active' : 'Sleeping'}
                    </span>
                  </div>
                </div>

                {/* Sleep/Wake button */}
                {userStatus === 'active' ? (
                  <button
                    onClick={handleSleep}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <MoonIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    Sleep
                  </button>
                ) : (
                  <button
                    onClick={handleWake}
                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <SunIcon className="w-4 h-4 text-yellow-600" />
                    </div>
                    Wake
                  </button>
                )}

                {/* Delete button */}
                <button
                  onClick={handleDeleteClick}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </div>
                  Delete User
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Level Badges - Improved Contrast */}
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <span className={`px-2 py-1 rounded-full border ${color.badge} text-[10px] font-semibold`} style={color.style}>
            Tech: {techLevel}
          </span>
          <span className={`px-2 py-1 rounded-full border ${color.badge} text-[10px] font-semibold`} style={color.style}>
            Eng: {englishLevel}
          </span>
          <span className={`px-2 py-1 rounded-full border ${color.badge} text-[10px] font-semibold`} style={color.style}>
            Dom: {domainLevel}
          </span>
        </div>

        {/* Icon + Name Combined */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
            <ProfessionIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {agent.name}
          </h3>
        </div>

        {/* Occupation and Details - Compact */}
        <p className="text-xs text-gray-800 font-medium mb-1">
          {agent.occupation || 'Professional'}
        </p>
        <p className="text-[10px] text-gray-700">
          {agent.location} • {agent.age} yrs
        </p>
      </div>

      {/* Image Section - Reduced Height */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={agent.avatar_url}
          alt={agent.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&size=400&background=${color.bg.split('-')[1]}&color=fff&bold=true`;
          }}
        />
        
        {/* Overlay with action buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(agent);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Read More
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Passcode Modal */}
      <AnimatePresence>
        {showPasscodeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={handlePasscodeCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-700 mb-3">
                  Are you sure you want to delete <span className="font-semibold">{agent.name}</span>? 
                  This will permanently remove the user and all associated data.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter passcode to confirm:
                  </label>
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter passcode (12345)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && handlePasscodeSubmit()}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePasscodeCancel}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasscodeSubmit}
                  disabled={isDeleting || !passcode}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AirbnbAgentLibrary_v2;
