import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import useFigmaImport from '../hooks/useFigmaImport';
import { toast } from 'react-hot-toast';

const DesignImport = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [fileKey, setFileKey] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [prototypes, setPrototypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const {
    prototype,
    loading,
    error,
    initiateAuth,
    importFigma,
    searchPrototypes,
    listPrototypes,
    clearState
  } = useFigmaImport();

  // Load existing prototypes on mount
  useEffect(() => {
    loadPrototypes();
  }, []);

  const loadPrototypes = async () => {
    try {
      const results = await listPrototypes();
      setPrototypes(results);
    } catch (err) {
      console.error('Failed to load prototypes:', err);
    }
  };

  const handleFileUrlChange = (url) => {
    setFileUrl(url);
    // Extract file key from URL
    const match = url.match(/file\/([a-zA-Z0-9]+)/);
    if (match) {
      setFileKey(match[1]);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImport = async () => {
    try {
      clearState();
      
      if (!fileKey) {
        toast.error('Please enter a Figma file URL or file key');
        return;
      }

      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await convertImageToBase64(imageFile);
      }

      const result = await importFigma(fileKey, accessToken, imageBase64);
      
      if (result.success) {
        toast.success('Figma prototype imported successfully!');
        loadPrototypes(); // Refresh the list
        setFileUrl('');
        setFileKey('');
        setImageFile(null);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAuth = async () => {
    try {
      clearState();
      await initiateAuth();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await searchPrototypes(searchQuery);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getValidationIcon = (validation) => {
    if (!validation) return null;
    
    const score = validation.score || 0;
    if (score >= 0.8) {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (score >= 0.6) {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    } else {
      return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Import</h1>
          <p className="text-gray-600">Import Figma prototypes with AI validation and search capabilities</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Import Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <CloudArrowUpIcon className="w-6 h-6 mr-2 text-blue-600" />
              Import Figma Prototype
            </h2>

            <div className="space-y-4">
              {/* File URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figma File URL
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => handleFileUrlChange(e.target.value)}
                  placeholder="https://www.figma.com/file/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Key (auto-extracted or manual)
                </label>
                <input
                  type="text"
                  value={fileKey}
                  onChange={(e) => setFileKey(e.target.value)}
                  placeholder="File key from Figma URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Access Token Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Token (or use OAuth)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Figma personal access token"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAuth}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    OAuth
                  </button>
                </div>
              </div>

              {/* Image Upload for AI Validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prototype Image (for AI validation)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imageFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {imageFile.name} selected
                  </p>
                )}
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={loading || !fileKey}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Import Prototype
                  </>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {/* Success Display */}
              {prototype && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  <p className="font-medium">Import successful!</p>
                  <p className="text-sm">Prototype ID: {prototype.id}</p>
                  {prototype.validation && (
                    <p className="text-sm">
                      AI Score: {(prototype.validation.score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-600" />
              Search Prototypes
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for prototypes..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              {showSearchResults && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Search Results</h3>
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((result) => (
                        <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{result.summary}</p>
                              <p className="text-sm text-gray-600">
                                Score: {(result.score * 100).toFixed(1)}% • {result.screenCount} screens
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">ID: {result.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No results found</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Prototypes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
            Imported Prototypes
          </h2>

          {prototypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prototypes.map((proto) => (
                <div key={proto.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">{proto.name}</h3>
                    {getValidationIcon(proto.validation)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    File: {proto.fileKey}
                  </p>
                  
                  {proto.validation && (
                    <div className="text-sm text-gray-500 mb-2">
                      AI Score: {(proto.validation.score * 100).toFixed(1)}%
                      {proto.validation.issues && proto.validation.issues.length > 0 && (
                        <span className="text-red-500 ml-2">
                          ({proto.validation.issues.length} issues)
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400">
                    Imported: {new Date(proto.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No prototypes imported yet</p>
              <p className="text-sm">Import your first Figma prototype to get started</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DesignImport;
