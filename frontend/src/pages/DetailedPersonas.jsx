import React, { useState, useEffect } from 'react';
import EnhancedDetailedPersonaCard from '../components/EnhancedDetailedPersonaCard';
import { MagnifyingGlassIcon, FunnelIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const DetailedPersonas = () => {
    const navigate = useNavigate();
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
            // Fetch full persona data (not the limited enhanced-chat endpoint)
            const response = await api.get('/personas');
            if (response.data.success) {
                setPersonas(response.data.personas);
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
        const matchesSearch = persona.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            persona.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            persona.location?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || persona.is_active === true;
        
        return matchesSearch && matchesStatus;
    });

    const statCards = [
        {
            label: 'Active Personas',
            value: personas.filter((p) => p.is_active).length,
            tone: 'from-emerald-500/10 to-emerald-500/30 text-emerald-700'
        },
        {
            label: 'Locations Covered',
            value: new Set(personas.map((p) => (p.location || p.demographics?.location || 'Unknown'))).size,
            tone: 'from-indigo-500/10 to-indigo-500/30 text-indigo-700'
        },
        {
            label: 'Domains & Roles',
            value: new Set(personas.map((p) => p.occupation || p.role_title || 'Unknown')).size,
            tone: 'from-purple-500/10 to-purple-500/30 text-purple-700'
        }
    ];

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
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
            <div className="relative">
                <div className="absolute inset-0 -z-10 mx-auto h-[520px] max-w-6xl rounded-3xl bg-gradient-to-br from-indigo-200/50 via-white to-slate-100 blur-[100px]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Hero */}
                    <div className="rounded-[32px] border border-white/60 bg-white/80 shadow-xl backdrop-blur-lg">
                        <div className="relative overflow-hidden rounded-[32px]">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-purple-500/10" />
                            <div className="relative px-6 py-10 sm:px-10 lg:px-14">
                                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="max-w-2xl">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm">
                                            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                                            Persona Intelligence Hub
                                        </div>
                                        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-[42px]">
                                            Explore Rich, Human-Centered Personas
                                        </h1>
                                        <p className="mt-4 text-base leading-7 text-slate-600">
                                            Browse crafted personas with cultural depth, decision patterns, and actionable insights designed to amplify research and product strategy.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {statCards.map(({ label, value, tone }) => (
                                            <div
                                                key={label}
                                                className={`rounded-2xl bg-gradient-to-br ${tone} px-5 py-4 shadow-inner backdrop-blur`}
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                    {label}
                                                </p>
                                                <p className="mt-2 text-3xl font-semibold tracking-tight">
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="border-t border-slate-200/80 bg-white/80 px-6 py-6 sm:px-10">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                                <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                                    <div className="relative flex-1">
                                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search personas by name, role, domain, or location..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full rounded-full border border-slate-200 bg-white/70 px-11 py-3 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/80"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            <FunnelIcon className="h-4 w-4" />
                                            Filters
                                        </div>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/80"
                                        >
                                            <option value="all">All Personas</option>
                                            <option value="active">Active</option>
                                            <option value="sleeping">Sleeping</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-slate-500">
                                    Displaying <span className="text-slate-900">{filteredPersonas.length}</span> of {personas.length} personas
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personas Grid */}
                    <div className="mt-10">
                        {filteredPersonas.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-slate-200 bg-white/80 py-16 text-center shadow-sm">
                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <UserGroupIcon className="h-10 w-10" />
                                </div>
                                <h3 className="mt-6 text-xl font-semibold text-slate-700">No personas match your filters</h3>
                                <p className="mt-2 text-sm text-slate-500">
                                    Try broadening your search or clearing the filters to explore the full persona library.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {filteredPersonas.map((persona) => (
                                    <div
                                        key={persona.id}
                                        onClick={() => setSelectedPersona(persona)}
                                        className="group relative overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                                    >
                                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-500 opacity-90 transition group-hover:opacity-100" />
                                        <div className="relative flex flex-col items-center px-6 pb-6 pt-12">
                                            <div className="-mt-12 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-lg">
                                                <img
                                                    src={persona.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name || 'Persona')}&background=6366f1&color=fff&size=200&bold=true`}
                                                    alt={persona.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name || 'Persona')}&background=6366f1&color=fff&size=200&bold=true`;
                                                    }}
                                                />
                                            </div>
                                            <h3 className="mt-4 text-lg font-semibold text-slate-800">{persona.name}</h3>
                                            <p className="text-sm text-slate-600">{persona.occupation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* UXPressia-Style Persona Detail Modal */}
            {selectedPersona && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setSelectedPersona(null)}
                >
                    <div
                        className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedPersona(null)}
                            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:scale-105 hover:bg-white"
                        >
                            <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <EnhancedDetailedPersonaCard persona={selectedPersona} />

                        <div className="mt-6 flex items-center justify-end gap-3 bg-white/80 px-6 py-4">
                            <button
                                onClick={() => setSelectedPersona(null)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => navigate(`/enhanced-chat/${selectedPersona.id}`)}
                                className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                            >
                                Start Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedPersonas;
