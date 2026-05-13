import { gql } from '@apollo/client';

export const GET_RESUMES = gql`
  query GetResumes($userId: String!) {
    resumes(userId: $userId) {
      id
      title
      content
      layout
      updatedAt
    }
  }
`;

export const GET_RESUME = gql`
  query GetResume($id: String!) {
    resume(id: $id) {
      id
      title
      content
      layout
      updatedAt
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;
