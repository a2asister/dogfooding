import { gql } from '@apollo/client';

export const GET_MEETINGS = gql`
  query {
    meetings {
      id
      title
      startTime
      endTime
      isActive
      isCompleted
    }
  }
`;

export const GET_ACTIVE_MEETING = gql`
  query {
    activeMeeting {
      id
      title
      startTime
      endTime
      isActive
      isCompleted
    }
  }
`;

export const CREATE_MEETING = gql`
  mutation CreateMeeting($input: CreateMeetingInput!) {
    createMeeting(input: $input) {
      id
      title
      startTime
      endTime
      isActive
      isCompleted
    }
  }
`;

export const UPDATE_MEETING = gql`
  mutation UpdateMeeting($input: UpdateMeetingInput!) {
    updateMeeting(input: $input) {
      id
      title
      startTime
      endTime
      isActive
      isCompleted
    }
  }
`;

export const DELETE_MEETING = gql`
  mutation DeleteMeeting($id: ID!) {
    deleteMeeting(id: $id)
  }
`;
