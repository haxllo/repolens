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
        if (!cleanChart.startsWith('graph') && !cleanChart.startsWith('flowchart') && !cleanChart.startsWith('sequenceDiagram') && !cleanChart.startsWith('classDiagram')) {
            cleanChart = `graph TD\n${cleanChart}`;
        }

        // Handle potentially flattened graphs (replace common patterns with newlines if needed)
        // If it's a long string without newlines but with nodes or separators like -->
        if (!cleanChart.includes('\n') && cleanChart.length > 30) {
            // 1. Initial split on semicolons
            cleanChart = cleanChart.replace(/;/g, ';\n');
            
            // 2. Split between nodes: Look for ] followed by a space and an identifier like A[
            // Pattern: ] A[ or ) A[ or } A[
            cleanChart = cleanChart.replace(/([\]\)\}])\s+([A-Z0-9][^ \-\->]*[\[\(\{])/g, '$1\n$2');
            
            // 3. Split before arrows if we have multiple arrows on one line
            // Pattern: ... --> B[...] --> C
            cleanChart = cleanChart.replace(/(\s+[-=]+>\s+)([A-Z0-9][^ \-\->]*[\[\(\{])/g, '$1\n$2');
            
            // 4. Split on explicit 'note' keywords
            cleanChart = cleanChart.replace(/\s+(Note:)/g, '\n\n$1');
            
            // 5. Final cleanup: remove double newlines
            cleanChart = cleanChart.replace(/\n\n+/g, '\n');
        }

        const { svg } = await mermaid.render(id, cleanChart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid Render Fail:', err);
        setError('Diagram Protocol Error');
      } finally {
        setIsRendering(false);
      }
    };

    if (chart) renderChart();
  }, [chart]);

  return (
    <div className="my-16 border border-white/5 bg-[#050505] rounded-xl overflow-hidden flex flex-col items-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
        {/* Schematic Header */}
        <div className="w-full px-6 py-3 border-b border-white/5 flex justify-between items-center bg-black/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="w-1 h-3 bg-lime-400 rounded-none shadow-[0_0_10px_#a3e635]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">System_Architecture_Model</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="font-mono text-[8px] text-white/10 uppercase tracking-widest suppress">Vector_Scale: 1.0</div>
                <button 
                    onClick={() => setShowRaw(!showRaw)}
                    className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-lime-400 transition-colors"
                >
                    {showRaw ? '[ Render_View ]' : '[ Source_Logic ]'}
                </button>
            </div>
        </div>

        {/* The Drawing Board */}
        <div className="w-full p-12 md:p-24 flex flex-col items-center justify-center min-h-[500px] relative overflow-auto bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [background-size:30px_30px]">
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