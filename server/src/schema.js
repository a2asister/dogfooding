export const typeDefs = `
  type Comment {
    id: ID!
    content: String!
    author: String!
    parentId: ID
    materializedPath: String!
    depth: Int!
    likes: Int!
    createdAt: String!
    children: [Comment!]!
    replies: Int!
  }

  type Query {
    comments: [Comment!]!
    comment(id: ID!): Comment
  }

  type Mutation {
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): ID!
    likeComment(id: ID!): Comment!
  }

  input CreateCommentInput {
    content: String!
    author: String!
    parentId: ID
  }
`;
