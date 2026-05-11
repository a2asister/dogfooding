export const schema = `
  type Post {
    id: ID!
    userId: String!
    username: String!
    avatar: String!
    content: String!
    images: [String!]!
    createdAt: Float!
  }

  type PostConnection {
    items: [Post!]!
    hasMore: Boolean!
    nextCursor: Float
  }

  type Query {
    posts(limit: Int, cursor: Float): PostConnection!
    post(id: ID!): Post
  }

  input CreatePostInput {
    userId: String!
    username: String!
    avatar: String!
    content: String!
    images: [String!]
  }

  type Mutation {
    createPost(input: CreatePostInput!): Post!
  }
`;

import { getPosts, getPostById, createPost } from './database.js';

export const resolvers = {
  Query: {
    posts: async (_, { limit = 10, cursor = null }) => {
      return getPosts(limit, cursor);
    },
    post: async (_, { id }) => {
      return getPostById(id);
    }
  },
  Mutation: {
    createPost: async (_, { input }) => {
      return createPost(input);
    }
  }
};
