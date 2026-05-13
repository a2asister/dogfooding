import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, Observable } from 'rxjs';
import { ColorScheme, CreateColorSchemeInput, UpdateColorSchemeInput } from '../models/color-scheme.model';

const GET_COLOR_SCHEMES = gql`
  query {
    colorSchemes {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const GET_FAVORITES = gql`
  query {
    favoriteColorSchemes {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const GET_ARCHIVED = gql`
  query {
    archivedColorSchemes {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const GET_TEMPLATES = gql`
  query {
    colorSchemeTemplates {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const CREATE_COLOR_SCHEME = gql`
  mutation CreateColorScheme($createColorSchemeInput: CreateColorSchemeInput!) {
    createColorScheme(createColorSchemeInput: $createColorSchemeInput) {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_COLOR_SCHEME = gql`
  mutation UpdateColorScheme($updateColorSchemeInput: UpdateColorSchemeInput!) {
    updateColorScheme(updateColorSchemeInput: $updateColorSchemeInput) {
      id
      name
      colors
      description
      isFavorite
      isArchived
      isTemplate
      createdAt
      updatedAt
    }
  }
`;

const DELETE_COLOR_SCHEME = gql`
  mutation RemoveColorScheme($id: ID!) {
    removeColorScheme(id: $id) {
      id
    }
  }
`;

const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($id: ID!) {
    toggleFavorite(id: $id) {
      id
      isFavorite
    }
  }
`;

const TOGGLE_ARCHIVE = gql`
  mutation ToggleArchive($id: ID!) {
    toggleArchive(id: $id) {
      id
      isArchived
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ColorSchemeService {
  constructor(private apollo: Apollo) {}

  getColorSchemes(): Observable<ColorScheme[]> {
    return this.apollo.watchQuery<any>({
      query: GET_COLOR_SCHEMES
    }).valueChanges.pipe(
      map((result: any) => result.data.colorSchemes)
    );
  }

  getFavorites(): Observable<ColorScheme[]> {
    return this.apollo.watchQuery<any>({
      query: GET_FAVORITES
    }).valueChanges.pipe(
      map((result: any) => result.data.favoriteColorSchemes)
    );
  }

  getArchived(): Observable<ColorScheme[]> {
    return this.apollo.watchQuery<any>({
      query: GET_ARCHIVED
    }).valueChanges.pipe(
      map((result: any) => result.data.archivedColorSchemes)
    );
  }

  getTemplates(): Observable<ColorScheme[]> {
    return this.apollo.watchQuery<any>({
      query: GET_TEMPLATES
    }).valueChanges.pipe(
      map((result: any) => result.data.colorSchemeTemplates)
    );
  }

  createColorScheme(input: CreateColorSchemeInput): Observable<ColorScheme> {
    return this.apollo.mutate<any>({
      mutation: CREATE_COLOR_SCHEME,
      variables: { createColorSchemeInput: input },
      refetchQueries: [{ query: GET_COLOR_SCHEMES }]
    }).pipe(
      map((result: any) => result.data.createColorScheme)
    );
  }

  updateColorScheme(input: UpdateColorSchemeInput): Observable<ColorScheme> {
    return this.apollo.mutate<any>({
      mutation: UPDATE_COLOR_SCHEME,
      variables: { updateColorSchemeInput: input },
      refetchQueries: [{ query: GET_COLOR_SCHEMES }]
    }).pipe(
      map((result: any) => result.data.updateColorScheme)
    );
  }

  deleteColorScheme(id: string): Observable<string> {
    return this.apollo.mutate<any>({
      mutation: DELETE_COLOR_SCHEME,
      variables: { id },
      refetchQueries: [{ query: GET_COLOR_SCHEMES }]
    }).pipe(
      map((result: any) => result.data.removeColorScheme.id)
    );
  }

  toggleFavorite(id: string): Observable<ColorScheme> {
    return this.apollo.mutate<any>({
      mutation: TOGGLE_FAVORITE,
      variables: { id },
      refetchQueries: [{ query: GET_COLOR_SCHEMES }, { query: GET_FAVORITES }]
    }).pipe(
      map((result: any) => result.data.toggleFavorite)
    );
  }

  toggleArchive(id: string): Observable<ColorScheme> {
    return this.apollo.mutate<any>({
      mutation: TOGGLE_ARCHIVE,
      variables: { id },
      refetchQueries: [{ query: GET_COLOR_SCHEMES }, { query: GET_ARCHIVED }]
    }).pipe(
      map((result: any) => result.data.toggleArchive)
    );
  }
}
