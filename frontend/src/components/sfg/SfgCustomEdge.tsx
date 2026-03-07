import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type Edge,
  type EdgeProps,
  useReactFlow,
} from '@xyflow/react';
import {
  estimateEdgeLabelWidth,
  getBalloonBezierGeometry,
  getSiblingEdgeMeta,
} from './math/balloonEdgeMath';

export type SfgEdgeData = {
  label?: string;
};

function SfgCustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
  selected,
  data,
}: EdgeProps<Edge<SfgEdgeData>>) {
  const { getEdges } = useReactFlow();
  const allEdges = getEdges();
  const currentEdge = allEdges.find((edge) => edge.id === id);
  const siblingMeta = currentEdge
    ? getSiblingEdgeMeta(currentEdge, allEdges)
    : { edgeIndex: 0, siblingCount: 1 };

  const labelWidth = estimateEdgeLabelWidth(data?.label);
  const geometry = getBalloonBezierGeometry({
    sourceX,
    sourceY,
    targetX,
    targetY,
    edgeIndex: siblingMeta.edgeIndex,
    siblingCount: siblingMeta.siblingCount,
    labelWidth,
  });

  return (
    <>
      <BaseEdge
        path={geometry.path}
        markerEnd={markerEnd}
        style={{
          strokeWidth: selected ? 2.8 : 2.2,
          stroke: '#214c90',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />
      {data?.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${geometry.labelX}px,${geometry.labelY}px)`,
              pointerEvents: 'all',
              fontSize: 13,
              lineHeight: 1.2,
              color: '#13345f',
              whiteSpace: 'nowrap',
              background: 'rgba(255, 255, 255, 0.82)',
              borderRadius: 10,
              padding: '2px 6px',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export default memo(SfgCustomEdge);
