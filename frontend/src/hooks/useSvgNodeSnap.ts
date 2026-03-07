import { useLayoutEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';
import type { Node } from '@xyflow/react';

const normalizeToken = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const buildCandidateKeys = (token: string) => {
  const normalized = normalizeToken(token);
  const withoutPrefix = normalized.replace(/^[vi]/, '');
  return Array.from(new Set([normalized, withoutPrefix]));
};

interface UseSvgNodeSnapOptions {
  containerRef: RefObject<HTMLDivElement>;
  svgRef: RefObject<HTMLDivElement>;
  setNodes: Dispatch<SetStateAction<Node[]>>;
}

export function useSvgNodeSnap({ containerRef, svgRef, setNodes }: UseSvgNodeSnapOptions) {
  useLayoutEffect(() => {
    const container = containerRef.current;
    const svgLayer = svgRef.current;
    if (!container || !svgLayer) return;

    const textNodes = Array.from(svgLayer.querySelectorAll<SVGTextElement>('svg text'));
    if (!textNodes.length) return;

    const containerRect = container.getBoundingClientRect();
    const tokenToPoint = new Map<string, { x: number; y: number }>();

    textNodes.forEach((textEl) => {
      const raw = textEl.textContent?.trim();
      if (!raw) return;
      const rect = textEl.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      for (const key of buildCandidateKeys(raw)) {
        tokenToPoint.set(key, { x, y });
      }
    });

    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        const label = (node.data as { label?: string } | undefined)?.label ?? node.id;
        const candidates = buildCandidateKeys(label);
        const match = candidates.map((key) => tokenToPoint.get(key)).find(Boolean);
        if (!match) return node;

        return {
          ...node,
          position: {
            x: Math.round(match.x),
            y: Math.round(match.y),
          },
        };
      }),
    );
  }, [containerRef, svgRef, setNodes]);
}
