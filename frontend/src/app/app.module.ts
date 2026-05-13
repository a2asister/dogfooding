import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { AppComponent } from './app.component';
import { ThreeViewerComponent } from './three-viewer/three-viewer.component';
import { HouseInfoComponent } from './house-info/house-info.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';

@NgModule({
  declarations: [AppComponent, ThreeViewerComponent, HouseInfoComponent, ControlPanelComponent],
  imports: [BrowserModule, HttpClientModule, ApolloModule, CommonModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => ({
        cache: new InMemoryCache(),
        link: httpLink.create({
          uri: 'http://localhost:3001/graphql',
        }),
      }),
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
