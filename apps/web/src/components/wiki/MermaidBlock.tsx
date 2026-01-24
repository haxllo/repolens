'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertCircle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit',
  themeVariables: {
    primaryColor: '#a3e635',
    primaryTextColor: '#fff',
    primaryBorderColor: '#a3e635',
    lineColor: '#3f3f46',
    secondaryColor: '#18181b',
    tertiaryColor: '#09090b'
  }
});

interface MermaidBlockProps {
  chart: string;
}

const MermaidBlock: React.FC<MermaidBlockProps> = ({ chart }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    const renderChart = async () => {
      if (!elementRef.current) return;
      setIsRendering(true);
      setError(null);

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('Failed to render diagram. Check Mermaid syntax.');
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="my-12 relative group">
      <div className="absolute -inset-4 bg-lime-400/5 rounded-[2rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-[#050505] border border-white/5 rounded-3xl p-8 overflow-hidden min-h-[200px] flex items-center justify-center">
        {isRendering && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-lime-400 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Rendering Diagram</span>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center gap-3 text-red-400/50">
            <AlertCircle className="w-6 h-6" />
            <span className="text-[10px] font-medium">{error}</span>
          </div>
        ) : (
          <div 
            ref={elementRef} 
            className="w-full h-full flex justify-center mermaid-svg-container"
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        )}
      </div>
      
      {/* Label */}
      <div className="mt-4 flex justify-center">
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/10">Architectural Flowchart</span>
      </div>
    </div>
  );
};

export default MermaidBlock;
