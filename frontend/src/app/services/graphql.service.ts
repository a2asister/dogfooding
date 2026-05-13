import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { Project, Subtitle } from '../models/project.model';

const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      createdAt
    }
  }
`;

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      name
      audioFile
      backgroundColor
      videoWidth
      videoHeight
      subtitles {
        id
        text
        startTime
        endTime
        color
        fontSize
        fontFamily
        animationType
      }
    }
  }
`;

const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!) {
    createProject(name: $name) {
      id
      name
      createdAt
    }
  }
`;

const CREATE_SUBTITLE = gql`
  mutation CreateSubtitle(
    $projectId: ID!
    $text: String!
    $startTime: Float!
    $endTime: Float!
    $color: String
    $fontSize: Int
    $animationType: String
  ) {
    createSubtitle(
      projectId: $projectId
      text: $text
      startTime: $startTime
      endTime: $endTime
      color: $color
      fontSize: $fontSize
      animationType: $animationType
    ) {
      id
      text
      startTime
      endTime
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  constructor(private readonly apollo: Apollo) {}

  getProjects(): Observable<Project[]> {
    return this.apollo
      .watchQuery<{ projects: Project[] }>({ query: GET_PROJECTS })
      .valueChanges.pipe(map((result) => [...result.data.projects]));
  }

  getProject(id: string): Observable<Project> {
    return this.apollo
      .watchQuery<{ project: Project }>({ query: GET_PROJECT, variables: { id } })
      .valueChanges.pipe(map((result) => {
        const project = { ...result.data.project };
        if (project.subtitles) {
          project.subtitles = project.subtitles.map(s => ({ ...s }));
        }
        return project;
      }));
  }

  createProject(name: string): Observable<Project> {
    return this.apollo
      .mutate<{ createProject: Project }>({
        mutation: CREATE_PROJECT,
        variables: { name },
      })
      .pipe(map((result) => ({ ...result.data!.createProject })));
  }

  createSubtitle(params: {
    projectId: string;
    text: string;
    startTime: number;
    endTime: number;
    color?: string;
    fontSize?: number;
    animationType?: string;
  }): Observable<Subtitle> {
    return this.apollo
      .mutate<{ createSubtitle: Subtitle }>({
        mutation: CREATE_SUBTITLE,
        variables: params,
      })
      .pipe(map((result) => ({ ...result.data!.createSubtitle })));
  }
}
