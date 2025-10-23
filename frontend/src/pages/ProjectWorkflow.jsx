import React from 'react';
import { Link, useParams } from 'react-router-dom';

const stages = [
  { id: 'product-thinking', name: '1. Product Thinking' },
  { id: 'user-research', name: '2. User Research' },
  { id: 'ux-design', name: '3. UX Design' },
  { id: 'ui-design', name: '4. UI Design' },
  { id: 'ux-content', name: '5. UX Content' },
  { id: 'visual-design', name: '6. Visual Design' },
  { id: 'visual-testing', name: '7. Visual Testing' },
  { id: 'code-export', name: '8. Code Export' },
];

const ProjectWorkflow = () => {
  const { projectId } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Workflow</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((s, idx) => (
          <Link
            key={s.id}
            to={`/projects/${projectId}/stages/${s.id}`}
            className="rounded border p-4 bg-white hover:shadow"
          >
            <div className="text-xs text-slate-500">Stage {idx + 1}</div>
            <div className="font-semibold">{s.name}</div>
          </Link>
        ))}
      </div>
      <div className="mt-6 rounded border p-4 bg-white">
        <h2 className="font-semibold mb-2">Shortcuts</h2>
        <div className="flex gap-3 text-sm">
          <Link className="underline" to={`/projects/${projectId}/stages/product-thinking`}>Open PRD</Link>
          <Link className="underline" to={`/projects/${projectId}/stages/user-research`}>Open Personas</Link>
          <Link className="underline" to={`/projects/${projectId}/stages/ux-design`}>Open User Flows</Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectWorkflow;



