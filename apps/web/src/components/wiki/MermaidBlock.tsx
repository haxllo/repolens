'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: true,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  themeVariables: {
    primaryColor: '#000000',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#ffffff',
    lineColor: '#ffffff',
    secondaryColor: '#000000',
    tertiaryColor: '#000000',
    mainBkg: '#000000',
    nodeBorder: '#ffffff',
    clusterBkg: '#000000',
    clusterBorder: '#ffffff',
    edgeLabelBackground: '#000000',
    fontFamily: 'ui-monospace'
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
        setError('Diagram Protocol Error');
      } finally {
        setIsRendering(false);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="my-16 border-y border-white/5 bg-black py-12 flex flex-col items-center justify-center">
        {isRendering && (
          <div className="flex items-center gap-4 text-white/20">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Rendering Abstract</span>
          </div>
        )}

        {error ? (
          <div className="flex items-center gap-4 text-red-500/40">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{error}</span>
          </div>
        ) : (
          <div 
            ref={elementRef} 
            className="w-full flex justify-center invert"
            dangerouslySetInnerHTML={{ __html: svg }} 
          />
        )}
      
      <div className="mt-12">
         <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">Architectural Schematic</span>
      </div>
    </div>
  );
};

export default MermaidBlock;