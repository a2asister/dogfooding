import {
  insertProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  getProductsPaginated
} from './database.js';
import { v4 as uuidv4 } from 'uuid';

export const schema = `
  type ProductSpecs {
    key: String!
    value: String!
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
    description: String
    imageUrl: String!
    category: String
    specs: [ProductSpecs!]
    createdAt: String!
  }

  input ProductSpecsInput {
    key: String!
    value: String!
  }

  input CreateProductInput {
    name: String!
    price: Float!
    description: String
    imageUrl: String!
    category: String
    specs: [ProductSpecsInput!]
  }

  input UpdateProductInput {
    name: String
    price: Float
    description: String
    imageUrl: String
    category: String
    specs: [ProductSpecsInput!]
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
  }

  type PaginatedProducts {
    products: [Product!]!
    pagination: PaginationInfo!
  }

  type Query {
    product(id: ID!): Product
    products: [Product!]!
    productsPaginated(page: Int, limit: Int): PaginatedProducts!
  }

  type Mutation {
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product
    deleteProduct(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    product: (_, { id }) => {
      return getProductById(id);
    },
    products: () => {
      return getAllProducts();
    },
    productsPaginated: (_, { page = 1, limit = 10 }) => {
      return getProductsPaginated(page, limit);
    }
  },
  Mutation: {
    createProduct: (_, { input }) => {
      const id = uuidv4();
      const product = { id, ...input, createdAt: new Date().toISOString() };
      insertProduct(product);
      return getProductById(id);
    },
    updateProduct: (_, { id, input }) => {
      const existing = getProductById(id);
      if (!existing) return null;
      
      const updated = { ...existing, ...input };
      updateProduct(id, updated);
      return getProductById(id);
    },
    deleteProduct: (_, { id }) => {
      const result = deleteProduct(id);
      return result.changes > 0;
    }
  }
};
