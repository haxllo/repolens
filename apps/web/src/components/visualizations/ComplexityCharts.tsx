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

const COLORS = ["#a2e435", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-2 text-sm">
          <p className="font-medium">{label || payload[0].name}</p>
          <p className="text-white/60">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Complexity Distribution</h4>
          <p className="text-sm text-white/50">Files by complexity range</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={complexityDist}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
            <YAxis stroke="#ffffff40" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#a2e435" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Language Breakdown</h4>
          <p className="text-sm text-white/50">Lines of code by language</p>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={languageData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
              stroke="#0a0a0a"
              strokeWidth={2}
              style={{ fontSize: '12px', fill: '#fff' }}
            >
              {languageData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {Object.keys(riskScores).length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Risk Distribution</h4>
            <p className="text-sm text-white/50">Files by risk level</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} />
              <YAxis stroke="#ffffff40" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {topComplexFiles.length > 0 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Most Complex Files</h4>
            <p className="text-sm text-white/50">Top 10 by complexity</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topComplexFiles} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis type="number" stroke="#ffffff40" fontSize={12} />
              <YAxis dataKey="name" type="category" width={100} stroke="#ffffff40" fontSize={11} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-2 text-sm">
                        <p className="font-medium">{payload[0].payload.path}</p>
                        <p className="text-white/60">Complexity: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="complexity" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
