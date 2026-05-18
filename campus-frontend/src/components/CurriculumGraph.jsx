import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import axios from 'axios';
import CourseNode from './CourseNode';

const nodeTypes = { course: CourseNode };

/* ---------- layout helpers ---------- */
const CARD_W = 190;
const CARD_H = 80;
const GAP_X = 260;
const GAP_Y = 110;

function buildGraph(courses) {
  // Group courses by semester
  const bySem = {};
  courses.forEach((c) => {
    const sem = c.semester || 1;
    if (!bySem[sem]) bySem[sem] = [];
    bySem[sem].push(c);
  });

  const semesters = Object.keys(bySem)
    .map(Number)
    .sort((a, b) => a - b);

  const nodes = [];
  const edges = [];
  const idMap = {};

  semesters.forEach((sem, col) => {
    const group = bySem[sem];
    group.forEach((course, row) => {
      const id = course.courseCode || `course-${sem}-${row}`;
      idMap[course.courseCode] = id;

      nodes.push({
        id,
        type: 'course',
        position: { x: col * GAP_X + 40, y: row * GAP_Y + 40 },
        data: {
          label: course.courseName || course.name || id,
          courseCode: course.courseCode || '',
          semester: sem,
          credits: course.credits || 3,
        },
      });
    });
  });

  // Build edges from prerequisites
  courses.forEach((course) => {
    const prereqs = course.prerequisites || course.prereqs || [];
    const targetId = course.courseCode;
    prereqs.forEach((prereq) => {
      const sourceId = typeof prereq === 'string' ? prereq : prereq.courseCode;
      if (idMap[sourceId] && idMap[targetId]) {
        edges.push({
          id: `${sourceId}->${targetId}`,
          source: sourceId,
          target: targetId,
          animated: true,
          style: { stroke: '#3b82f680', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
            width: 16,
            height: 16,
          },
        });
      }
    });
  });

  return { nodes, edges };
}

/* ---------- fallback data ---------- */
const FALLBACK_DATA = [
  { courseCode: 'CS101', courseName: 'Intro to Programming', semester: 1, credits: 4, prerequisites: [] },
  { courseCode: 'MA101', courseName: 'Calculus I', semester: 1, credits: 4, prerequisites: [] },
  { courseCode: 'PH101', courseName: 'Physics I', semester: 1, credits: 3, prerequisites: [] },
  { courseCode: 'CS201', courseName: 'Data Structures', semester: 2, credits: 4, prerequisites: ['CS101'] },
  { courseCode: 'MA201', courseName: 'Linear Algebra', semester: 2, credits: 3, prerequisites: ['MA101'] },
  { courseCode: 'CS202', courseName: 'Digital Logic', semester: 2, credits: 3, prerequisites: ['PH101'] },
  { courseCode: 'CS301', courseName: 'Algorithms', semester: 3, credits: 4, prerequisites: ['CS201', 'MA201'] },
  { courseCode: 'CS302', courseName: 'Computer Architecture', semester: 3, credits: 3, prerequisites: ['CS202'] },
  { courseCode: 'CS303', courseName: 'Discrete Mathematics', semester: 3, credits: 3, prerequisites: ['MA201'] },
  { courseCode: 'CS401', courseName: 'Operating Systems', semester: 4, credits: 4, prerequisites: ['CS301', 'CS302'] },
  { courseCode: 'CS402', courseName: 'Database Systems', semester: 4, credits: 4, prerequisites: ['CS301'] },
  { courseCode: 'CS403', courseName: 'Theory of Computation', semester: 4, credits: 3, prerequisites: ['CS303', 'CS301'] },
  { courseCode: 'CS501', courseName: 'Computer Networks', semester: 5, credits: 4, prerequisites: ['CS401'] },
  { courseCode: 'CS502', courseName: 'Software Engineering', semester: 5, credits: 3, prerequisites: ['CS402'] },
  { courseCode: 'CS503', courseName: 'Compiler Design', semester: 5, credits: 3, prerequisites: ['CS403'] },
  { courseCode: 'CS601', courseName: 'Machine Learning', semester: 6, credits: 4, prerequisites: ['CS301', 'MA201'] },
  { courseCode: 'CS602', courseName: 'Distributed Systems', semester: 6, credits: 3, prerequisites: ['CS501', 'CS401'] },
  { courseCode: 'CS701', courseName: 'Deep Learning', semester: 7, credits: 3, prerequisites: ['CS601'] },
  { courseCode: 'CS702', courseName: 'Cloud Computing', semester: 7, credits: 3, prerequisites: ['CS602'] },
  { courseCode: 'CS801', courseName: 'Capstone Project', semester: 8, credits: 6, prerequisites: ['CS701', 'CS702', 'CS502'] },
];

export default function CurriculumGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get('http://localhost:8080/api/curriculum/sorted')
      .then((res) => {
        if (cancelled) return;
        const { nodes: n, edges: e } = buildGraph(res.data);
        setNodes(n);
        setEdges(e);
        setError(null);
        setUsingFallback(false);
      })
      .catch(() => {
        if (cancelled) return;
        // Use fallback data when backend is unreachable
        const { nodes: n, edges: e } = buildGraph(FALLBACK_DATA);
        setNodes(n);
        setEdges(e);
        setError(null);
        setUsingFallback(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const flowStyle = useMemo(() => ({ background: '#0f0f1a' }), []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center text-sm">
            🗺️
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#f1f5f9]">Curriculum Mapper</h2>
            <p className="text-[10px] text-[#64748b] font-mono">
              {usingFallback ? 'Demo data • backend offline' : 'Prerequisite dependency graph'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#64748b] bg-[#1a1a2e] px-2 py-1 rounded font-mono">
            {nodes.length} courses
          </span>
          <span className="text-[10px] text-[#64748b] bg-[#1a1a2e] px-2 py-1 rounded font-mono">
            {edges.length} deps
          </span>
        </div>
      </div>

      {/* Graph area */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#94a3b8]">Loading curriculum…</span>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          style={flowStyle}
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={2}
        >
          <Controls
            position="bottom-left"
            showInteractive={false}
          />
          <Background color="#1e293b33" gap={24} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
