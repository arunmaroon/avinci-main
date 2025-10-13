import React from 'react';

const PmDashboard = () => {
  const data = [
    { stage: 'Product Thinking', progress: 75, tasks: 12, issues: 2 },
    { stage: 'User Research', progress: 60, tasks: 8, issues: 1 },
    { stage: 'UX Design', progress: 45, tasks: 15, issues: 3 },
    { stage: 'UI Design', progress: 30, tasks: 10, issues: 0 },
    { stage: 'UX Content', progress: 20, tasks: 7, issues: 1 },
    { stage: 'Visual Design', progress: 15, tasks: 5, issues: 0 },
    { stage: 'Visual Testing', progress: 5, tasks: 3, issues: 2 },
    { stage: 'Code Export', progress: 0, tasks: 2, issues: 0 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">PM Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded border p-4 bg-white">
          <h2 className="font-semibold mb-2">Overall Progress</h2>
          <p className="text-3xl font-bold">35%</p>
          <p className="text-sm text-slate-600">Assisted by AI: 78%</p>
        </div>
        <div className="rounded border p-4 bg-white">
          <h2 className="font-semibold mb-2">Pending Approvals</h2>
          <p className="text-3xl font-bold">3</p>
          <p className="text-sm text-slate-600">Mgmt reviews required</p>
        </div>
        <div className="rounded border p-4 bg-white">
          <h2 className="font-semibold mb-2">Active PRDs</h2>
          <p className="text-3xl font-bold">7</p>
          <p className="text-sm text-slate-600">Across all stages</p>
        </div>
      </div>

      <div className="mt-8 rounded border bg-white p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-4">Stage</th>
              <th className="py-2 pr-4">Progress</th>
              <th className="py-2 pr-4">Tasks</th>
              <th className="py-2 pr-4">Issues</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.stage} className="border-t">
                <td className="py-2 pr-4">{row.stage}</td>
                <td className="py-2 pr-4">{row.progress}%</td>
                <td className="py-2 pr-4">{row.tasks}</td>
                <td className="py-2 pr-4">{row.issues}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PmDashboard;



