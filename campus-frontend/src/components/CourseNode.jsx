import { Handle, Position } from '@xyflow/react';

const semesterColors = {
  1: { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#93c5fd' },
  2: { bg: 'rgba(139,92,246,0.12)', border: '#8b5cf6', text: '#c4b5fd' },
  3: { bg: 'rgba(6,182,212,0.12)', border: '#06b6d4', text: '#67e8f9' },
  4: { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#6ee7b7' },
  5: { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#fcd34d' },
  6: { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', text: '#fca5a5' },
  7: { bg: 'rgba(236,72,153,0.12)', border: '#ec4899', text: '#f9a8d4' },
  8: { bg: 'rgba(168,85,247,0.12)', border: '#a855f7', text: '#d8b4fe' },
};

function getColor(semester) {
  return semesterColors[semester] || semesterColors[1];
}

export default function CourseNode({ data }) {
  const colors = getColor(data.semester);

  return (
    <div
      style={{
        background: colors.bg,
        border: `1.5px solid ${colors.border}`,
        borderRadius: '10px',
        padding: '10px 14px',
        minWidth: 160,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.04)';
        e.currentTarget.style.boxShadow = `0 0 24px ${colors.border}44`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: colors.border,
          border: 'none',
          width: 8,
          height: 8,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: colors.border,
            background: `${colors.border}22`,
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          Sem {data.semester}
        </span>
        <span
          style={{
            fontSize: 9,
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {data.credits}cr
        </span>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#f1f5f9',
          lineHeight: 1.3,
          marginBottom: 2,
        }}
      >
        {data.label}
      </div>

      <div
        style={{
          fontSize: 9,
          color: '#64748b',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {data.courseCode}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: colors.border,
          border: 'none',
          width: 8,
          height: 8,
        }}
      />
    </div>
  );
}
