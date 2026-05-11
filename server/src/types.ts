export interface KnowledgeNode {
  id: string;
  name: string;
  parentId: string | null;
  learned: boolean;
  description: string;
  children?: KnowledgeNode[];
}

export interface RawNode {
  id: string;
  name: string;
  parent_id: string | null;
  learned: number;
  description: string;
}
