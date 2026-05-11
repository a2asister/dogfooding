import { getAllNodes, getNodeById, getChildrenByParentId, getTree, getSubTree, updateLearnedStatus } from './db.js';

export const schema = `
  type Query {
    nodes: [Node!]!
    node(id: ID!): Node
    tree: [Node!]!
    subTree(id: ID!): Node
    children(parentId: ID): [Node!]!
  }

  type Mutation {
    setLearned(id: ID!, learned: Boolean!): Node
  }

  type Node {
    id: ID!
    name: String!
    parentId: ID
    learned: Boolean!
    description: String!
    children: [Node!]!
  }
`;

export const resolvers = {
  Query: {
    nodes: () => getAllNodes(),
    node: (_: unknown, { id }: { id: string }) => getNodeById(id),
    tree: () => getTree(),
    subTree: (_: unknown, { id }: { id: string }) => getSubTree(id),
    children: (_: unknown, { parentId }: { parentId: string | undefined }) =>
      getChildrenByParentId(parentId || null)
  },
  Mutation: {
    setLearned: (_: unknown, { id, learned }: { id: string; learned: boolean }) => {
      updateLearnedStatus(id, learned);
      return getNodeById(id);
    }
  },
  Node: {
    children: (parent: { id: string }) => getChildrenByParentId(parent.id)
  }
};
