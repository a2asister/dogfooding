import { GraphQLClient, gql } from 'graphql-request';
import type { KnowledgeNode } from './types';

const API_BASE = 'http://127.0.0.1:18089/graphql';

const client = new GraphQLClient(API_BASE);

const GET_TREE_QUERY = gql`
  query GetTree {
    tree {
      id
      name
      parentId
      learned
      description
      children {
        id
        name
        parentId
        learned
        description
        children {
          id
          name
          parentId
          learned
          description
          children {
            id
            name
            parentId
            learned
            description
            children {
              id
              name
              parentId
              learned
              description
            }
          }
        }
      }
    }
  }
`;

const SET_LEARNED_MUTATION = gql`
  mutation SetLearned($id: ID!, $learned: Boolean!) {
    setLearned(id: $id, learned: $learned) {
      id
      name
      parentId
      learned
      description
    }
  }
`;

export async function getKnowledgeTree(): Promise<KnowledgeNode[]> {
  const data = await client.request<{ tree: KnowledgeNode[] }>(GET_TREE_QUERY);
  return data.tree;
}

export async function setLearnedStatus(id: string, learned: boolean): Promise<KnowledgeNode> {
  const data = await client.request<{ setLearned: KnowledgeNode }>(SET_LEARNED_MUTATION, {
    id,
    learned
  });
  return data.setLearned;
}

export function flattenTree(nodes: KnowledgeNode[]): KnowledgeNode[] {
  const result: KnowledgeNode[] = [];
  const traverse = (node: KnowledgeNode) => {
    result.push(node);
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };
  nodes.forEach(traverse);
  return result;
}
