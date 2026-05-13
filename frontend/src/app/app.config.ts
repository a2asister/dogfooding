import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';

const routes: Route[] = [];

export function createApollo(): ApolloClientOptions<unknown> {
  return {
    uri: 'http://localhost:3080/graphql',
    cache: new InMemoryCache(),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule, ApolloModule),
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
    },
  ],
};
