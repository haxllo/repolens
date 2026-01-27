'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  themeVariables: {
    primaryColor: '#000000',
    primaryTextColor: '#a3e635',
    primaryBorderColor: '#ffffff',
    lineColor: '#ffffff',
    secondaryColor: '#000000',
    tertiaryColor: '#000000',
    mainBkg: '#000000',
    nodeBorder: '#ffffff',
    clusterBkg: '#000000',
    clusterBorder: '#ffffff',
    edgeLabelBackground: '#000000',
    defaultLinkColor: '#ffffff',
    titleColor: '#a3e635',
    fontFamily: 'ui-monospace'
  },
  flowchart: {
    htmlLabels: true,
    curve: 'stepBefore', // Sharp orthogonal lines for schematic look
    useMaxWidth: true,
  }
});

interface MermaidBlockProps {
  chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    const renderChart = async () => {
      setIsRendering(true);
      setError(null);

      try {
        const id = `mermaid-svg-${Math.random().toString(36).substring(2, 11)}`;
        let cleanChart = chart.trim();
        
        // Ensure valid graph start
        if (!cleanChart.startsWith('graph') && !cleanChart.startsWith('flowchart')) {
            cleanChart = `graph TD\n${cleanChart}`;
        }

        const { svg } = await mermaid.render(id, cleanChart);
        setSvg(svg);
      } catch {
        setError('Diagram Protocol Error');
      } finally {
        setIsRendering(false);
      }
    };

    if (chart) renderChart();
  }, [chart]);

  return (
    <div className="my-16 border border-white/5 bg-[#050505] rounded-none overflow-hidden flex flex-col items-center shadow-2xl">
        {/* Schematic Header */}
        <div className="w-full px-4 py-2 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-none shadow-[0_0_8px_#a3e635]" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Blueprint_Registry</span>
            </div>
            <button 
                onClick={() => setShowRaw(!showRaw)}
                className="text-[8px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors"
            >
                {showRaw ? 'Render' : 'Source'}
            </button>
        </div>

        {/* The Drawing Board */}
        <div className="w-full p-16 flex flex-col items-center justify-center min-h-[400px] relative overflow-auto bg-grid-white/[0.02]">
            {/* Blueprint Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px]" />

            {isRendering && (
                <div className="flex items-center gap-4 text-white/20 z-10">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Plotting Schematic...</span>
                </div>
            )}

            {error && !showRaw ? (
                <div className="flex flex-col items-center gap-6 text-red-500/40 p-12 border border-dashed border-red-500/10 z-10">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">{error}</span>
                </div>
            ) : showRaw ? (
                <pre className="w-full bg-black/80 p-8 font-mono text-[11px] text-lime-400/60 leading-relaxed overflow-x-auto border border-white/5 z-10">
                    <code>{chart}</code>
                </pre>
            ) : (
                <div 
                    className="w-full flex justify-center z-10 transition-opacity duration-1000"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            )}
        </div>
      
        <div className="w-full px-6 py-4 border-t border-white/5 bg-black flex justify-between items-center">
            <span className="text-[8px] font-black uppercase tracking-[0.6em] text-white/10 italic font-mono">ARCH_SYS_VER_2.2</span>
            <div className="flex gap-2">
                <div className="w-1 h-1 bg-white/10" />
                <div className="w-1 h-1 bg-white/10" />
                <div className="w-1 h-1 bg-white/10" />
            </div>
        </div>
    </div>
  );
};

export default MermaidBlock;