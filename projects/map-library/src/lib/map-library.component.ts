import {
  AfterViewInit,
  Component,
  HostListener,
  ElementRef,
  Output,
  EventEmitter,
  SimpleChanges
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
  inputs: ['mapLat', 'mapLon', 'mapZoom', 'search', 'marker'],
  templateUrl: "./map-library.component.html",
  styleUrls: ["./map-library.component.css",],
})

export class MapLibraryComponent implements AfterViewInit {

  // input values
  public mapLat: number = 45;
  public mapLon: number = 5;
  public mapZoom: number = 5;
  public search: String;
  public marker: any;

  @Output() onchange = new EventEmitter<any>();

  private map;
  private geocoder;
  private searchInput;
  private searchInputFocused = false;
  private validEscape = false;
  private moveMode = true;
  private moveSize;
  public handleIcon = "move";
  public escapeMessage = "";
  public choiseMessage = true;

  constructor(private elem: ElementRef) {
  }

  ngAfterViewInit(): void {
    // init map
    this.initMap();
    this.initInput();
    this.initMoveSize();

    // init display input request
    this.setSearch(this.search);
    this.setMarker(this.marker);
  }

  private initMap(): void {
    this.map = L.map("map", {
      attributionControl: false,
      zoomControl: false,
      center: [this.mapLat, this.mapLon],
      zoom: this.mapZoom,
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

  private setSearch(search): void {
    if (this.search) {
      // load searching
      this.geocoder.setQuery(search)._geocode()
      // search the first element
      setTimeout(() => {
        if (this.geocoder._results && this.geocoder._results.length) {
          this.geocoder._geocodeResultSelected(this.geocoder._results[0])
          this.geocoder._clearResults();
        }
      }, 2000);
    }
  }

  private mapMarkers=[];
  private setMarker(marker): void {
    
    this.cleanMarkers();
    let i=0;
    marker.forEach(element => {
      if("lat" in element && "lon" in element){
        if (!element.text) {
          this.mapMarkers[i] = L.marker([element.lat, element.lon])
        } else {
          this.mapMarkers[i] = this.generateIconMarker(element)
        }
        this.mapMarkers[i].addTo(this.map);
        i++;
      }
    });
  }

  private cleanMarkers(){
    for(let i = 0; i < this.mapMarkers.length; i++){
      this.map.removeLayer(this.mapMarkers[i]);
    }
  }

  private generateIconMarker(element) {

    let html = `<div style="background: white; border-radius:20px; padding: 5px 5px 0 5px;">
              <div style="text-align:center;">${element.text}</div>
              `+(element.img?`<img style="width:100%" src="${element.img}"/>`:``)+`
            </div>`

    return new L.Marker([element.lat, element.lon], {
      icon: new L.DivIcon({
        className: '',
        iconSize: [70, 70], // size of the icon
        iconAnchor: [35, element.img?40:10],
        html,
      })
    })

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
    this.onchange.emit({ key: event.key, zoom: this.mapZoom, lat: this.mapLat, lon: this.mapLon })
  }

  // components events
  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      switch (Object.keys(changes)[0]) {
        case "mapZoom":
        case "mapLat":
        case "mapLon":
          this.map.setView([this.mapLat, this.mapLon], this.mapZoom);
          this.initMoveSize();
          break;
        case "marker":
          this.setMarker(this.marker);
          break;
        case "search":
          this.setSearch(this.search);
          break;
      }
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
          if (this.mapZoom < CONST.ZOOM_MAX) {
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
          if (this.mapZoom > CONST.ZOOM_MIN) {
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
    this.mapLat = coord.lat;
    this.mapLon = coord.lng;
    this.mapZoom = this.map.getZoom();
    // calcul new move size
    this.moveSize = 80;
    for (let i = 0; i < this.mapZoom; i++) {
      this.moveSize /= 2;
    }
  }

  private moveMap(lat, lon): void {
    // calcul new coordinates
    this.mapLat += lat * this.moveSize;
    this.mapLon += lon * this.moveSize;
    this.map.setView([this.mapLat, this.mapLon], this.mapZoom);
  }

  private zoomMap(zoom): void {
    // update zoom
    this.mapZoom += zoom;
    this.map.setZoom(this.mapZoom);
  }

  initInput() {
    // select search input box
    this.searchInput = this.elem.nativeElement.querySelector(
      ".leaflet-control-geocoder-form input"
    );
  }

  initMoveSize() {
    this.moveSize = 80;
    for (let i = 1; i < this.mapZoom; i++) {
      this.moveSize /= 2;
    }
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
