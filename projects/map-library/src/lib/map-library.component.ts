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
  inputs: ['mapLat', 'mapLng', 'mapZoom', 'search', 'marker'],
  templateUrl: "./map-library.component.html",
  styleUrls: ["./map-library.component.css",],
})

export class MapLibraryComponent implements AfterViewInit {

  // input values
  public mapLat: number = 45;
  public mapLng: number = 5;
  public mapZoom: number = 5;
  public search: String;
  public marker: any;

  @Output() onchange = new EventEmitter<any>();
  @Output() onselect = new EventEmitter<any>();

  private map;
  private geocoder;
  private searchInput;
  private searchBar;
  private searchInputFocused = false;
  private moveMode = true;
  private moveShift;
  public handleIcon = "move";
  public handleMenuIcon = "zoom";
  public displayMenu = "";
  public choiseMenu = 1;
  private navigate = false;
  private navigateId = 0;

  constructor(private elem: ElementRef) { }

  ngAfterViewInit(): void {
    // init map
    this.initMap();
    this.initInput();
    this.setMoveShift();

    // init display input request
    this.setSearch(this.search);
    this.setMarker(this.marker);
    // send init event
    setTimeout(() => {
      this.sendModifications("");
    }, 2000)
  }

  private initMap(): void {
    // init map
    this.map = L.map("map", {
      attributionControl: false,
      zoomControl: false,
      center: [this.mapLat, this.mapLng],
      zoom: this.mapZoom,
    });
    // display map
    L.tileLayer("https://{s}.tile.osm.org/{z}/{x}/{y}.png").addTo(this.map);
    // disable keyboard
    this.map.keyboard.disable();
    // add search box
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

  // display markers
  private mapMarkers = [];
  private setMarker(marker): void {

    this.cleanMarkers();
    let i = 0;
    marker.forEach(element => {
      if ("lat" in element && "lng" in element) {
        element.id=i;
        if (!element.text) {
          this.mapMarkers[i] = L.marker([element.lat, element.lng])
        } else {
          this.mapMarkers[i] = this.generateIconMarker(element)
        }
        this.mapMarkers[i].addTo(this.map);
        i++;
      }
    });
  }

  // remove all markers to display news
  private cleanMarkers() {
    for (let i = 0; i < this.mapMarkers.length; i++) {
      this.map.removeLayer(this.mapMarkers[i]);
    }
  }

  // generate Marker
  private generateIconMarker(element) {

    // set html form
    let html = `<div id="marker_${element.id}" style="background: white; border-radius:20px; position:absolute; padding:5px 10px 0 10px; text-align:center;">
              <div style="text-align:center; font-size:1.2em;">${element.text}</div>
              `+ (element.content ? `<span>${element.content}</span>` : ``) +
      (element.img ? `<img style="width:60px" src="${element.img}"/>` : ``) + `
            </div>`

    // return leaflet marker
    return new L.Marker([element.lat, element.lng], {
      icon: new L.DivIcon({
        className: '',
        iconSize: [100, 70], // size of the icon
        iconAnchor: [45, element.img ? 40 : 10],
        html,
      })
    })
  }

  /*************** components attributes events *************/

  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      switch (Object.keys(changes)[0]) {
        case "mapZoom":
        case "mapLat":
        case "mapLng":
          this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
          this.setMoveShift();
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

  /*************** keyboard event detect and functions *************/



  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {

    if (this.displayMenu != "") {
      this.handlingMenu(event.key);

    } else if(this.navigate){
      this.handlingNavigation(event.key)

    } else {
      this.handlingMap(event.key)
      // send change to parent application
      this.sendModifications(event.key);
    }
  }

  private handlingNavigation(key): void {
    switch (key) {
      case "ArrowUp":
        this.navigateMarker(1,0)
        break;
      case "ArrowDown":
        this.navigateMarker(-1,0)
        break;
      case "ArrowRight":
        this.navigateMarker(0,1)
        break;
      case "ArrowLeft":
        this.navigateMarker(0,-1)
        break;
      case "Enter":
        // send change to parent application
        if(this.marker[this.navigateId])
          this.sendSelectEvent(this.marker[this.navigateId])
        break;
      case "Escape":
        this.openMenu();
        break;
    }
  }

  private handlingMenu(key): void {
    switch (key) {
      case "ArrowRight":
        this.choiseMenu++;
        if (this.choiseMenu > 3) {
          this.choiseMenu = 0;
        }
        break;
      case "ArrowLeft":
        this.choiseMenu--;
        if (this.choiseMenu < 0) {
          this.choiseMenu = 3;
        }
        break;
      case "Enter":
        // reset navigation mode
        this.navigate=false;

        if (this.choiseMenu == 0) {
          this.setFocus()
        } else {
          this.setFocusOut();
        } 
        if (this.choiseMenu == 1) {
          this.setMarker(this.marker);
          this.changeMode()

        } else if(this.choiseMenu==2){
          this.setNavigationMode()

        } else if (this.choiseMenu == 3) {
          alert("exit")
        }
        this.closeMenu()
        break;
      case "Escape":
        this.closeMenu();
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
            this.moveShift /= 2;
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
            this.moveShift *= 2;
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
        this.changeMode()
        break;
      case "Escape":
        this.openMenu();
        break;
    }
  }

  // display move or zoom icon when press
  private changeMode(): void {
    this.moveMode = !this.moveMode;
    if (this.moveMode) {
      this.handleIcon = "move";
      this.handleMenuIcon = "zoom"
    } else {
      this.handleIcon = "zoom";
      this.handleMenuIcon = "move"
    }
  }

  private sendModifications(key) {
    // calcul map outline by container size and pixel progection
    let mapSize = this.map.getSize();
    let centerPixel = this.map.project([this.mapLat, this.mapLng], this.mapZoom)
    let topLeft = this.map.unproject([centerPixel.x - mapSize.x / 2, centerPixel.y - mapSize.y / 2], this.mapZoom)
    let bottomRight = this.map.unproject([centerPixel.x + mapSize.x / 2, centerPixel.y + mapSize.y / 2], this.mapZoom)

    // send coordinates results
    this.onchange.emit(
      {
        key: key,
        zoom: this.mapZoom,
        lat: this.mapLat,
        lng: this.mapLng,
        view: {
          top: topLeft.lat,
          left: topLeft.lng,
          bottom: bottomRight.lat,
          right: bottomRight.lng
        }       
      })
  }

  private sendSelectEvent(selected) {
    this.onselect.emit(selected)
  }

  /*************** escape app functions *************/

  private openMenu(): void {
    this.displayMenu = "show-menu";
  }

  private closeMenu(): void {
    this.displayMenu = "";
    this.choiseMenu = 1;
  }
  // show escape message
  private selectMenu(key): void {
    if (key == "Escape") {
      this.closeMenu()
    } else {
      //this.validEscape = false;
    }
  }

  /*************** navigate between markers *************/

  private setNavigationMode(): void{
    this.navigate=true;
    this.handleIcon = "navigation";
    this.navigateMarker(0,0)
    // define menu to move
    this.moveMode = false
    this.handleMenuIcon = "move"
  }

  private navigateMarker(lat, lng): void{
    if(!this.marker.length){
      return;
    }
    if(this.marker.length==1){
      this.navigateId = 0;
      this.elem.nativeElement.querySelector("#marker_"+this.navigateId).style.background="orange";
      return;
    }
    if(this.navigateId > this.marker.length){
      this.navigateId = 0;
    }
    if(lat!=0 || lng != 0){
      // reset previous
      this.elem.nativeElement.querySelector("#marker_"+this.marker[this.navigateId].id).style.background="white";    
    }
    // display new
    if(lng>0){
      this.findFirstRightElement();
    }else if(lng<0){
      this.findFirstLeftElement();
    }else if(lat>0){
      this.findFirstTopElement();
    }else if(lat<0){
      this.findFirstBottomElement();
    }else {
      this.navigateId=0
    }
    this.elem.nativeElement.querySelector("#marker_"+this.navigateId).style.background="orange";
  }

  private findFirstLeftElement(){
    let selected = this.marker[this.navigateId];
    let newSelect = this.marker[this.navigateId==0?1:0];
    this.marker.forEach(element => {
      if(element!=selected && element.lng < selected.lng && (element.lng > newSelect.lng || newSelect.lng > selected.lng)){
        newSelect = element;
      }
    });
    if(newSelect.lng >= selected.lng){
      let min=this.marker[0]
      this.marker.forEach(element => {
        if(element.lng > min.lng){
          min = element;
        }
      });
      this.navigateId = min.id;
    }else{
      this.navigateId=newSelect.id
    }
  }

  private findFirstRightElement(){
    let selected = this.marker[this.navigateId];
    let newSelect = this.marker[this.navigateId==0?1:0];
    this.marker.forEach(element => {
      if(element!=selected && element.lng > selected.lng && (element.lng < newSelect.lng || newSelect.lng < selected.lng)){
        newSelect = element;
      }
    });
    if(newSelect.lng <= selected.lng){
      let min=this.marker[0]
      this.marker.forEach(element => {
        if(element.lng < min.lng){
          min = element;
        }
      });
      this.navigateId = min.id;
    }else{
      this.navigateId=newSelect.id
    }
  }

  private findFirstBottomElement(){
    let selected = this.marker[this.navigateId];
    let newSelect = this.marker[this.navigateId==0?1:0];
    this.marker.forEach(element => {
      if(element!=selected && element.lat < selected.lat && (element.lat > newSelect.lat || newSelect.lat > selected.lat)){
        newSelect = element;
      }
    });
    if(newSelect.lat >= selected.lat){
      let min=this.marker[0]
      this.marker.forEach(element => {
        
        if(element.lat > min.lat){
          min = element;
        }
      });
      this.navigateId = min.id;
    }else{
      this.navigateId=newSelect.id
    }
  }
    
  private findFirstTopElement(){
    let selected = this.marker[this.navigateId];
    let newSelect = this.marker[this.navigateId==0?1:0];
    this.marker.forEach(element => {
      if(element!=selected && element.lat > selected.lat && (element.lat < newSelect.lat || newSelect.lat < selected.lat)){
        newSelect = element;
      }
    });
    if(newSelect.lat <= selected.lat){
      let min=this.marker[0]
      this.marker.forEach(element => {
        if(element.lat < min.lat){
          min = element;
        }
      });
      this.navigateId = min.id;
    }else{
      this.navigateId=newSelect.id
    }
  }

  /*************** set position, move and zoom functions *************/

  // set new coordinates and handle zoom 
  private setPosition(): void {
    let coord = this.map.getCenter();
    this.mapLat = coord.lat;
    this.mapLng = coord.lng;
    this.mapZoom = this.map.getZoom();
    // calcul new move size
    this.setMoveShift();
  }

  // calcul new coordinates
  private moveMap(lat, lng): void {
    this.mapLat += lat * this.moveShift;
    this.mapLng += lng * this.moveShift;
    this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
  }

  // update zoom
  private zoomMap(zoom): void {
    this.mapZoom += zoom;
    this.map.setZoom(this.mapZoom);
  }

  // alter move padding
  setMoveShift() {
    this.moveShift = 80;
    for (let i = 1; i < this.mapZoom; i++) {
      this.moveShift /= 2;
    }
  }

  /*************** search input functions *************/

  // set input focus or blur
  initInput() {
    // select search input box
    this.searchInput = this.elem.nativeElement.querySelector(
      ".leaflet-control-geocoder-form input"
    );
    this.searchBar = this.elem.nativeElement.querySelector(
      ".leaflet-bar"
    );
    this.setFocusOut();
  }
  setFocus() {
    
    this.searchBar.style.display = "block";
    this.searchInput.focus();
    this.searchInputFocused = true;
  }
  setFocusOut() {
    this.searchInput.blur();
    this.searchBar.style.display = "none";
    this.searchInputFocused = false;

    this.setPosition();
  }
}
