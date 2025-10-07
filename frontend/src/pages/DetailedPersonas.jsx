import React, { useState, useEffect } from 'react';
import DetailedPersonaCard from '../components/DetailedPersonaCard';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';

const DetailedPersonas = () => {
    const [personas, setPersonas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchDetailedPersonas();
    }, []);

    const fetchDetailedPersonas = async () => {
        try {
            setLoading(true);
            const response = await api.get('/agent/generate/detailed');
            if (response.data.success) {
                setPersonas(response.data.agents);
            } else {
                setError('Failed to fetch detailed personas');
            }
        } catch (err) {
            console.error('Error fetching detailed personas:', err);
            setError('Failed to fetch detailed personas');
        } finally {
            setLoading(false);
        }
    };

    const filteredPersonas = personas.filter(persona => {
        const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            persona.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            persona.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || persona.status === filterStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading detailed personas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Personas</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchDetailedPersonas}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Detailed Personas</h1>
                            <p className="text-gray-600 mt-2">
                                Comprehensive user personas with rich details and insights
                            </p>
                        </div>
                        <div className="text-sm text-gray-500">
                            {filteredPersonas.length} of {personas.length} personas
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search personas by name, title, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-5 h-5 text-gray-400" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="sleeping">Sleeping</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Personas Grid */}
                {filteredPersonas.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Personas Found</h3>
                        <p className="text-gray-500">
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'No detailed personas available yet'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {filteredPersonas.map((persona) => (
                            <div key={persona.id} className="relative">
                                <DetailedPersonaCard persona={persona} />
                                
                                {/* Action Buttons */}
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <button
                                        onClick={() => setSelectedPersona(selectedPersona?.id === persona.id ? null : persona)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        {selectedPersona?.id === persona.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                    <button
                                        onClick={() => window.open(`/agent-chat/${persona.id}`, '_blank')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                                    >
                                        Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailedPersonas;