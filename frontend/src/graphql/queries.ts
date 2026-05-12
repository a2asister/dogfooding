import { gql } from '@apollo/client';

export const GET_APPROVAL_PROCESS = gql`
  query GetApprovalProcess($id: ID!) {
    approvalProcess(id: $id) {
      id
      name
      description
      nodes {
        id
        name
        role
        approver
        status
        order
        comment
        approvedAt
      }
    }
  }
`;

export const GET_ALL_PROCESSES = gql`
  query GetAllProcesses {
    approvalProcesses {
      id
      name
      description
      nodes {
        id
        name
        status
        order
      }
    }
  }
`;

export const CREATE_SAMPLE_PROCESS = gql`
  mutation CreateSampleProcess {
    createSampleApprovalProcess {
      id
      name
      description
      nodes {
        id
        name
        role
        status
        order
      }
    }
  }
`;

export const UPDATE_APPROVAL = gql`
  mutation UpdateApproval($input: UpdateApprovalInput!) {
    updateApproval(input: $input) {
      id
      status
      approver
      comment
      approvedAt
    }
  }
`;
