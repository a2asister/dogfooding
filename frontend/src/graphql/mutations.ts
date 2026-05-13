import { gql } from '@apollo/client';

export const CREATE_RESUME = gql`
  mutation CreateResume($input: CreateResumeInput!) {
    createResume(input: $input) {
      id
      title
      content
      layout
      updatedAt
    }
  }
`;

export const UPDATE_RESUME = gql`
  mutation UpdateResume($id: String!, $input: UpdateResumeInput!) {
    updateResume(id: $id, input: $input) {
      id
      title
      content
      layout
      updatedAt
    }
  }
`;

export const DELETE_RESUME = gql`
  mutation DeleteResume($id: String!) {
    deleteResume(id: $id)
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

export const EXPORT_RESUME = gql`
  mutation ExportResume($id: String!) {
    exportResume(id: $id)
  }
`;
