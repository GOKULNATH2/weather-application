import {
  AfterViewInit,
  Component,
  HostListener,
  ElementRef,
} from "@angular/core";
import * as L from "leaflet";
import "leaflet-control-geocoder";

export enum CONST {
  ZOOM_MAX = 18,
  ZOOM_MIN = 2,
  LAT_MAX = 85,
}

@Component({
  selector: "map-library",
  inputs: ['coodLat', 'coodLon', 'handleZoom', 'search', 'marker'],
  templateUrl: "./map-library.component.html",
  styleUrls: ["./map-library.component.css",],
})

export class MapLibraryComponent implements AfterViewInit {

  // input values
  public coodLat: number = 45;
  public coodLon: number = 5;
  public handleZoom: number = 5;
  public search: String;
  public marker: any;


  private map;
  private geocoder;
  private searchInput;
  private searchInputFocused = false;
  private validEscape = false;
  private moveMode = true;
  private moveSize = 5;
  public handleIcon = "move";
  public escapeMessage = "";
  public choiseMessage = true;

  constructor(private elem: ElementRef) {
  }

  ngAfterViewInit(): void {
    // init map
    this.initMap();
    this.initInput();

    // display input request
    this.setSearch(this.search);
    this.setMarker(this.marker);
  }

  private initMap(): void {
    this.map = L.map("map", {
      zoomControl: false,
      center: [this.coodLat, this.coodLon],
      zoom: this.handleZoom,
    });

    L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      //attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    // disable keyboard
    this.map.keyboard.disable();

    this.geocoder = L.Control.geocoder({
      position: "topleft",
      collapsed: false,
      placeholder: "Recherche...",
      defaultMarkGeocode: true,
    }).addTo(this.map);
  }

  public setMarker(marker): void {
    if (marker) {
      marker.forEach(position => {
        L.marker([position.lat, position.lon]).addTo(this.map);
      });
    }
  }

  private setSearch(search): void {
    if (this.search) {
      // load searching
      this.geocoder.setQuery(search)._geocode()
      // search the first element
      setTimeout(() => {
        if(this.geocoder._results && this.geocoder._results.length){
          this.geocoder._geocodeResultSelected(this.geocoder._results[0])
          this.geocoder._clearResults();
        }
      }, 2000);
    }
  }

  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {

    if (this.escapeMessage == "") {
      if (!this.searchInputFocused) {
        this.handlingMap(event.key);
      } else {
        this.handlingKeyboard(event.key);
      }
      this.escapeApp(event.key);
    } else {
      this.handlingEscapeMessage(event.key);
    }
  }

  private handlingKeyboard(key): void {
    switch (key) {
      case "ArrowRight":
        break;
      case "ArrowLeft":
        break;
      case "Enter":
        break;
      case "Escape":
        this.setFocusOut();
        break;
    }
  }

  private handlingEscapeMessage(key): void {
    switch (key) {
      case "ArrowRight":
      case "ArrowLeft":
        this.choiseMessage = !this.choiseMessage;
        break;
      case "Enter":
        if (this.choiseMessage) {
          alert("quitt");
        } else {
          this.clearEscape();
        }
        break;
      case "Escape":
        this.clearEscape();
        break;
    }
  }

  private handlingMap(key): void {
    switch (key) {
      case "ArrowUp":
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
      case "ArrowDown":
        if (this.moveMode) {
          if (this.map.getCenter().lat > -CONST.LAT_MAX) {
            this.moveMap(-1, 0);
          }
        } else {
          if (this.handleZoom > CONST.ZOOM_MIN) {
            this.zoomMap(-1);
            this.moveSize *= 2;
          }
        }
        break;
      case "ArrowRight":
        if (this.moveMode) {
          this.moveMap(0, 1);
        } else {
        }
        break;
      case "ArrowLeft":
        if (this.moveMode) {
          this.moveMap(0, -1);
        } else {
        }
        break;
      case "Enter":
        this.changeMode();
        break;
      case "Escape":
        this.setFocus();
        break;
    }
  }

  private escapeApp(key): void {
    if (key == "Escape") {
      if (this.validEscape) {
        this.escapeMessage = "show-message";
      } else {
        this.validEscape = true;
      }
    } else {
      this.validEscape = false;
    }
  }

  private clearEscape() {
    this.escapeMessage = "";
    this.validEscape = false;
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

  private setPosition(): void {
    // set new coordinates and handle zoom 
    let coord = this.map.getCenter();
    this.coodLat = coord.lat;
    this.coodLon = coord.lng;
    this.handleZoom = this.map.getZoom();
    // calcul new move size
    this.moveSize = 80;
    for (let i = 0; i < this.handleZoom; i++) {
      this.moveSize /= 2;
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

  initInput() {
    // select search input box
    this.searchInput = this.elem.nativeElement.querySelector(
      ".leaflet-control-geocoder-form input"
    );
  }

  setFocus() {
    this.searchInput.focus();
    this.searchInputFocused = true;
  }
  setFocusOut() {
    this.searchInput.blur();
    this.searchInputFocused = false;

    this.setPosition();
  }
}
