import { AfterViewInit, Component} from '@angular/core';
import * as commune from '../assets/commune.json';

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';

  // component values
  public mapLat: number = 48.125; // 45;
  public mapLng: number = -2.8125; // 5;
  public mapZoom: number = 8; //5;
  public search: String = '';
  public marker: any = []; //[{ text: "Lanion", content:"", img: "../assets/partly_cloudy.png", lat: 48.7333, lng: -3.4667 }, { text: "Rennes", img: "../assets/cloudy.png", lat: 48.11, lng: -1.6833 }];

  constructor() { }

  ngAfterViewInit(): void {

    setTimeout(() => {
    }, 5000)
  }
  
  onMapChange(event) {
    //console.log(event);
    this.displayCities(event);
  }

  displayCities(event){

    let tab=[]
    commune['communes'].forEach(element => {
      if(element.zoom <= event.zoom && element.latitude < event.view.top && element.latitude > event.view.bottom && element.longitude < event.view.right && element.longitude > event.view.left){
        tab.push({ text: element.nom_commune, content:"", img: "../assets/partly_cloudy.png", lat: element.latitude, lng: element.longitude })
      }
    });
    this.marker = tab;
  }
  
}
