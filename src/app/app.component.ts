import { AfterViewInit, Component} from '@angular/core';
import * as cities from '../assets/commune.json';

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';

  // component values
  public mapLat: number = 45;
  public mapLng: number = 5;
  public mapZoom: number = 6;
  public search: String = '';
  public marker: any = []; //[{ text: "Lanion", content:"", img: "../assets/partly_cloudy.png", lat: 48.7333, lng: -3.4667 }, { text: "Rennes", img: "../assets/cloudy.png", lat: 48.11, lng: -1.6833 }];

  constructor() { }

  ngAfterViewInit(): void {

    setTimeout(() => {
    }, 5000)
  }

  onMapSelect(selected) {
    console.log(selected);
  }
  
  onMapChange(event) {
    //console.log(event);
    this.displayCities(event);
  }

  displayCities(event){

    let tab=[]
    cities['cities'].forEach(element => {
      if(element.zoom <= event.zoom && element.latitude < event.view.top && element.latitude > event.view.bottom && element.longitude < event.view.right && element.longitude > event.view.left){
        tab.push({ text: element.city, content:"<span style='color:blue'>12°c</span> - <span style='color:green'>28°c</span>", img: "../assets/partly_cloudy.png", lat: element.latitude, lng: element.longitude })
      }
    });
    this.marker = tab;
  }
  
}
