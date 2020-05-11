import { AfterViewInit, Component, HostListener } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-control-geocoder';

export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  CENTER = 13
}

export enum CONST {
  ZOOM_MAX = 18,
  ZOOM_MIN = 2,
  LAT_MAX = 85,
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
  private moveMode = true;
  private handleZoom = 5;
  private moveSize = 5;
  public handleIcon = "move";

  constructor() {
    this.coodLat = 45;
    this.coodLon = 5;
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {

    this.map = L.map('map', {
      zoomControl: false,
      center: [this.coodLat, this.coodLon],
      zoom: this.handleZoom,
    });

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      //attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    // disable keyboard
    this.map.keyboard.disable();

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

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(this.map.getCenter());
    console.log(this.map.getZoom());
    this.handlingMap(event.keyCode);
  }

  private handlingMap(keyCode): void {

    switch (keyCode) {
      case KEY_CODE.UP_ARROW:
        if (this.moveMode) {
          if (this.map.getCenter().lat < CONST.LAT_MAX) {
            this.moveMap(1, 0);
          }
        } else {
          if (this.handleZoom < CONST.ZOOM_MAX) {
            this.zoomMap(1);
            this.moveSize /= 2;
          }
        }
        break;
      case KEY_CODE.DOWN_ARROW:
        if (this.moveMode) {
          if (this.map.getCenter().lat > -CONST.LAT_MAX) {
            this.moveMap(-1, 0);
          }
        } else {
          if (this.handleZoom > CONST.ZOOM_MIN) {
            this.zoomMap(-1);
            this.moveSize *= 2
          }

        }
        break;
      case KEY_CODE.RIGHT_ARROW:
        if (this.moveMode) {
          this.moveMap(0, 1);
        } else {
        }
        break;
      case KEY_CODE.LEFT_ARROW:
        if (this.moveMode) {
          this.moveMap(0, -1);
        } else {
        }
        break;
      case KEY_CODE.CENTER:
        this.changeMode();
        break;
    }
  }

  private changeMode(): void {
    this.moveMode = !this.moveMode;
    if (this.moveMode) {
      this.handleIcon = "move";
      console.log("move");
    } else {
      this.handleIcon = "zoom";
      console.log("zoom");
    }
  }

  private moveMap(lat, lon): void {
    // calcul new coordinates
    this.coodLat += lat * this.moveSize;
    this.coodLon += lon * this.moveSize;
    this.map.setView([this.coodLat, this.coodLon], this.handleZoom);
  }

  private zoomMap(zoom): void {
    // update zoom
    this.handleZoom += zoom;
    this.map.setZoom(this.handleZoom);
  }

  showSearch() {
    /* this.show = !this.show;  
     setTimeout(()=>{ // this will make the execution after the above boolean has changed
       this.searchElement.nativeElement.focus();
     },0); */
  }
}