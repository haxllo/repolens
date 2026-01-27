"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ComplexityChartsProps {
  files: Array<{
    path: string;
    complexity?: number;
    language: string;
    lines?: number;
    lines_of_code?: number;
  }>;
  riskScores?: Record<string, number>;
}

const COLORS = ["#a2e435", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-none shadow-2xl">
        <p className="font-bold text-white text-xs mb-1">{label || payload[0].name}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color }} />
          <p className="text-white/80 text-xs font-medium">
            {payload[0].value} {payload[0].name === 'count' ? 'Files' : ''}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ComplexityCharts({ files, riskScores = {} }: ComplexityChartsProps) {
  const complexityDist = React.useMemo(() => {
    const ranges = [
      { name: "1-5", min: 0, max: 5, count: 0 },
      { name: "6-10", min: 6, max: 10, count: 0 },
      { name: "11-20", min: 11, max: 20, count: 0 },
      { name: "21-50", min: 21, max: 50, count: 0 },
      { name: "50+", min: 51, max: Infinity, count: 0 },
    ];

    files.forEach((file) => {
      const complexity = file.complexity || 0;
      const range = ranges.find((r) => complexity >= r.min && complexity <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [files]);

  const languageData = React.useMemo(() => {
    const langs: Record<string, number> = {};
    files.forEach((file) => {
      const size = file.lines || file.lines_of_code || 0;
      langs[file.language] = (langs[file.language] || 0) + size;
    });

    return Object.entries(langs)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [files]);

  const riskDist = React.useMemo(() => {
    const ranges = [
      { name: "Low", count: 0 },
      { name: "Medium", count: 0 },
      { name: "High", count: 0 },
      { name: "Critical", count: 0 },
    ];

    Object.values(riskScores).forEach((score) => {
      if (score < 3) ranges[0].count++;
      else if (score < 5) ranges[1].count++;
      else if (score < 7) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [riskScores]);

  const topComplexFiles = React.useMemo(() => {
    return [...files]
      .filter((f) => f.complexity)
      .sort((a, b) => (b.complexity || 0) - (a.complexity || 0))
      .slice(0, 10)
      .map((f) => ({
        name: f.path.split("/").pop() || f.path,
        complexity: f.complexity,
        path: f.path,
      }));
  }, [files]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-white">Complexity Distribution</h4>
          <p className="text-xs text-white/40">Number of files by cyclomatic complexity</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={complexityDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} />
            <YAxis axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" fill="#a2e435" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
        <div className="mb-6">
          <h4 className="text-lg font-bold text-white">Language Breakdown</h4>
          <p className="text-xs text-white/40">Distribution of code by language (LOC)</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={languageData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {languageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          {languageData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(riskScores).length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white">Risk Profile</h4>
            <p className="text-xs text-white/40">File distribution across risk levels</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} />
              <YAxis axisLine={false} tickLine={false} stroke="#ffffff30" fontSize={10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {riskDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#ef4444' : index === 2 ? '#f59e0b' : index === 1 ? '#eab308' : '#a2e435'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {topComplexFiles.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white">Complexity Hotspots</h4>
            <p className="text-xs text-white/40">Top 10 most complex files</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topComplexFiles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} stroke="#ffffff50" fontSize={9} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-none shadow-2xl">
                        <p className="font-bold text-white text-[10px] mb-1">{payload[0].payload.path}</p>
                        <p className="text-red-400 text-xs font-bold">Complexity: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="complexity" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
