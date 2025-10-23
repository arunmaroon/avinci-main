import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CloudArrowUpIcon,
  LinkIcon,
  DocumentTextIcon,
  EyeIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import PrototypeViewer from '../components/PrototypeViewer';

const DesignImport = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [prototypes, setPrototypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrototype, setSelectedPrototype] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  // Fetch prototypes on mount
  useEffect(() => {
    fetchPrototypes();
  }, []);

  const fetchPrototypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/design/admin/prototypes', {
        headers: {
          'x-user-id': 'test-admin-id'
        }
      });
      setPrototypes(response.data.prototypes || []);
    } catch (error) {
      console.error('Error fetching prototypes:', error);
      toast.error('Failed to load prototypes');
    } finally {
      setLoading(false);
    }
  };

  const handleFigmaImport = async (fileKey, accessToken) => {
    try {
      setLoading(true);
      const response = await api.post('/design/admin/import', {
        fileKey,
        accessToken
      }, {
        headers: {
          'x-user-id': 'test-admin-id'
        }
      });
      
      if (response.data.success) {
        toast.success('Prototype imported successfully!');
        fetchPrototypes();
        setActiveTab('prototypes');
      } else if (response.data.needsAuth) {
        // Handle OAuth flow
        window.location.href = response.data.authUrl;
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (prototypeId, format) => {
    try {
      const response = await api.post(`/design/admin/prototypes/${prototypeId}/export`, {
        format,
        includeStyles: true,
        minify: false
      }, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prototype-${format}-${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${format.toUpperCase()} export downloaded!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed');
    }
  };

  const handleDelete = async (prototypeId) => {
    if (!window.confirm('Are you sure you want to delete this prototype?')) {
      return;
    }
    
    try {
      await api.delete(`/design/admin/prototypes/${prototypeId}`);
      toast.success('Prototype deleted');
      fetchPrototypes();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed');
    }
  };

  const filteredPrototypes = prototypes.filter(prototype =>
    prototype.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prototype.fileKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Design Import</h2>
        <p className="text-gray-600">Import and manage Figma prototypes with AI validation</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'import', name: 'Import', icon: CloudArrowUpIcon },
            { id: 'prototypes', name: 'Prototypes', icon: DocumentTextIcon },
            { id: 'viewer', name: 'Viewer', icon: EyeIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'import' && (
        <ImportTab onImport={handleFigmaImport} loading={loading} />
      )}

      {activeTab === 'prototypes' && (
        <PrototypesTab
          prototypes={filteredPrototypes}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExport={handleExport}
          onDelete={handleDelete}
          onView={(prototype) => {
            setSelectedPrototype(prototype);
            setShowViewer(true);
            setActiveTab('viewer');
          }}
        />
      )}

      {activeTab === 'viewer' && (
        <ViewerTab
          prototype={selectedPrototype}
          onBack={() => {
            setShowViewer(false);
            setSelectedPrototype(null);
            setActiveTab('prototypes');
          }}
        />
      )}
    </div>
  );
};

// Import Tab Component
const ImportTab = ({ onImport, loading }) => {
  const [fileKey, setFileKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [step, setStep] = useState('input'); // input, oauth, importing

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileKey.trim()) {
      toast.error('Please enter a Figma file key');
      return;
    }
    
    setStep('importing');
    await onImport(fileKey, accessToken);
    setStep('input');
  };

  const handleOAuth = () => {
    setStep('oauth');
    // This would trigger the OAuth flow
    window.location.href = '/api/design/admin/oauth-callback';
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <CloudArrowUpIcon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Import Figma Prototype
          </h3>
          <p className="text-gray-600">
            Enter your Figma file key to import a prototype
          </p>
        </div>

        {step === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Figma File Key
              </label>
              <input
                type="text"
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
                placeholder="e.g., abc123def456..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Find this in your Figma file URL: figma.com/file/[FILE_KEY]
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Token (Optional)
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Enter Figma access token"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use OAuth authentication
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleOAuth}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Use OAuth
              </button>
              <button
                type="submit"
                disabled={loading || !fileKey.trim()}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Import
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'oauth' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Redirecting to Figma...
            </h3>
            <p className="text-gray-600">
              Please complete the OAuth flow in the new window
            </p>
          </div>
        )}

        {step === 'importing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Importing prototype...
            </h3>
            <p className="text-gray-600">
              This may take a few moments
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Prototypes Tab Component
const PrototypesTab = ({ prototypes, loading, searchQuery, onSearchChange, onExport, onDelete, onView }) => {
  return (
    <div>
      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search prototypes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Prototypes Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prototypes...</p>
        </div>
      ) : prototypes.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prototypes found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search terms' : 'Import your first Figma prototype to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Import Prototype
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prototypes.map((prototype) => (
            <PrototypeCard
              key={prototype.id}
              prototype={prototype}
              onExport={onExport}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Prototype Card Component
const PrototypeCard = ({ prototype, onExport, onDelete, onView }) => {
  const [showActions, setShowActions] = useState(false);

  const getValidationStatus = (validation) => {
    if (!validation) return { status: 'unknown', color: 'gray' };
    
    const score = validation.score || 0;
    if (score >= 0.8) return { status: 'excellent', color: 'green' };
    if (score >= 0.6) return { status: 'good', color: 'yellow' };
    return { status: 'needs-work', color: 'red' };
  };

  const validation = getValidationStatus(prototype.validation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {prototype.name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {prototype.fileKey}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full bg-${validation.color}-500`}></div>
            <span className={`text-xs font-medium text-${validation.color}-600`}>
              {validation.status}
            </span>
          </div>
        </div>

        {/* Validation Score */}
        {prototype.validation && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>AI Score</span>
              <span>{Math.round((prototype.validation.score || 0) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${validation.color}-500`}
                style={{ width: `${(prototype.validation.score || 0) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            {new Date(prototype.createdAt).toLocaleDateString()}
          </div>
          {prototype.productName && (
            <div className="flex items-center">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              {prototype.productName}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(prototype)}
            className="flex items-center px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            View
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown Actions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-4 top-16 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
          >
            <button
              onClick={() => {
                onExport(prototype.id, 'html');
                setShowActions(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <CodeBracketIcon className="w-4 h-4 mr-2" />
              Export HTML
            </button>
            <button
              onClick={() => {
                onExport(prototype.id, 'react');
                setShowActions(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <CodeBracketIcon className="w-4 h-4 mr-2" />
              Export React
            </button>
            <button
              onClick={() => {
                onDelete(prototype.id);
                setShowActions(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Viewer Tab Component
const ViewerTab = ({ prototype, onBack }) => {
  const [ast, setAst] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prototype) {
      fetchAST();
    }
  }, [prototype]);

  const fetchAST = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/design/admin/prototypes/${prototype.id}/ast`);
      setAst(response.data.ast);
    } catch (error) {
      console.error('Error fetching AST:', error);
      toast.error('Failed to load prototype');
    } finally {
      setLoading(false);
    }
  };

  if (!prototype) {
    return (
      <div className="text-center py-12">
        <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No prototype selected</h3>
        <p className="text-gray-600 mb-4">
          Select a prototype from the Prototypes tab to view it
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Browse Prototypes
        </button>
      </div>
    );
  }

  return (
    <div className="h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{prototype.name}</h3>
          <p className="text-sm text-gray-600">{prototype.fileKey}</p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Prototypes
        </button>
      </div>

      {/* Viewer Content */}
      <div className="bg-white rounded-lg shadow h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading prototype...</p>
            </div>
          </div>
        ) : ast ? (
          <PrototypeViewer 
            ast={ast} 
            prototypeName={prototype.name}
            onClose={onBack}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load prototype</h3>
              <p className="text-gray-600">There was an error loading the prototype data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignImport;