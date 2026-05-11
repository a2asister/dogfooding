export interface KnowledgeNode {
  id: string;
  name: string;
  parentId: string | null;
  learned: boolean;
  description: string;
  children?: KnowledgeNode[];
}

export interface PositionedNode extends KnowledgeNode {
  x: number;
  y: number;
  expanded: boolean;
  animationDelay: number;
  visible: boolean;
}

export interface Connection {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromId: string;
  toId: string;
  animationDelay: number;
}
