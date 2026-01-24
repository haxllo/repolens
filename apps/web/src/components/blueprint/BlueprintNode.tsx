import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode, Folder, AlertTriangle, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

// Technical "Schematic" Design
const BlueprintNode = ({ data }: any) => {
  const isRisk = data.riskScore > 70;
  const isEntry = data.isEntryPoint;

  return (
    <div className={cn(
      "group relative min-w-[180px] bg-[#050505] rounded-lg border transition-all duration-300",
      isRisk ? "border-red-500/30 hover:border-red-500/60" : "border-white/10 hover:border-lime-400/50",
      data.isSelected && "border-lime-400 shadow-[0_0_20px_rgba(162,228,53,0.1)]"
    )}>
      {/* Connector Handles */}
      <Handle type="target" position={Position.Top} className="!bg-white/20 !w-2 !h-1 !rounded-none" />
      
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
           {data.type === 'dir' ? <Folder className="w-3 h-3 text-blue-400" /> : <FileCode className="w-3 h-3 text-white/40" />}
           <span className="text-[10px] font-mono text-white/50 truncate max-w-[120px]">
             {data.label}
           </span>
        </div>
        {isRisk && <AlertTriangle className="w-3 h-3 text-red-500" />}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-end">
           <div className="text-[9px] uppercase tracking-wider text-white/20">LOC</div>
           <div className="text-xs font-mono text-white/70">{data.loc || '-'}</div>
        </div>
        
        {/* Risk Bar */}
        {data.riskScore > 0 && (
            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                <div 
                    className={cn("h-full", isRisk ? "bg-red-500" : "bg-lime-400")} 
                    style={{ width: `${data.riskScore}%` }}
                />
            </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/20 !w-2 !h-1 !rounded-none" />
    </div>
  );
};

export default memo(BlueprintNode);
