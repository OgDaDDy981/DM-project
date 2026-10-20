import React from 'react';
import type { GraphEdge, GraphNode } from '../../types/compiler';
import { REGISTER_PALETTE } from '../../types/compiler';
import { buildAdjacencyList } from '../../algorithms/graphColoring';

interface AllocationTableProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  nodeColors: Record<string, number | null>;
  spilledNodes: string[];
  isDark?: boolean;
  isStoryMode?: boolean;
}

export const AllocationTable: React.FC<AllocationTableProps> = ({
  nodes,
  edges,
  nodeColors,
  spilledNodes,
  isDark = true,
  isStoryMode = true,
}) => {
  const adj = buildAdjacencyList(nodes, edges);

  return (
    <div className={`p-6 rounded-3xl border-2 overflow-hidden shadow-2xl transition-all duration-300 ${
      isDark ? 'bg-[#121829] border-slate-700/80 text-white' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            {isStoryMode ? 'Variable Pocket Assignment Table' : 'Compiler Register Allocation Table'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mapping of program variables to physical machine registers
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
          Target: x86-64 / ARM64
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className={`text-xs font-mono uppercase border-b ${
            isDark ? 'bg-slate-950/80 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}>
            <tr>
              <th className="px-4 py-3">Variable</th>
              <th className="px-4 py-3">Lifetime Range</th>
              <th className="px-4 py-3">Clashing Neighbors</th>
              <th className="px-4 py-3">Assigned Location</th>
              <th className="px-4 py-3">Access Speed</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono text-xs ${
            isDark ? 'divide-slate-800' : 'divide-slate-200'
          }`}>
            {nodes.map((node) => {
              const regId = nodeColors[node.id];
              const isSpilled = spilledNodes.includes(node.id);
              const neighbors = adj[node.id] || [];
              const register = regId ? REGISTER_PALETTE[regId - 1] : null;

              return (
                <tr key={node.id} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3 font-bold flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/30"
                      style={{
                        backgroundColor: register ? register.color : isSpilled ? '#EF4444' : '#64748B',
                      }}
                    />
                    <span>
                      {node.icon ? `${node.icon} ` : ''}
                      {isStoryMode && node.friendlyName ? node.friendlyName : node.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {node.liveStart && node.liveEnd ? `Lines ${node.liveStart} → ${node.liveEnd}` : 'Global'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {neighbors.length > 0 ? neighbors.join(', ') : 'None'}
                  </td>
                  <td className="px-4 py-3">
                    {register ? (
                      <span
                        className="px-2.5 py-1 rounded-lg font-bold text-white shadow-sm"
                        style={{
                          backgroundColor: register.color,
                        }}
                      >
                        Pocket {register.name}
                      </span>
                    ) : isSpilled ? (
                      <span className="px-2.5 py-1 rounded-lg font-bold bg-red-500/20 text-red-500 border border-red-500/40">
                        RAM [Stack Frame]
                      </span>
                    ) : (
                      <span className="text-slate-400">Waiting</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {register ? (
                      <span className="text-emerald-500">1 cycle (0.3 ns) ⚡</span>
                    ) : isSpilled ? (
                      <span className="text-red-500">200+ cycles (70 ns) 🐢</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
