import { AfterViewInit, Component } from '@angular/core';
import * as M from 'map-library';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';


  constructor() {
    //this.map; //.init();
    }


  ngAfterViewInit(): void {
    // init map
    
    //console.log(M.setMarker(45, 5.1)) //.setMarker(45, 5.1);
    //var ee = new MapLibraryModule.init();

  }
}
