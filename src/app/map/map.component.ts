import { AfterViewInit, Component, HostListener } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

export enum KEY_CODE {
  UP_ARROW = 90,
  DOWN_ARROW = 83,
  RIGHT_ARROW = 68,
  LEFT_ARROW = 81,
  CENTER = 32
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  private map;
  private coodLat;
  private coodLon;
  private zoom;
  private moveMode=true;

  constructor() {
    this.coodLat=45;
    this.coodLon=5;
    this.zoom=5;
   }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    this.map = L.map('map', {
      zoomControl: false,
      center: [this.coodLat, this.coodLon],
      zoom: this.zoom,
    });

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    //L.Control.geocoder().addTo(map);
    //L.Control.Geocoder.nominatim(options);
    //var marker = L.marker([51.5, -0.09]).addTo(this.map);

    L.Control.geocoder({
      position: 'topleft',
      collapsed: false,
      placeholder: 'Search...',
      defaultMarkGeocode: true,
    }).addTo(this.map); 
  }
    
  @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent) {
      //console.log(event);
      this.handlingMap(event.keyCode);
  }

  private handlingMap(keyCode): void{

    switch(keyCode){
      case KEY_CODE.UP_ARROW:
        if(this.moveMode){
          this.moveMap(1,0);
        }else{
          this.zoomMap(1);
        }
      break;
      case KEY_CODE.DOWN_ARROW:
        if(this.moveMode){
          this.moveMap(-1,0);
        }else{
          this.zoomMap(-1);
        }
      break;
      case KEY_CODE.RIGHT_ARROW:
        if(this.moveMode){
          this.moveMap(0,1);
        }else{
        }
      break;
      case KEY_CODE.LEFT_ARROW:
        if(this.moveMode){
          this.moveMap(0,-1);
        }else{
        }
      break;
      case KEY_CODE.CENTER:
        this.changeMode();
      break;
    }
  }

  private changeMode(): void{
    this.moveMode=!this.moveMode;
    if(this.moveMode){
      console.log("move");
    }else{
      console.log("zoom");
    }
  }

  private moveMap(lat,lon): void{
    this.coodLat+=lat;
    this.coodLon+=lon;
    this.map.setView([this.coodLat, this.coodLon],this.zoom);
  }

  private zoomMap(zoom): void{
    this.zoom+=zoom;
    this.map.setZoom(this.zoom);
  }

  showSearch(){
   /* this.show = !this.show;  
    setTimeout(()=>{ // this will make the execution after the above boolean has changed
      this.searchElement.nativeElement.focus();
    },0); */ 
  }
}