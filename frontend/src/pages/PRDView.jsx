import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24 space-y-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
    <div className="prose prose-slate max-w-none text-sm">{children}</div>
  </section>
);

const TOC = ({ sections, active }) => (
  <nav className="sticky top-20 space-y-2">
    <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Contents</p>
    <ul className="space-y-1">
      {sections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`block rounded-md px-3 py-2 text-sm transition ${
              active === s.id ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

const PRDView = () => {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prd, setPrd] = useState(null);
  const [active, setActive] = useState(null);
  const observerRef = useRef(null);

  const sections = useMemo(
    () => [
      { id: 'overview', title: 'Overview' },
      { id: 'problem', title: 'Problem Statement' },
      { id: 'goals', title: 'Goals & Non-Goals' },
      { id: 'scope', title: 'Scope' },
      { id: 'requirements', title: 'Requirements' },
      { id: 'flows', title: 'User Flows' },
      { id: 'ux', title: 'UX & UI' },
      { id: 'open', title: 'Open Questions' },
      { id: 'timeline', title: 'Timeline' },
    ],
    []
  );

  useEffect(() => {
    const fetchPRD = async () => {
      try {
        setLoading(true);
        // Try backend route if available; fallback to demo PRD
        const res = await api
          .get(`/projects/${projectId}`)
          .catch(() => ({ data: {} }));

        const demo = {
          title: 'Product Requirements Document',
          status: 'In Progress',
          owner: 'PM — Alex Gupta',
          updated_at: new Date().toISOString(),
          overview:
            'Build an AI-assisted PRD experience with clean reading, sticky navigation, and clear sections for scope, requirements, and flows.',
          problem:
            'Teams struggle to parse long PRDs. The current view lacks structure, resulting in poor discoverability and low engagement.',
          goals: {
            goals: ['Make PRDs scannable', 'Improve section navigation', 'Enable easy sharing'],
            non_goals: ['Authoring suite', 'Workflow automation'],
          },
          scope: ['Read-only web PRD view', 'Anchor links, deep-linking', 'Mobile-friendly layout'],
          requirements: [
            'Sticky table of contents highlighting current section',
            'Semantic sections with headings and content',
            'Anchors for direct linking to sections',
            'Responsive spacing and legible typography',
          ],
          flows: ['Viewer opens PRD → scans sections via TOC → navigates → copies deep link'],
          ux: ['Use 14–16px body text with 1.6 line height', 'Generous whitespace and short paragraphs'],
          open: ['Who owns canonical PRD storage?', 'Do we support versioning in this view?'],
          timeline: ['Week 1–2: UI + navigation', 'Week 3: Polish + QA'],
        };

        // If backend returns shape, merge; else use demo
        const data = res.data && Object.keys(res.data).length ? res.data : demo;
        setPrd(data);
      } catch (e) {
        setError('Failed to load PRD');
      } finally {
        setLoading(false);
      }
    };
    fetchPRD();
  }, [projectId]);

  // Observe headings to update active TOC
  useEffect(() => {
    const handler = (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    };
    observerRef.current = new IntersectionObserver(handler, { rootMargin: '0px 0px -70% 0px' });
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current && observerRef.current.disconnect();
  }, [prd, sections]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
        {error}
      </div>
    );
  }
  if (!prd) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{prd.title || 'PRD'}</h1>
            <p className="mt-1 text-sm text-slate-600">{prd.owner}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {prd.status || 'Draft'}
            </span>
            <span className="text-xs text-slate-500">
              Updated {new Date(prd.updated_at || Date.now()).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* TOC */}
        <div className="hidden lg:block">
          <TOC sections={sections} active={active} />
        </div>

        {/* Content */}
        <div className="space-y-6">
          <Section id="overview" title="Overview">
            <p>{prd.overview}</p>
          </Section>
          <Section id="problem" title="Problem Statement">
            <p>{prd.problem}</p>
          </Section>
          <Section id="goals" title="Goals & Non-Goals">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Goals</h3>
                <List items={prd.goals?.goals} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Non-Goals</h3>
                <List items={prd.goals?.non_goals} />
              </div>
            </div>
          </Section>
          <Section id="scope" title="Scope">
            <List items={prd.scope} />
          </Section>
          <Section id="requirements" title="Requirements">
            <List items={prd.requirements} />
          </Section>
          <Section id="flows" title="User Flows">
            <List items={prd.flows} />
          </Section>
          <Section id="ux" title="UX & UI">
            <List items={prd.ux} />
          </Section>
          <Section id="open" title="Open Questions">
            <List items={prd.open} />
          </Section>
          <Section id="timeline" title="Timeline">
            <List items={prd.timeline} />
          </Section>
        </div>
      </div>
    </div>
  );
};

const List = ({ items }) => {
  const data = Array.isArray(items)
    ? items.filter(Boolean)
    : typeof items === 'string' && items.trim()
    ? [items.trim()]
    : [];
  if (!data.length) return <p className="text-sm text-slate-500">Not specified</p>;
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
      {data.map((it, idx) => (
        <li key={`${it}-${idx}`}>{it}</li>
      ))}
    </ul>
  );
};

export default PRDView;
