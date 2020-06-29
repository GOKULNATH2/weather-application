import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { MapLibraryModule } from 'map-library';

import { AppComponent } from './app.component';
import { WeatherComponent } from './weather/weather.component';

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent,
  ],
  imports: [
    BrowserModule,
    MapLibraryModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
