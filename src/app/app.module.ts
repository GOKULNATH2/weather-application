import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MapLibraryModule } from 'map-library';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    MapLibraryModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
