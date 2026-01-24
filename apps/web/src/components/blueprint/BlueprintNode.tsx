import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const BlueprintNode = ({ data }: any) => {
  const isRisk = data.riskScore > 70;

  return (
    <div className={cn(
      "relative min-w-[200px] bg-black border transition-all duration-500 rounded-none",
      isRisk ? "border-red-500/40" : "border-white/10",
      data.isSelected && "border-lime-400 shadow-[0_0_30px_rgba(163,230,53,0.1)]"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-white/10 !w-full !h-0.5 !rounded-none !border-none" />
      
      {/* Monotone Header */}
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
           <FileCode className="w-3 h-3 text-white/30" />
           <span className="text-[10px] font-mono font-bold text-white/60 truncate max-w-[140px] uppercase tracking-tighter">
             {data.label}
           </span>
        </div>
        {isRisk && <ShieldAlert className="w-3 h-3 text-red-500/50" />}
      </div>

      {/* Metrics Body */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
           <div className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">Metric_LOC</div>
           <div className="text-[10px] font-mono text-white/40 tabular-nums">{data.loc || '000'}</div>
        </div>
        
        {/* Abstract Risk Bar */}
        <div className="h-px w-full bg-white/5 relative">
            <div 
                className={cn("absolute inset-y-0 left-0", isRisk ? "bg-red-500" : "bg-lime-400")} 
                style={{ width: `${data.riskScore}%` }}
            />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-white/10 !w-full !h-0.5 !rounded-none !border-none" />
    </div>
  );
};

export default memo(BlueprintNode);