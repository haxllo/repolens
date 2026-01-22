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

    return root.children || [];
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
        <div className="glass p-3 text-sm">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="text-white/50">{data.path}</p>
          <p className="mt-1">Size: {data.size} LOC</p>
          {data.complexity && <p>Complexity: {data.complexity}</p>}
          {data.risk && <p>Risk Score: {data.risk.toFixed(1)}/10</p>}
        </div>
      );
    }
    return null;
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/50">No file data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">File Tree Heatmap</h3>
        <p className="text-sm text-white/50">
          File size by lines of code, colored by risk score
        </p>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={treeData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#1a1a1a"
          fill="#8884d8"
          content={<CustomTreemapContent getColor={getColor} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="flex gap-6 justify-center text-sm text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-lime-400"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500"></div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500"></div>
          <span>Critical</span>
        </div>
      </div>
    </div>
  );
}

const CustomTreemapContent = ({ getColor, ...props }: any) => {
  const { x, y, width, height, name, risk } = props;

  if (width < 10 || height < 10) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: getColor(risk),
          stroke: "#0a0a0a",
          strokeWidth: 2,
        }}
      />
      {width > 50 && height > 30 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          fill="#000"
          fontSize={11}
          fontWeight="600"
        >
          {name}
        </text>
      )}
    </g>
  );
};
