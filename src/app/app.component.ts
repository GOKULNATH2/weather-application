import { AfterViewInit, Component } from '@angular/core';
import * as M from 'map-library';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';

  // componets values
  public coodLat: number = 45;
  public coodLon: number = 5;
  public handleZoom: number = 5;
  public search: String = '';
  public marker = [{ lat: 48.7333, lon: -3.4667 }, { lat: 48.11, lon: -1.6833 }];

  constructor() {
  }

  ngAfterViewInit(): void {

  }
}
