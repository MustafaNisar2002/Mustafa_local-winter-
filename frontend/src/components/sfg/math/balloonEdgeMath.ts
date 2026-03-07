import type { Edge } from '@xyflow/react';

export interface BalloonPathInput {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  edgeIndex: number;
  siblingCount: number;
  labelWidth?: number;
}

export interface BalloonPathGeometry {
  path: string;
  labelX: number;
  labelY: number;
  midX: number;
  midY: number;
}

const SELF_LOOP_RADIUS = 72;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function estimateEdgeLabelWidth(label?: string): number {
  if (!label) return 0;
  return clamp(label.length * 8.5 + 22, 24, 220);
}

export function getSiblingEdgeMeta(edge: Edge, allEdges: Edge[]) {
  const sameDirection = allEdges.filter(
    (candidate) => candidate.source === edge.source && candidate.target === edge.target,
  );

  const orderedIds = sameDirection.map((candidate) => candidate.id).sort();
  const edgeIndex = Math.max(0, orderedIds.indexOf(edge.id));

  return {
    edgeIndex,
    siblingCount: sameDirection.length,
  };
}

export function getBalloonBezierGeometry({
  sourceX,
  sourceY,
  targetX,
  targetY,
  edgeIndex,
  siblingCount,
  labelWidth = 0,
}: BalloonPathInput): BalloonPathGeometry {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.hypot(dx, dy);

  if (distance < 1) {
    const loopRadius = SELF_LOOP_RADIUS + edgeIndex * 24 + labelWidth * 0.22;
    const topY = sourceY - loopRadius;
    const leftX = sourceX - loopRadius * 0.9;
    const rightX = sourceX + loopRadius * 0.9;
    const path = [
      `M ${sourceX} ${sourceY}`,
      `C ${rightX} ${sourceY - 8}, ${rightX} ${topY}, ${sourceX} ${topY}`,
      `C ${leftX} ${topY}, ${leftX} ${sourceY - 8}, ${sourceX} ${sourceY}`,
    ].join(' ');

    return {
      path,
      labelX: sourceX,
      labelY: topY - 18,
      midX: sourceX,
      midY: topY,
    };
  }

  const ux = dx / distance;
  const uy = dy / distance;
  const nx = -uy;
  const ny = ux;

  const midpointX = (sourceX + targetX) / 2;
  const midpointY = (sourceY + targetY) / 2;

  const branchSpread = (edgeIndex - (siblingCount - 1) / 2) * 18;
  const depth = clamp(
    distance * 0.42 + labelWidth * 0.38 + siblingCount * 20 + Math.abs(branchSpread),
    40,
    260,
  );

  const crestX = midpointX + nx * (depth + branchSpread);
  const crestY = midpointY + ny * (depth + branchSpread);

  const startPull = clamp(distance * 0.28, 18, 120);
  const endPull = clamp(distance * 0.28, 18, 120);

  const c1x = sourceX + ux * startPull + nx * (depth * 0.66 + branchSpread);
  const c1y = sourceY + uy * startPull + ny * (depth * 0.66 + branchSpread);

  const c2x = targetX - ux * endPull + nx * (depth * 0.66 + branchSpread);
  const c2y = targetY - uy * endPull + ny * (depth * 0.66 + branchSpread);

  const path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`;

  const tangentX = 0.75 * (c2x - c1x);
  const tangentY = 0.75 * (c2y - c1y);
  const tangentLength = Math.hypot(tangentX, tangentY) || 1;
  const labelNormalX = -tangentY / tangentLength;
  const labelNormalY = tangentX / tangentLength;
  const labelClearance = clamp(14 + labelWidth * 0.1, 14, 34);

  return {
    path,
    labelX: crestX + labelNormalX * labelClearance,
    labelY: crestY + labelNormalY * labelClearance,
    midX: crestX,
    midY: crestY,
  };
}
