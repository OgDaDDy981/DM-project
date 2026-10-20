import React, { useRef, useState } from 'react';
import type { GraphEdge, GraphNode } from '../../types/compiler';
import { REGISTER_PALETTE } from '../../types/compiler';
import { sounds } from '../../utils/soundEffects';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeColors: Record<string, number | null>;
  currentNodeId: string | null;
  examinedNeighborIds: string[];
  conflicts: Array<[string, string]>;
  spilledNodes: string[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  showConflicts: boolean;
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  nodeColors,
  currentNodeId,
  examinedNeighborIds,
  conflicts,
  spilledNodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNodePosition,
  showConflicts,
  isDark = true,
  isStoryMode = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map for fast node coordinate lookup
  const nodeMap = new Map<string, GraphNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Check if an edge is in conflict
  const isEdgeConflicted = (source: string, target: string): boolean => {
    if (!showConflicts) return false;
    return conflicts.some(
      ([u, v]) => (u === source && v === target) || (u === target && v === source)
    );
  };

  // Check if an edge connects to the active node
  const isEdgeActive = (source: string, target: string): boolean => {
    const active = selectedNodeId || currentNodeId;
    return active === source || active === target;
  };

  // Drag handling
  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    const node = nodeMap.get(nodeId);
    if (!node || !svgRef.current) return;

    sounds.playPop();

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 560;
    const svgY = ((e.clientY - rect.top) / rect.height) * 460;

    setDraggingNodeId(nodeId);
    setDragOffset({ x: svgX - node.x, y: svgY - node.y });
    onSelectNode(nodeId);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 560;
    const svgY = ((e.clientY - rect.top) / rect.height) * 460;

    const newX = Math.max(45, Math.min(515, svgX - dragOffset.x));
    const newY = Math.max(45, Math.min(415, svgY - dragOffset.y));

    onUpdateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className={`relative w-full h-[380px] sm:h-[440px] md:h-[480px] rounded-3xl border-2 overflow-hidden select-none shadow-2xl transition-all duration-300 ${
      isDark ? 'bg-[#090D1A] border-slate-700/80' : 'bg-slate-50 border-slate-200'
    }`}>
      {/* Grid pattern overlay */}
      <div className={`absolute inset-0 pointer-events-none opacity-40 ${
        isDark ? 'bg-grid-pattern' : 'bg-dots-pattern'
      }`} />

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 560 460"
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={() => onSelectNode(null)}
      >
        <defs>
          <filter id="glow-laser" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-danger" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. EDGES */}
        <g className="edges-layer">
          {edges.map((edge) => {
            const u = nodeMap.get(edge.source);
            const v = nodeMap.get(edge.target);
            if (!u || !v) return null;

            const conflicted = isEdgeConflicted(edge.source, edge.target);
            const active = isEdgeActive(edge.source, edge.target);

            return (
              <g key={edge.id}>
                {/* Glow laser line */}
                {conflicted ? (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#EF4444"
                    strokeWidth={8}
                    opacity={0.4}
                    filter="url(#glow-danger)"
                  />
                ) : active ? (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#06B6D4"
                    strokeWidth={7}
                    opacity={0.4}
                    filter="url(#glow-laser)"
                  />
                ) : null}

                {/* Primary Edge Line */}
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={
                    conflicted
                      ? '#EF4444'
                      : active
                      ? '#06B6D4'
                      : isDark
                      ? '#334155'
                      : '#CBD5E1'
                  }
                  strokeWidth={conflicted ? 3.5 : active ? 3 : 2}
                  strokeDasharray={conflicted ? '6 4' : 'none'}
                  className={`transition-colors duration-300 ${conflicted ? 'animate-laser-dash' : ''}`}
                />

                {/* Conflict badge on middle of edge if conflicted */}
                {conflicted && (
                  <g transform={`translate(${(u.x + v.x) / 2}, ${(u.y + v.y) / 2})`}>
                    <circle r={12} fill="#EF4444" className="animate-ping opacity-75" />
                    <circle r={12} fill="#EF4444" />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ✕
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* 2. NODES */}
        <g className="nodes-layer">
          {nodes.map((node) => {
            const regId = nodeColors[node.id];
            const isSpilled = spilledNodes.includes(node.id);
            const isCurrent = currentNodeId === node.id || selectedNodeId === node.id;
            const isExaminedNeighbor = examinedNeighborIds.includes(node.id);
            const register = regId ? REGISTER_PALETTE[regId - 1] : null;

            // Determine Node Background and Stroke
            let fillColor = isDark ? '#1E293B' : '#E2E8F0';
            let strokeColor = isDark ? '#475569' : '#94A3B8';
            let textColor = isDark ? '#FFFFFF' : '#0F172A';

            if (isSpilled) {
              fillColor = '#7F1D1D';
              strokeColor = '#EF4444';
              textColor = '#F87171';
            } else if (register) {
              fillColor = register.color;
              strokeColor = '#FFFFFF';
              textColor = '#FFFFFF';
            } else if (isCurrent) {
              fillColor = isDark ? '#0F172A' : '#FFFFFF';
              strokeColor = '#06B6D4';
              textColor = '#06B6D4';
            } else if (isExaminedNeighbor) {
              fillColor = isDark ? '#2D1B4E' : '#F5F3FF';
              strokeColor = '#8B5CF6';
              textColor = '#8B5CF6';
            }

            const iconDisplay = isStoryMode && node.icon ? node.icon : null;
            const labelDisplay = isStoryMode && node.friendlyName ? node.friendlyName : node.label;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform duration-200"
                onPointerDown={(e) => handlePointerDown(node.id, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playPop();
                  onSelectNode(node.id);
                }}
              >
                {/* Highlight Halo for current node */}
                {isCurrent && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={38}
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    className="animate-spin-slow origin-center"
                    style={{ transformOrigin: `${node.x}px ${node.y}px` }}
                  />
                )}

                {/* Examined Neighbor Halo */}
                {isExaminedNeighbor && !isCurrent && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={35}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    opacity={0.8}
                  />
                )}

                {/* Colored Node Glow Aura */}
                {register && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={34}
                    fill={register.color}
                    opacity={0.25}
                    className="animate-pulse"
                  />
                )}

                {/* Primary Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={26}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? 3.5 : 2.5}
                  className="transition-colors duration-300 filter drop-shadow-md"
                />

                {/* Icon or Label inside circle */}
                {iconDisplay ? (
                  <text
                    x={node.x}
                    y={node.y + 7}
                    textAnchor="middle"
                    fontSize="18"
                    pointerEvents="none"
                  >
                    {iconDisplay}
                  </text>
                ) : (
                  <text
                    x={node.x}
                    y={node.y + 6}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="15"
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                    pointerEvents="none"
                  >
                    {node.label}
                  </text>
                )}

                {/* Text Label Below Circle */}
                <text
                  x={node.x}
                  y={node.y + 40}
                  textAnchor="middle"
                  fill={isDark ? '#E2E8F0' : '#1E293B'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  pointerEvents="none"
                >
                  {labelDisplay}
                </text>

                {/* Assigned Register Pill Badge Above Node */}
                {register && (
                  <g transform={`translate(${node.x}, ${node.y - 34})`}>
                    <rect
                      x="-22"
                      y="-10"
                      width="44"
                      height="20"
                      rx="10"
                      fill="#0F172A"
                      stroke={register.color}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={register.color}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {register.name}
                    </text>
                  </g>
                )}

                {/* Spilled Pill Badge */}
                {isSpilled && (
                  <g transform={`translate(${node.x}, ${node.y - 34})`}>
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="20"
                      rx="10"
                      fill="#EF4444"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      SPILL ⤓
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Canvas Hint */}
      <div className={`absolute bottom-3 left-4 flex items-center gap-2 text-xs font-mono font-bold pointer-events-none px-3 py-1.5 rounded-xl border shadow-sm ${
        isDark ? 'bg-slate-900/90 text-slate-300 border-slate-700' : 'bg-white/90 text-slate-700 border-slate-300'
      }`}>
        <span>💡 Drag any node to rearrange • Click any node to inspect</span>
      </div>
    </div>
  );
};
