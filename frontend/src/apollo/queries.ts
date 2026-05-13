import { gql } from '@apollo/client/core';

export const GET_DASHBOARDS = gql`
  query GetDashboards {
    dashboards {
      id
      name
      description
      isTemplate
      viewCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_DASHBOARD = gql`
  query GetDashboard($id: ID!) {
    dashboard(id: $id) {
      id
      name
      description
      config
      isTemplate
      viewCount
      createdAt
      updatedAt
    }
  }
`;

export const GET_TEMPLATES = gql`
  query GetTemplates {
    dashboardTemplates {
      id
      name
      description
      viewCount
      createdAt
    }
  }
`;

export const CREATE_DASHBOARD = gql`
  mutation CreateDashboard($input: CreateDashboardInput!) {
    createDashboard(input: $input) {
      id
      name
      description
      config
      isTemplate
      viewCount
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DASHBOARD = gql`
  mutation UpdateDashboard($input: UpdateDashboardInput!) {
    updateDashboard(input: $input) {
      id
      name
      description
      config
      isTemplate
      viewCount
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DASHBOARD = gql`
  mutation DeleteDashboard($id: ID!) {
    deleteDashboard(id: $id)
  }
`;

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

export const GET_STATISTICS = gql`
  query GetStatistics {
    dashboardStatistics {
      total
      templates
      totalViews
    }
  }
`;
