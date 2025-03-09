export interface Node {
  id: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  language?: string;
  x?: number;
  y?: number;
  highlighted?: boolean;
  neighbors?: Set<string>;
}

export interface Link {
  source: string;
  target: string;
  value: number;
  highlighted?: boolean;
}

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

export interface NodeDetails {
  node: Node;
  connections: {
    id: string;
    name: string;
    type: string;
    relationship: 'parent' | 'child';
  }[];
}