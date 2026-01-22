"use client";

import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

interface FileNode {
  name: string;
  path: string;
  size: number;
  complexity?: number;
  risk?: number;
  children?: FileNode[];
}

interface FileTreeHeatmapProps {
  files: Array<{
    path: string;
    language: string;
    lines?: number;
    lines_of_code?: number;
    complexity?: number;
  }>;
  riskScores?: Record<string, number>;
}

export function FileTreeHeatmap({ files, riskScores = {} }: FileTreeHeatmapProps) {
  const treeData = useMemo(() => {
    const root: FileNode = { name: "root", path: "", size: 0, children: [] };

    files.forEach((file) => {
      const parts = file.path.split("/");
      let current = root;
      const size = file.lines || file.lines_of_code || 0;

      parts.forEach((part, index) => {
        if (!current.children) current.children = [];
        
        let child = current.children.find((c) => c.name === part);
        
        if (!child) {
          const isFile = index === parts.length - 1;
          child = {
            name: part,
            path: parts.slice(0, index + 1).join("/"),
            size: isFile ? size : 0,
            complexity: isFile ? file.complexity : undefined,
            risk: isFile ? riskScores[file.path] : undefined,
            children: isFile ? undefined : [],
          };
          current.children.push(child);
        } else if (index === parts.length - 1) {
          child.size += size;
        }

        current = child;
      });
    });

    const traverse = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .filter((n) => n.size > 0)
        .map((n) => ({
          ...n,
          children: n.children ? traverse(n.children) : undefined,
        }));
    };

    return traverse(root.children || []);
  }, [files, riskScores]);

  const getColor = (risk?: number) => {
    if (!risk) return "#3b82f6";
    if (risk < 3) return "#a2e435";
    if (risk < 5) return "#f59e0b";
    if (risk < 7) return "#f97316";
    return "#ef4444";
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl">
          <p className="font-bold text-white text-base mb-1">{data.name}</p>
          <p className="text-white/40 text-[10px] font-mono break-all mb-3">{data.path}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-8 text-xs">
              <span className="text-white/60">Lines of Code</span>
              <span className="text-white font-medium">{data.size}</span>
            </div>
            {data.complexity && (
              <div className="flex justify-between gap-8 text-xs">
                <span className="text-white/60">Complexity</span>
                <span className="text-white font-medium">{data.complexity}</span>
              </div>
            )}
            {data.risk !== undefined && (
              <div className="flex justify-between gap-8 text-xs pt-1.5 border-t border-white/5">
                <span className="text-white/60">Risk Score</span>
                <span className={`font-bold ${data.risk > 7 ? 'text-red-400' : data.risk > 4 ? 'text-orange-400' : 'text-lime-400'}`}>
                  {data.risk.toFixed(1)}/10
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-[500px] text-white/50 bg-white/[0.02] rounded-xl border border-dashed border-white/10">
        No file data available for heatmap
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">File Distribution</h3>
          <p className="text-sm text-white/40">
            Size represents Lines of Code, Color represents Risk Level
          </p>
        </div>
        <div className="flex gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
          {[
            { label: 'Low', color: 'bg-lime-400' },
            { label: 'Med', color: 'bg-yellow-500' },
            { label: 'High', color: 'bg-orange-500' },
            { label: 'Crit', color: 'bg-red-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 px-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#050505] rounded-2xl border border-white/10 overflow-hidden">
        <ResponsiveContainer width="100%" height={500}>
          <Treemap
            data={treeData}
            dataKey="size"
            stroke="#050505"
            fill="#8884d8"
            content={<CustomTreemapContent getColor={getColor} />}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const CustomTreemapContent = ({ getColor, ...props }: any) => {
  const { x, y, width, height, name, risk } = props;

  if (width < 15 || height < 15) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getColor(risk),
          stroke: "#050505",
          strokeWidth: 1,
          opacity: 0.9
        }}
      />
      {width > 60 && height > 25 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#000"
          fontSize={Math.min(width / 8, 11)}
          fontWeight="700"
          style={{ pointerEvents: 'none' }}
        >
          {name.length > width / 8 ? name.slice(0, Math.floor(width / 10)) + '...' : name}
        </text>
      )}
    </g>
  );
};
