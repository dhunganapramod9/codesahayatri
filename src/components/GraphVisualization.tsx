import React, { useCallback, useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphData, Node } from '../types';

interface GraphVisualizationProps {
  data: GraphData;
  onNodeSelect?: (node: any) => void;
}

export function GraphVisualization({ data, onNodeSelect }: GraphVisualizationProps) {
  const graphRef = useRef<any>();
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [connections, setConnections] = useState<{ parents: Set<string>, children: Set<string> }>({ 
    parents: new Set(), 
    children: new Set() 
  });

  const handleNodeClick = useCallback((node: Node) => {
    const neighbors = new Set();
    const links = new Set();
    const parents = new Set<string>();
    const children = new Set<string>();

    // Reset highlights if clicking the same node
    if (selectedNode?.id === node.id) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      setSelectedNode(null);
      setConnections({ parents: new Set(), children: new Set() });
      if (onNodeSelect) onNodeSelect(null);
      return;
    }

    // Find connected nodes and links
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      if (sourceId === node.id) {
        neighbors.add(targetId);
        links.add(`${sourceId}-${targetId}`);
        children.add(targetId);
      }
      if (targetId === node.id) {
        neighbors.add(sourceId);
        links.add(`${sourceId}-${targetId}`);
        parents.add(sourceId);
      }
    });

    setHighlightNodes(neighbors);
    setHighlightLinks(links);
    setSelectedNode(node);
    setConnections({ parents, children });
    if (onNodeSelect) onNodeSelect(node);
  }, [data.links, selectedNode, onNodeSelect]);

  useEffect(() => {
    if (graphRef.current) {
      graphRef.current.d3Force('link').distance(150);
      graphRef.current.d3Force('charge').strength(-400);
      graphRef.current.d3Force('center').strength(0.8);
      
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 100);
      }, 500);
    }
  }, []);

  const getNodeColor = (node: Node) => {
    if (node.id === selectedNode?.id) return '#F472B6'; // Selected node
    if (highlightNodes.has(node.id)) return '#4ade80'; // Connected nodes
    const depth = node.id.split('/').length;
    if (depth === 1) return '#60A5FA'; // Light blue
    if (depth === 2) return '#F97316'; // Orange
    if (depth === 3) return '#34D399'; // Green
    return '#CBD5E1'; // Light gray
  };

  const getNodeName = (id: string) => {
    const node = data.nodes.find(n => n.id === id);
    return node ? node.name : id;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Connection Sidebar */}
      {selectedNode && (
        <div className="absolute left-4 top-4 z-10 w-64 bg-white/10 backdrop-blur-sm rounded-lg border border-teal-500/30 p-4">
          <h3 className="text-white font-medium mb-4">{selectedNode.name}</h3>
          
          {/* Parents */}
          {connections.parents.size > 0 && (
            <div className="mb-4">
              <h4 className="text-teal-400 text-sm font-medium mb-2">Parents</h4>
              <div className="space-y-2">
                {Array.from(connections.parents).map(id => (
                  <div
                    key={id}
                    className="bg-white/5 rounded px-3 py-2 text-white text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => {
                      const node = data.nodes.find(n => n.id === id);
                      if (node) handleNodeClick(node);
                    }}
                  >
                    {getNodeName(id)}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Children */}
          {connections.children.size > 0 && (
            <div>
              <h4 className="text-pink-400 text-sm font-medium mb-2">Children</h4>
              <div className="space-y-2">
                {Array.from(connections.children).map(id => (
                  <div
                    key={id}
                    className="bg-white/5 rounded px-3 py-2 text-white text-sm cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => {
                      const node = data.nodes.find(n => n.id === id);
                      if (node) handleNodeClick(node);
                    }}
                  >
                    {getNodeName(id)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={data}
        nodeLabel="name"
        backgroundColor="transparent"
        nodeColor={getNodeColor}
        nodeRelSize={6}
        linkColor={(link: any) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return highlightLinks.has(`${sourceId}-${targetId}`) 
            ? '#4ade80' // Highlighted connection
            : 'rgba(255, 255, 255, 0.8)'; // Normal connection
        }}
        linkOpacity={1}
        linkWidth={link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          return highlightLinks.has(`${sourceId}-${targetId}`) ? 3 : 2;
        }}
        linkDirectionalParticles={6}
        linkDirectionalParticleWidth={3}
        linkDirectionalParticleSpeed={0.01}
        linkDirectionalParticleColor={() => '#4ade80'}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={0.5}
        linkCurvature={0.25}
        onNodeClick={handleNodeClick}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Inter`;
          
          const nodeColor = getNodeColor(node);
          const radius = node.id === selectedNode?.id ? 8 : 5;
          
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          ctx.fillStyle = nodeColor;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.shadowColor = 'transparent';
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(label, node.x, node.y + 12);
        }}
        width={window.innerWidth * 0.75 - 48}
        height={window.innerHeight - 200}
      />
    </div>
  );
}