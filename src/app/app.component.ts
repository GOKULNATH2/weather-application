import { AfterViewInit, Component, HostListener, Input } from '@angular/core';

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';

  // component values
  public mapLat: number = 48.125; // 45;
  public mapLon: number = -2.8125; // 5;
  public mapZoom: number = 8; //5;
  public search: String = '';
  public marker: any = [{ text: "Lanion", content:"", img: "../assets/partly_cloudy.png", lat: 48.7333, lon: -3.4667 }, { text: "Rennes", img: "../assets/cloudy.png", lat: 48.11, lon: -1.6833 }];


  constructor() { }

  ngAfterViewInit(): void {

    setTimeout(() => {
      //this.marker = [{ text: "Brest", img: "../assets/partly_cloudy.png", lat: 48.390394, lon: -4.486076 }, { text: "Lanion", content:"hello", img: "../assets/partly_cloudy.png", lat: 48.7333, lon: -3.4667 }, { text: "Rennes", img: "../assets/cloudy.png", lat: 48.11, lon: -1.6833 }];
    }, 5000)
  }
  
  onMapChange(event) {
    console.log(event);
    
    this.marker = [{ text: "Paris", img: "../assets/cloudy.png", lat: 48.866667, lon: 2.333333 }, { text: "Brest", img: "../assets/partly_cloudy.png", lat: 48.390394, lon: -4.486076 }, { text: "Lanion", img: "../assets/partly_cloudy.png", lat: 48.7333, lon: -3.4667 }, { text: "Rennes", img: "../assets/cloudy.png", lat: 48.11, lon: -1.6833 }];

  }

}
