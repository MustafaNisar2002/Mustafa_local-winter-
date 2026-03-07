import React, { useEffect, useMemo, useRef } from 'react';
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type Node,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';

import { useCircuit } from '@/context/CircuitContext';
import { expo } from '@/utils/formatting';
import SfgCustomEdge from './SfgCustomEdge';
import { useSvgNodeSnap } from '@/hooks/useSvgNodeSnap';

function normalizeSvgMarkup(svgMarkup: string) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svgMarkup;
  const svg = wrapper.querySelector('svg');
  if (!svg) return svgMarkup;

  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  return wrapper.innerHTML;
}

function SfgFlowCanvasInner({ showOverlay }: { showOverlay: boolean }) {
  const { data, symbolicFlag } = useCircuit();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgLayerRef = useRef<HTMLDivElement>(null);

  const initialNodes = useMemo<Node[]>(() => {
    const nodes = data?.sfg?.elements?.nodes ?? [];
    return nodes.map((node, index) => ({
      id: node.data.id,
      position: {
        x: node.position?.x ?? 120 + index * 85,
        y: node.position?.y ?? 120,
      },
      data: { label: node.data.name || node.data.id },
      style: {
        width: 16,
        height: 16,
        borderRadius: '50%',
        border: '2px solid #cf4139',
        background: '#fff',
        color: '#cf4139',
        fontSize: 13,
        fontWeight: 600,
        padding: 0,
      },
    }));
  }, [data?.sfg?.elements?.nodes]);

  const initialEdges = useMemo<Edge[]>(() => {
    const edges = data?.sfg?.elements?.edges ?? [];
    return edges.map((edge) => {
      const label = symbolicFlag
        ? edge.data.weight.symbolic
        : `${expo(edge.data.weight.magnitude, 2)}∠${edge.data.weight.phase.toFixed(2)}`;

      return {
        id: edge.data.id,
        source: edge.data.source,
        target: edge.data.target,
        type: 'sfgBalloon',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: '#214c90',
        },
        data: { label },
      } as Edge;
    });
  }, [data?.sfg?.elements?.edges, symbolicFlag]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);
  useEffect(() => setEdges(initialEdges), [initialEdges, setEdges]);

  useEffect(() => {
    if (!svgLayerRef.current) return;
    svgLayerRef.current.innerHTML = data?.svg ? normalizeSvgMarkup(data.svg) : '';
  }, [data?.svg]);

  useSvgNodeSnap({
    containerRef,
    svgRef: svgLayerRef,
    setNodes,
  });

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height: '100%', bgcolor: '#f8f8f8' }}>
      <Box
        ref={svgLayerRef}
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'none',
          opacity: showOverlay ? 1 : 0.2,
          transition: 'opacity 0.2s ease',
        }}
      />

      <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edgeTypes={{ sfgBalloon: SfgCustomEdge }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.16 }}
          minZoom={0.2}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#d6dce8" gap={32} size={1} />
          <Controls position="bottom-right" />
        </ReactFlow>
      </Box>
    </Box>
  );
}

export default function SfgFlowCanvas({ showOverlay }: { showOverlay: boolean }) {
  return (
    <ReactFlowProvider>
      <SfgFlowCanvasInner showOverlay={showOverlay} />
    </ReactFlowProvider>
  );
}
