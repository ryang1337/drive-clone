interface INode {
  id: string;
  name: string;
  file_type: string;
  parent: string;
  children: string;
}

export type { INode as INodeType };
