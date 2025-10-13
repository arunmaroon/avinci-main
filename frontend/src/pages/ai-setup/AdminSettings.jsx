import React, { useState } from 'react';

const AdminSettings = () => {
  const [apiKeys, setApiKeys] = useState({ grok3: '', perplexity: '', fireflies: '', qoqo: '' });
  const [features, setFeatures] = useState({ realtime: true, aiAssist: true, voiceNotes: false });

  const updateKey = (k, v) => setApiKeys((p) => ({ ...p, [k]: v }));
  const toggle = (k) => setFeatures((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border p-4 bg-white">
          <h2 className="font-semibold mb-4">API Keys</h2>
          {['grok3', 'perplexity', 'fireflies', 'qoqo'].map((k) => (
            <label key={k} className="block mb-3 text-sm">
              <span className="block mb-1 capitalize">{k} API Key</span>
              <input
                className="w-full border rounded p-2"
                value={apiKeys[k]}
                onChange={(e) => updateKey(k, e.target.value)}
                placeholder={`Enter ${k} key`}
              />
            </label>
          ))}
          <button className="mt-2 px-4 py-2 rounded bg-slate-900 text-white">Save Keys</button>
        </div>
        <div className="rounded border p-4 bg-white">
          <h2 className="font-semibold mb-4">Feature Flags</h2>
          {[
            { key: 'realtime', label: 'Real-time Collaboration' },
            { key: 'aiAssist', label: 'AI Assistance' },
            { key: 'voiceNotes', label: 'Voice Notes' },
          ].map((f) => (
            <label key={f.key} className="flex items-center justify-between mb-3 text-sm">
              <span>{f.label}</span>
              <input type="checkbox" checked={features[f.key]} onChange={() => toggle(f.key)} />
            </label>
          ))}
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Compliance</h3>
            <label className="flex items-center justify-between text-sm">
              <span>RBI Checks</span>
              <input type="checkbox" checked readOnly />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;



