import { Component, HostListener, Output, EventEmitter } from "@angular/core";
import * as L from "leaflet";
import "leaflet-control-geocoder";
import * as i0 from "@angular/core";
export var CONST;
(function (CONST) {
    CONST[CONST["ZOOM_MAX"] = 18] = "ZOOM_MAX";
    CONST[CONST["ZOOM_MIN"] = 2] = "ZOOM_MIN";
    CONST[CONST["LAT_MAX"] = 85] = "LAT_MAX";
})(CONST || (CONST = {}));
export class MapLibraryComponent {
    constructor(elem) {
        this.elem = elem;
        // input values
        this.mapLat = 45;
        this.mapLng = 5;
        this.mapZoom = 5;
        this.onchange = new EventEmitter();
        this.onselect = new EventEmitter();
        this.searchInputFocused = false;
        this.moveMode = true;
        this.handleIcon = "move";
        this.handleMenuIcon = "zoom";
        this.displayMenu = "";
        this.choiseMenu = 1;
        this.navigate = false;
        this.navigateId = 0;
        // display markers
        this.mapMarkers = [];
    }
    ngAfterViewInit() {
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
        }, 2000);
    }
    initMap() {
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
    setSearch(search) {
        if (this.search) {
            // load searching
            this.geocoder.setQuery(search)._geocode();
            // search the first element
            setTimeout(() => {
                if (this.geocoder._results && this.geocoder._results.length) {
                    this.geocoder._geocodeResultSelected(this.geocoder._results[0]);
                    this.geocoder._clearResults();
                }
            }, 2000);
        }
    }
    setMarker(marker) {
        this.cleanMarkers();
        let i = 0;
        marker.forEach(element => {
            if ("lat" in element && "lng" in element) {
                element.id = i;
                if (!element.text && element.img) {
                    this.mapMarkers[i] = this.generateImageMarker(element);
                }
                else if (!element.text) {
                    this.mapMarkers[i] = L.marker([element.lat, element.lng]);
                }
                else {
                    this.mapMarkers[i] = this.generateIconMarker(element);
                }
                this.mapMarkers[i].addTo(this.map);
                if (this.navigate && this.mapLat == element.lat && this.mapLng == element.lng) {
                    this.navigateId = i;
                    this.elem.nativeElement.querySelector("#marker_" + this.navigateId).style.background = "orange";
                }
                i++;
            }
        });
    }
    // remove all markers to display news
    cleanMarkers() {
        for (let i = 0; i < this.mapMarkers.length; i++) {
            this.map.removeLayer(this.mapMarkers[i]);
        }
    }
    // generate Marker
    generateIconMarker(element) {
        // set html form
        let html = `
      <div class="marker" id="marker_${element.id}">
        <div>${element.text}</div>
        ` + (element.content ? `<span>${element.content}</span>` : ``) +
            (element.img ? `<img src="${element.img}"/>` : ``) + `
      </div>`;
        // return leaflet marker
        return new L.Marker([element.lat, element.lng], {
            icon: new L.DivIcon({
                className: '',
                iconSize: [100, 70],
                iconAnchor: [60, element.img ? 40 : 10],
                html,
            })
        });
    }
    // generate image Marker
    generateImageMarker(element) {
        // set html form
        let html = `<img id="marker_${element.id}" style="width:80px;" src="${element.img}"/>`;
        // return leaflet marker
        return new L.Marker([element.lat, element.lng], {
            icon: new L.DivIcon({
                className: '',
                iconSize: [80, 70],
                iconAnchor: [45, element.img ? 40 : 10],
                html,
            })
        });
    }
    /*************** components attributes events *************/
    ngOnChanges(changes) {
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
    keyEvent(event) {
        if (this.focused) {
            if (this.displayMenu != "") {
                this.handlingMenu(event.key);
            }
            else if (this.navigate) {
                this.handlingNavigation(event.key);
            }
            else {
                this.handlingMap(event.key);
                // send change to parent application
                this.sendModifications(event.key);
            }
        }
    }
    handlingNavigation(key) {
        switch (key) {
            case "ArrowUp":
                this.navigateMarker(1, 0);
                break;
            case "ArrowDown":
                this.navigateMarker(-1, 0);
                break;
            case "ArrowRight":
                this.navigateMarker(0, 1);
                break;
            case "ArrowLeft":
                this.navigateMarker(0, -1);
                break;
            case "Enter":
                // send change to parent application
                if (this.marker[this.navigateId])
                    this.sendSelectEvent(this.marker[this.navigateId]);
                break;
            case "Escape":
                this.openMenu();
                break;
        }
    }
    handlingMenu(key) {
        switch (key) {
            case "ArrowRight":
                this.choiseMenu++;
                if (this.choiseMenu > 4) {
                    this.choiseMenu = 0;
                }
                break;
            case "ArrowLeft":
                this.choiseMenu--;
                if (this.choiseMenu < 0) {
                    this.choiseMenu = 4;
                }
                break;
            case "Enter":
                // reset navigation mode
                this.navigate = false;
                if (this.choiseMenu == 0) {
                    this.setFocus();
                }
                else {
                    this.setFocusOut();
                }
                if (this.choiseMenu == 1) {
                    this.handleIcon = "move";
                    this.moveMode = true;
                }
                else if (this.choiseMenu == 2) {
                    this.handleIcon = "zoom";
                    this.moveMode = false;
                }
                else if (this.choiseMenu == 3) {
                    this.setNavigationMode();
                }
                else if (this.choiseMenu == 4) {
                    alert("exit");
                }
                this.closeMenu();
                break;
            case "Escape":
                this.closeMenu();
                break;
        }
    }
    handlingMap(key) {
        switch (key) {
            case "ArrowUp":
                if (this.moveMode) {
                    if (this.map.getCenter().lat < CONST.LAT_MAX) {
                        this.moveMap(1, 0);
                    }
                }
                else {
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
                }
                else {
                    if (this.mapZoom > CONST.ZOOM_MIN) {
                        this.zoomMap(-1);
                        this.moveShift *= 2;
                    }
                }
                break;
            case "ArrowRight":
                if (this.moveMode) {
                    this.moveMap(0, 1);
                }
                else {
                }
                break;
            case "ArrowLeft":
                if (this.moveMode) {
                    this.moveMap(0, -1);
                }
                else {
                }
                break;
            case "Enter":
                this.changeMode();
                break;
            case "Escape":
                this.openMenu();
                break;
        }
    }
    // display move or zoom icon when press
    changeMode() {
        this.moveMode = !this.moveMode;
        if (this.moveMode) {
            this.handleIcon = "move";
            this.choiseMenu = 1;
        }
        else {
            this.handleIcon = "zoom";
            this.choiseMenu = 2;
        }
    }
    sendModifications(key) {
        // calcul map outline by container size and pixel progection
        let mapSize = this.map.getSize();
        let centerPixel = this.map.project([this.mapLat, this.mapLng], this.mapZoom);
        let topLeft = this.map.unproject([centerPixel.x - mapSize.x / 2, centerPixel.y - mapSize.y / 2], this.mapZoom);
        let bottomRight = this.map.unproject([centerPixel.x + mapSize.x / 2, centerPixel.y + mapSize.y / 2], this.mapZoom);
        // send coordinates results
        this.onchange.emit({
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
        });
    }
    sendSelectEvent(selected) {
        this.onselect.emit(selected);
    }
    /*************** escape app functions *************/
    openMenu() {
        this.displayMenu = "show-menu";
    }
    closeMenu() {
        this.displayMenu = "";
    }
    // show escape message
    selectMenu(key) {
        if (key == "Escape") {
            this.closeMenu();
        }
        else {
            //this.validEscape = false;
        }
    }
    /*************** navigate between markers *************/
    setNavigationMode() {
        this.navigate = true;
        this.handleIcon = "navigation";
        this.navigateMarker(0, 0);
        // define menu to move
        this.moveMode = false;
        this.handleMenuIcon = "move";
    }
    navigateMarker(lat, lng) {
        if (!this.marker.length) {
            return;
        }
        if (this.marker.length == 1) {
            this.navigateId = 0;
            this.elem.nativeElement.querySelector("#marker_" + this.navigateId).style.background = "orange";
            return;
        }
        if (this.navigateId > this.marker.length) {
            this.navigateId = 0;
        }
        if (lat != 0 || lng != 0) {
            // reset previous
            this.elem.nativeElement.querySelector("#marker_" + this.marker[this.navigateId].id).style.background = "white";
        }
        // display new
        if (lng > 0) {
            this.findFirstRightElement();
        }
        else if (lng < 0) {
            this.findFirstLeftElement();
        }
        else if (lat > 0) {
            this.findFirstTopElement();
        }
        else if (lat < 0) {
            this.findFirstBottomElement();
        }
        else {
            this.navigateId = 0;
        }
        let el = this.marker[this.navigateId];
        this.mapLat = el.lat;
        this.mapLng = el.lng;
        this.moveMap(0, 0);
        this.sendModifications("");
    }
    calcAngle(adjacent, opposite) {
        return Math.atan(Math.abs(opposite) / Math.abs(adjacent)) * (180 / Math.PI);
    }
    calcHyp(adjacent, opposite) {
        return Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
        ;
    }
    findFirstLeftElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = null;
        this.marker.forEach(element => {
            if (element != selected && element.lng < selected.lng && (newSelect == null || (element.lng > newSelect.lng || newSelect.lng > selected.lng))) {
                let angle = this.calcAngle(element.lng - selected.lng, element.lat - selected.lat);
                //console.log(element.text+" "+angle)
                if (angle < 45) {
                    newSelect = element;
                }
            }
        });
        if (newSelect == null || newSelect.lng >= selected.lng) {
            this.navigateId = selected.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstRightElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = null;
        this.marker.forEach(element => {
            if (element != selected && element.lng > selected.lng && (newSelect == null || (element.lng < newSelect.lng || newSelect.lng < selected.lng))) {
                let angle = this.calcAngle(element.lng - selected.lng, element.lat - selected.lat);
                if (angle < 45) {
                    newSelect = element;
                }
            }
        });
        if (newSelect == null || newSelect.lng <= selected.lng) {
            this.navigateId = selected.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstBottomElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lat < selected.lat && (element.lat > newSelect.lat || newSelect.lat > selected.lat)) {
                newSelect = element;
            }
        });
        if (newSelect.lat >= selected.lat) {
            this.navigateId = selected.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    findFirstTopElement() {
        let selected = this.marker[this.navigateId];
        let newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(element => {
            if (element != selected && element.lat > selected.lat && (element.lat < newSelect.lat || newSelect.lat < selected.lat)) {
                newSelect = element;
            }
        });
        if (newSelect.lat <= selected.lat) {
            this.navigateId = selected.id;
        }
        else {
            this.navigateId = newSelect.id;
        }
    }
    /*************** set position, move and zoom functions *************/
    // set new coordinates and handle zoom 
    setPosition() {
        let coord = this.map.getCenter();
        this.mapLat = coord.lat;
        this.mapLng = coord.lng;
        this.mapZoom = this.map.getZoom();
        // calcul new move size
        this.setMoveShift();
    }
    // calcul new coordinates
    moveMap(lat, lng) {
        this.mapLat += lat * this.moveShift;
        this.mapLng += lng * this.moveShift;
        this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
    }
    // update zoom
    zoomMap(zoom) {
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
        this.searchInput = this.elem.nativeElement.querySelector(".leaflet-control-geocoder-form input");
        this.searchBar = this.elem.nativeElement.querySelector(".leaflet-bar");
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
MapLibraryComponent.ɵfac = function MapLibraryComponent_Factory(t) { return new (t || MapLibraryComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); };
MapLibraryComponent.ɵcmp = i0.ɵɵdefineComponent({ type: MapLibraryComponent, selectors: [["map-library"]], hostBindings: function MapLibraryComponent_HostBindings(rf, ctx) { if (rf & 1) {
        i0.ɵɵlistener("keyup", function MapLibraryComponent_keyup_HostBindingHandler($event) { return ctx.keyEvent($event); }, false, i0.ɵɵresolveWindow);
    } }, inputs: { mapLat: "mapLat", mapLng: "mapLng", mapZoom: "mapZoom", search: "search", marker: "marker", focused: "focused" }, outputs: { onchange: "onchange", onselect: "onselect" }, features: [i0.ɵɵNgOnChangesFeature], decls: 10, vars: 21, consts: [[1, "map-container"], ["id", "map"], [1, "menu-container"], [1, "menu-box"]], template: function MapLibraryComponent_Template(rf, ctx) { if (rf & 1) {
        i0.ɵɵelementStart(0, "div", 0);
        i0.ɵɵelement(1, "i");
        i0.ɵɵelement(2, "div", 1);
        i0.ɵɵelementEnd();
        i0.ɵɵelementStart(3, "div", 2);
        i0.ɵɵelementStart(4, "div", 3);
        i0.ɵɵelement(5, "i");
        i0.ɵɵelement(6, "i");
        i0.ɵɵelement(7, "i");
        i0.ɵɵelement(8, "i");
        i0.ɵɵelement(9, "i");
        i0.ɵɵelementEnd();
        i0.ɵɵelementEnd();
    } if (rf & 2) {
        i0.ɵɵadvance(1);
        i0.ɵɵclassMapInterpolate1("icon ", ctx.handleIcon, "");
        i0.ɵɵadvance(2);
        i0.ɵɵclassMap(ctx.displayMenu);
        i0.ɵɵadvance(2);
        i0.ɵɵclassMapInterpolate1("icon search ", ctx.choiseMenu == 0 ? "selected" : "", "");
        i0.ɵɵadvance(1);
        i0.ɵɵclassMapInterpolate1("icon move ", ctx.choiseMenu == 1 ? "selected" : "", "");
        i0.ɵɵadvance(1);
        i0.ɵɵclassMapInterpolate1("icon zoom ", ctx.choiseMenu == 2 ? "selected" : "", "");
        i0.ɵɵadvance(1);
        i0.ɵɵclassMapInterpolate1("icon navigation ", ctx.choiseMenu == 3 ? "selected" : "", "");
        i0.ɵɵadvance(1);
        i0.ɵɵclassMapInterpolate1("icon logout ", ctx.choiseMenu == 4 ? "selected" : "", "");
    } }, styles: [".map-container[_ngcontent-%COMP%]{position:absolute;z-index:1;top:0;left:0;right:0;bottom:0}#map[_ngcontent-%COMP%]{width:100%;height:100%}.map-container[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{position:absolute;z-index:1000;top:10px;right:10px;width:50px;height:50px}.menu-container[_ngcontent-%COMP%]{position:absolute;z-index:1001;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.3);display:none}.menu-box[_ngcontent-%COMP%]{position:absolute;top:calc(50% - 100px);left:calc(50% - 375px);width:750px;height:150px;background-color:#fff;border:1px solid orange!important;text-align:center;margin-top:50px}.menu-box[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%]{display:inline-block;width:150px;height:150px;border:0;border-radius:3px;background-size:100px 100px;background-repeat:no-repeat;background-position:center}.menu-box[_ngcontent-%COMP%]   .selected[_ngcontent-%COMP%]{background-color:orange}.show-menu[_ngcontent-%COMP%]{display:block}"] });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(MapLibraryComponent, [{
        type: Component,
        args: [{
                selector: "map-library",
                inputs: ['mapLat', 'mapLng', 'mapZoom', 'search', 'marker', 'focused'],
                templateUrl: "./map-library.component.html",
                styleUrls: ["./map-library.component.css",],
            }]
    }], function () { return [{ type: i0.ElementRef }]; }, { onchange: [{
            type: Output
        }], onselect: [{
            type: Output
        }], keyEvent: [{
            type: HostListener,
            args: ["window:keyup", ["$event"]]
        }] }); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLWxpYnJhcnkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbWFwLWxpYnJhcnkvIiwic291cmNlcyI6WyJsaWIvbWFwLWxpYnJhcnkuY29tcG9uZW50LnRzIiwibGliL21hcC1saWJyYXJ5LmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxTQUFTLEVBQ1QsWUFBWSxFQUVaLE1BQU0sRUFDTixZQUFZLEVBRWIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDN0IsT0FBTywwQkFBMEIsQ0FBQzs7QUFFbEMsTUFBTSxDQUFOLElBQVksS0FJWDtBQUpELFdBQVksS0FBSztJQUNmLDBDQUFhLENBQUE7SUFDYix5Q0FBWSxDQUFBO0lBQ1osd0NBQVksQ0FBQTtBQUNkLENBQUMsRUFKVyxLQUFLLEtBQUwsS0FBSyxRQUloQjtBQVNELE1BQU0sT0FBTyxtQkFBbUI7SUEyQjlCLFlBQW9CLElBQWdCO1FBQWhCLFNBQUksR0FBSixJQUFJLENBQVk7UUF6QnBDLGVBQWU7UUFDUixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBQ3BCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFDbkIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUtqQixhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUNuQyxhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQU1yQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDM0IsYUFBUSxHQUFHLElBQUksQ0FBQztRQUVqQixlQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLG1CQUFjLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLGdCQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDZCxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFzRHZCLGtCQUFrQjtRQUNWLGVBQVUsR0FB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LGVBQXVCO1FBQXZCLDhCQUF1QjtRQUV4QyxlQUFxRDtRQUFyRCxvRkFBcUQ7UUFDckQsZUFBbUQ7UUFBbkQsa0ZBQW1EO1FBQ25ELGVBQW1EO1FBQW5ELGtGQUFtRDtRQUNuRCxlQUF5RDtRQUF6RCx3RkFBeUQ7UUFDekQsZUFBcUQ7UUFBckQsb0ZBQXFEOztrRERlbkQsbUJBQW1CO2NBUC9CLFNBQVM7ZUFBQztnQkFDVCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsTUFBTSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBQyxTQUFTLENBQUM7Z0JBQ3JFLFdBQVcsRUFBRSw4QkFBOEI7Z0JBQzNDLFNBQVMsRUFBRSxDQUFDLDZCQUE2QixFQUFFO2FBQzVDOztrQkFZRSxNQUFNOztrQkFDTixNQUFNOztrQkFzS04sWUFBWTttQkFBQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDb21wb25lbnQsXG4gIEhvc3RMaXN0ZW5lcixcbiAgRWxlbWVudFJlZixcbiAgT3V0cHV0LFxuICBFdmVudEVtaXR0ZXIsXG4gIFNpbXBsZUNoYW5nZXNcbn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCAqIGFzIEwgZnJvbSBcImxlYWZsZXRcIjtcbmltcG9ydCBcImxlYWZsZXQtY29udHJvbC1nZW9jb2RlclwiO1xuXG5leHBvcnQgZW51bSBDT05TVCB7XG4gIFpPT01fTUFYID0gMTgsXG4gIFpPT01fTUlOID0gMixcbiAgTEFUX01BWCA9IDg1LFxufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6IFwibWFwLWxpYnJhcnlcIixcbiAgaW5wdXRzOiBbJ21hcExhdCcsICdtYXBMbmcnLCAnbWFwWm9vbScsICdzZWFyY2gnLCAnbWFya2VyJywnZm9jdXNlZCddLFxuICB0ZW1wbGF0ZVVybDogXCIuL21hcC1saWJyYXJ5LmNvbXBvbmVudC5odG1sXCIsXG4gIHN0eWxlVXJsczogW1wiLi9tYXAtbGlicmFyeS5jb21wb25lbnQuY3NzXCIsXSxcbn0pXG5cbmV4cG9ydCBjbGFzcyBNYXBMaWJyYXJ5Q29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgLy8gaW5wdXQgdmFsdWVzXG4gIHB1YmxpYyBtYXBMYXQ6IG51bWJlciA9IDQ1O1xuICBwdWJsaWMgbWFwTG5nOiBudW1iZXIgPSA1O1xuICBwdWJsaWMgbWFwWm9vbTogbnVtYmVyID0gNTtcbiAgcHVibGljIHNlYXJjaDogU3RyaW5nO1xuICBwdWJsaWMgbWFya2VyOiBhbnk7XG4gIHB1YmxpYyBmb2N1c2VkOiBib29sZWFuO1xuXG4gIEBPdXRwdXQoKSBvbmNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgb25zZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICBwcml2YXRlIG1hcDtcbiAgcHJpdmF0ZSBnZW9jb2RlcjtcbiAgcHJpdmF0ZSBzZWFyY2hJbnB1dDtcbiAgcHJpdmF0ZSBzZWFyY2hCYXI7XG4gIHByaXZhdGUgc2VhcmNoSW5wdXRGb2N1c2VkID0gZmFsc2U7XG4gIHByaXZhdGUgbW92ZU1vZGUgPSB0cnVlO1xuICBwcml2YXRlIG1vdmVTaGlmdDtcbiAgcHVibGljIGhhbmRsZUljb24gPSBcIm1vdmVcIjtcbiAgcHVibGljIGhhbmRsZU1lbnVJY29uID0gXCJ6b29tXCI7XG4gIHB1YmxpYyBkaXNwbGF5TWVudSA9IFwiXCI7XG4gIHB1YmxpYyBjaG9pc2VNZW51ID0gMTtcbiAgcHJpdmF0ZSBuYXZpZ2F0ZSA9IGZhbHNlO1xuICBwcml2YXRlIG5hdmlnYXRlSWQgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbTogRWxlbWVudFJlZikgeyB9XG5cbiAgbmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuICAgIC8vIGluaXQgbWFwXG4gICAgdGhpcy5pbml0TWFwKCk7XG4gICAgdGhpcy5pbml0SW5wdXQoKTtcbiAgICB0aGlzLnNldE1vdmVTaGlmdCgpO1xuXG4gICAgLy8gaW5pdCBkaXNwbGF5IGlucHV0IHJlcXVlc3RcbiAgICB0aGlzLnNldFNlYXJjaCh0aGlzLnNlYXJjaCk7XG4gICAgdGhpcy5zZXRNYXJrZXIodGhpcy5tYXJrZXIpO1xuICAgIC8vIHNlbmQgaW5pdCBldmVudFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zZW5kTW9kaWZpY2F0aW9ucyhcIlwiKTtcbiAgICB9LCAyMDAwKVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0TWFwKCk6IHZvaWQge1xuICAgIC8vIGluaXQgbWFwXG4gICAgdGhpcy5tYXAgPSBMLm1hcChcIm1hcFwiLCB7XG4gICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlLFxuICAgICAgem9vbUNvbnRyb2w6IGZhbHNlLFxuICAgICAgY2VudGVyOiBbdGhpcy5tYXBMYXQsIHRoaXMubWFwTG5nXSxcbiAgICAgIHpvb206IHRoaXMubWFwWm9vbSxcbiAgICB9KTtcbiAgICAvLyBkaXNwbGF5IG1hcFxuICAgIEwudGlsZUxheWVyKFwiaHR0cHM6Ly97c30udGlsZS5vc20ub3JnL3t6fS97eH0ve3l9LnBuZ1wiKS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgLy8gZGlzYWJsZSBrZXlib2FyZFxuICAgIHRoaXMubWFwLmtleWJvYXJkLmRpc2FibGUoKTtcbiAgICAvLyBhZGQgc2VhcmNoIGJveFxuICAgIHRoaXMuZ2VvY29kZXIgPSBMLkNvbnRyb2wuZ2VvY29kZXIoe1xuICAgICAgcG9zaXRpb246IFwidG9wbGVmdFwiLFxuICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgIHBsYWNlaG9sZGVyOiBcIlJlY2hlcmNoZS4uLlwiLFxuICAgICAgZGVmYXVsdE1hcmtHZW9jb2RlOiB0cnVlLFxuICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0U2VhcmNoKHNlYXJjaCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnNlYXJjaCkge1xuICAgICAgLy8gbG9hZCBzZWFyY2hpbmdcbiAgICAgIHRoaXMuZ2VvY29kZXIuc2V0UXVlcnkoc2VhcmNoKS5fZ2VvY29kZSgpXG4gICAgICAvLyBzZWFyY2ggdGhlIGZpcnN0IGVsZW1lbnRcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5nZW9jb2Rlci5fcmVzdWx0cyAmJiB0aGlzLmdlb2NvZGVyLl9yZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuZ2VvY29kZXIuX2dlb2NvZGVSZXN1bHRTZWxlY3RlZCh0aGlzLmdlb2NvZGVyLl9yZXN1bHRzWzBdKVxuICAgICAgICAgIHRoaXMuZ2VvY29kZXIuX2NsZWFyUmVzdWx0cygpO1xuICAgICAgICB9XG4gICAgICB9LCAyMDAwKTtcbiAgICB9XG4gIH1cblxuICAvLyBkaXNwbGF5IG1hcmtlcnNcbiAgcHJpdmF0ZSBtYXBNYXJrZXJzID0gW107XG4gIHByaXZhdGUgc2V0TWFya2VyKG1hcmtlcik6IHZvaWQge1xuXG4gICAgdGhpcy5jbGVhbk1hcmtlcnMoKTtcbiAgICBsZXQgaSA9IDA7XG4gICAgbWFya2VyLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBpZiAoXCJsYXRcIiBpbiBlbGVtZW50ICYmIFwibG5nXCIgaW4gZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LmlkID0gaTtcbiAgICAgICAgaWYgKCFlbGVtZW50LnRleHQgJiYgZWxlbWVudC5pbWcpIHtcbiAgICAgICAgICB0aGlzLm1hcE1hcmtlcnNbaV0gPSB0aGlzLmdlbmVyYXRlSW1hZ2VNYXJrZXIoZWxlbWVudClcbiAgICAgICAgfSBlbHNlIGlmICghZWxlbWVudC50ZXh0KSB7XG4gICAgICAgICAgdGhpcy5tYXBNYXJrZXJzW2ldID0gTC5tYXJrZXIoW2VsZW1lbnQubGF0LCBlbGVtZW50LmxuZ10pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5tYXBNYXJrZXJzW2ldID0gdGhpcy5nZW5lcmF0ZUljb25NYXJrZXIoZWxlbWVudClcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hcE1hcmtlcnNbaV0uYWRkVG8odGhpcy5tYXApO1xuXG4gICAgICAgIGlmICh0aGlzLm5hdmlnYXRlICYmIHRoaXMubWFwTGF0ID09IGVsZW1lbnQubGF0ICYmIHRoaXMubWFwTG5nID09IGVsZW1lbnQubG5nKSB7XG4gICAgICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gaVxuICAgICAgICAgIHRoaXMuZWxlbS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFya2VyX1wiICsgdGhpcy5uYXZpZ2F0ZUlkKS5zdHlsZS5iYWNrZ3JvdW5kID0gXCJvcmFuZ2VcIjtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyByZW1vdmUgYWxsIG1hcmtlcnMgdG8gZGlzcGxheSBuZXdzXG4gIHByaXZhdGUgY2xlYW5NYXJrZXJzKCkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5tYXBNYXJrZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLm1hcE1hcmtlcnNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIGdlbmVyYXRlIE1hcmtlclxuICBwcml2YXRlIGdlbmVyYXRlSWNvbk1hcmtlcihlbGVtZW50KSB7XG5cbiAgICAvLyBzZXQgaHRtbCBmb3JtXG4gICAgbGV0IGh0bWwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwibWFya2VyXCIgaWQ9XCJtYXJrZXJfJHtlbGVtZW50LmlkfVwiPlxuICAgICAgICA8ZGl2PiR7ZWxlbWVudC50ZXh0fTwvZGl2PlxuICAgICAgICBgKyAoZWxlbWVudC5jb250ZW50ID8gYDxzcGFuPiR7ZWxlbWVudC5jb250ZW50fTwvc3Bhbj5gIDogYGApICtcbiAgICAgICAgKGVsZW1lbnQuaW1nID8gYDxpbWcgc3JjPVwiJHtlbGVtZW50LmltZ31cIi8+YCA6IGBgKSArIGBcbiAgICAgIDwvZGl2PmBcblxuICAgIC8vIHJldHVybiBsZWFmbGV0IG1hcmtlclxuICAgIHJldHVybiBuZXcgTC5NYXJrZXIoW2VsZW1lbnQubGF0LCBlbGVtZW50LmxuZ10sIHtcbiAgICAgIGljb246IG5ldyBMLkRpdkljb24oe1xuICAgICAgICBjbGFzc05hbWU6ICcnLFxuICAgICAgICBpY29uU2l6ZTogWzEwMCwgNzBdLCAvLyBzaXplIG9mIHRoZSBpY29uXG4gICAgICAgIGljb25BbmNob3I6IFs2MCwgZWxlbWVudC5pbWcgPyA0MCA6IDEwXSxcbiAgICAgICAgaHRtbCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIGdlbmVyYXRlIGltYWdlIE1hcmtlclxuICBwcml2YXRlIGdlbmVyYXRlSW1hZ2VNYXJrZXIoZWxlbWVudCkge1xuXG4gICAgLy8gc2V0IGh0bWwgZm9ybVxuICAgIGxldCBodG1sID0gYDxpbWcgaWQ9XCJtYXJrZXJfJHtlbGVtZW50LmlkfVwiIHN0eWxlPVwid2lkdGg6ODBweDtcIiBzcmM9XCIke2VsZW1lbnQuaW1nfVwiLz5gXG5cbiAgICAvLyByZXR1cm4gbGVhZmxldCBtYXJrZXJcbiAgICByZXR1cm4gbmV3IEwuTWFya2VyKFtlbGVtZW50LmxhdCwgZWxlbWVudC5sbmddLCB7XG4gICAgICBpY29uOiBuZXcgTC5EaXZJY29uKHtcbiAgICAgICAgY2xhc3NOYW1lOiAnJyxcbiAgICAgICAgaWNvblNpemU6IFs4MCwgNzBdLCAvLyBzaXplIG9mIHRoZSBpY29uXG4gICAgICAgIGljb25BbmNob3I6IFs0NSwgZWxlbWVudC5pbWcgPyA0MCA6IDEwXSxcbiAgICAgICAgaHRtbCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKioqKioqKioqKioqKiogY29tcG9uZW50cyBhdHRyaWJ1dGVzIGV2ZW50cyAqKioqKioqKioqKioqL1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcbiAgICBpZiAodGhpcy5tYXApIHtcbiAgICAgIHN3aXRjaCAoT2JqZWN0LmtleXMoY2hhbmdlcylbMF0pIHtcbiAgICAgICAgY2FzZSBcIm1hcFpvb21cIjpcbiAgICAgICAgY2FzZSBcIm1hcExhdFwiOlxuICAgICAgICBjYXNlIFwibWFwTG5nXCI6XG4gICAgICAgICAgdGhpcy5tYXAuc2V0VmlldyhbdGhpcy5tYXBMYXQsIHRoaXMubWFwTG5nXSwgdGhpcy5tYXBab29tKTtcbiAgICAgICAgICB0aGlzLnNldE1vdmVTaGlmdCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibWFya2VyXCI6XG4gICAgICAgICAgdGhpcy5zZXRNYXJrZXIodGhpcy5tYXJrZXIpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic2VhcmNoXCI6XG4gICAgICAgICAgdGhpcy5zZXRTZWFyY2godGhpcy5zZWFyY2gpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKioqKioqKioqKioqKioga2V5Ym9hcmQgZXZlbnQgZGV0ZWN0IGFuZCBmdW5jdGlvbnMgKioqKioqKioqKioqKi9cblxuXG5cbiAgQEhvc3RMaXN0ZW5lcihcIndpbmRvdzprZXl1cFwiLCBbXCIkZXZlbnRcIl0pXG4gIGtleUV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYodGhpcy5mb2N1c2VkKXtcbiAgICAgIGlmICh0aGlzLmRpc3BsYXlNZW51ICE9IFwiXCIpIHtcbiAgICAgICAgdGhpcy5oYW5kbGluZ01lbnUoZXZlbnQua2V5KTtcblxuICAgICAgfSBlbHNlIGlmICh0aGlzLm5hdmlnYXRlKSB7XG4gICAgICAgIHRoaXMuaGFuZGxpbmdOYXZpZ2F0aW9uKGV2ZW50LmtleSlcblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5oYW5kbGluZ01hcChldmVudC5rZXkpXG4gICAgICAgIC8vIHNlbmQgY2hhbmdlIHRvIHBhcmVudCBhcHBsaWNhdGlvblxuICAgICAgICB0aGlzLnNlbmRNb2RpZmljYXRpb25zKGV2ZW50LmtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGluZ05hdmlnYXRpb24oa2V5KTogdm9pZCB7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIHRoaXMubmF2aWdhdGVNYXJrZXIoMSwgMClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dEb3duXCI6XG4gICAgICAgIHRoaXMubmF2aWdhdGVNYXJrZXIoLTEsIDApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZU1hcmtlcigwLCAxKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZU1hcmtlcigwLCAtMSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRW50ZXJcIjpcbiAgICAgICAgLy8gc2VuZCBjaGFuZ2UgdG8gcGFyZW50IGFwcGxpY2F0aW9uXG4gICAgICAgIGlmICh0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWRdKVxuICAgICAgICAgIHRoaXMuc2VuZFNlbGVjdEV2ZW50KHRoaXMubWFya2VyW3RoaXMubmF2aWdhdGVJZF0pXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVzY2FwZVwiOlxuICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxpbmdNZW51KGtleSk6IHZvaWQge1xuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICB0aGlzLmNob2lzZU1lbnUrKztcbiAgICAgICAgaWYgKHRoaXMuY2hvaXNlTWVudSA+IDQpIHtcbiAgICAgICAgICB0aGlzLmNob2lzZU1lbnUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93TGVmdFwiOlxuICAgICAgICB0aGlzLmNob2lzZU1lbnUtLTtcbiAgICAgICAgaWYgKHRoaXMuY2hvaXNlTWVudSA8IDApIHtcbiAgICAgICAgICB0aGlzLmNob2lzZU1lbnUgPSA0O1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIC8vIHJlc2V0IG5hdmlnYXRpb24gbW9kZVxuICAgICAgICB0aGlzLm5hdmlnYXRlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuY2hvaXNlTWVudSA9PSAwKSB7XG4gICAgICAgICAgdGhpcy5zZXRGb2N1cygpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZXRGb2N1c091dCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNob2lzZU1lbnUgPT0gMSkge1xuICAgICAgICAgIHRoaXMuaGFuZGxlSWNvbiA9IFwibW92ZVwiO1xuICAgICAgICAgIHRoaXMubW92ZU1vZGUgPSB0cnVlXG5cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNob2lzZU1lbnUgPT0gMikge1xuICAgICAgICAgIHRoaXMuaGFuZGxlSWNvbiA9IFwiem9vbVwiO1xuICAgICAgICAgIHRoaXMubW92ZU1vZGUgPSBmYWxzZVxuXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaG9pc2VNZW51ID09IDMpIHtcbiAgICAgICAgICB0aGlzLnNldE5hdmlnYXRpb25Nb2RlKClcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2hvaXNlTWVudSA9PSA0KSB7XG4gICAgICAgICAgYWxlcnQoXCJleGl0XCIpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFc2NhcGVcIjpcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGluZ01hcChrZXkpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSBcIkFycm93VXBcIjpcbiAgICAgICAgaWYgKHRoaXMubW92ZU1vZGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5tYXAuZ2V0Q2VudGVyKCkubGF0IDwgQ09OU1QuTEFUX01BWCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlTWFwKDEsIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5tYXBab29tIDwgQ09OU1QuWk9PTV9NQVgpIHtcbiAgICAgICAgICAgIHRoaXMuem9vbU1hcCgxKTtcbiAgICAgICAgICAgIHRoaXMubW92ZVNoaWZ0IC89IDI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICBpZiAodGhpcy5tb3ZlTW9kZSkge1xuICAgICAgICAgIGlmICh0aGlzLm1hcC5nZXRDZW50ZXIoKS5sYXQgPiAtQ09OU1QuTEFUX01BWCkge1xuICAgICAgICAgICAgdGhpcy5tb3ZlTWFwKC0xLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMubWFwWm9vbSA+IENPTlNULlpPT01fTUlOKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21NYXAoLTEpO1xuICAgICAgICAgICAgdGhpcy5tb3ZlU2hpZnQgKj0gMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dSaWdodFwiOlxuICAgICAgICBpZiAodGhpcy5tb3ZlTW9kZSkge1xuICAgICAgICAgIHRoaXMubW92ZU1hcCgwLCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgaWYgKHRoaXMubW92ZU1vZGUpIHtcbiAgICAgICAgICB0aGlzLm1vdmVNYXAoMCwgLTEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIHRoaXMuY2hhbmdlTW9kZSgpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVzY2FwZVwiOlxuICAgICAgICB0aGlzLm9wZW5NZW51KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vIGRpc3BsYXkgbW92ZSBvciB6b29tIGljb24gd2hlbiBwcmVzc1xuICBwcml2YXRlIGNoYW5nZU1vZGUoKTogdm9pZCB7XG4gICAgdGhpcy5tb3ZlTW9kZSA9ICF0aGlzLm1vdmVNb2RlO1xuICAgIGlmICh0aGlzLm1vdmVNb2RlKSB7XG4gICAgICB0aGlzLmhhbmRsZUljb24gPSBcIm1vdmVcIjtcbiAgICAgIHRoaXMuY2hvaXNlTWVudSA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFuZGxlSWNvbiA9IFwiem9vbVwiO1xuICAgICAgdGhpcy5jaG9pc2VNZW51ID0gMjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNlbmRNb2RpZmljYXRpb25zKGtleSkge1xuICAgIC8vIGNhbGN1bCBtYXAgb3V0bGluZSBieSBjb250YWluZXIgc2l6ZSBhbmQgcGl4ZWwgcHJvZ2VjdGlvblxuICAgIGxldCBtYXBTaXplID0gdGhpcy5tYXAuZ2V0U2l6ZSgpO1xuICAgIGxldCBjZW50ZXJQaXhlbCA9IHRoaXMubWFwLnByb2plY3QoW3RoaXMubWFwTGF0LCB0aGlzLm1hcExuZ10sIHRoaXMubWFwWm9vbSlcbiAgICBsZXQgdG9wTGVmdCA9IHRoaXMubWFwLnVucHJvamVjdChbY2VudGVyUGl4ZWwueCAtIG1hcFNpemUueCAvIDIsIGNlbnRlclBpeGVsLnkgLSBtYXBTaXplLnkgLyAyXSwgdGhpcy5tYXBab29tKVxuICAgIGxldCBib3R0b21SaWdodCA9IHRoaXMubWFwLnVucHJvamVjdChbY2VudGVyUGl4ZWwueCArIG1hcFNpemUueCAvIDIsIGNlbnRlclBpeGVsLnkgKyBtYXBTaXplLnkgLyAyXSwgdGhpcy5tYXBab29tKVxuXG4gICAgLy8gc2VuZCBjb29yZGluYXRlcyByZXN1bHRzXG4gICAgdGhpcy5vbmNoYW5nZS5lbWl0KFxuICAgICAge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgem9vbTogdGhpcy5tYXBab29tLFxuICAgICAgICBsYXQ6IHRoaXMubWFwTGF0LFxuICAgICAgICBsbmc6IHRoaXMubWFwTG5nLFxuICAgICAgICB2aWV3OiB7XG4gICAgICAgICAgdG9wOiB0b3BMZWZ0LmxhdCxcbiAgICAgICAgICBsZWZ0OiB0b3BMZWZ0LmxuZyxcbiAgICAgICAgICBib3R0b206IGJvdHRvbVJpZ2h0LmxhdCxcbiAgICAgICAgICByaWdodDogYm90dG9tUmlnaHQubG5nXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH1cblxuICBwcml2YXRlIHNlbmRTZWxlY3RFdmVudChzZWxlY3RlZCkge1xuICAgIHRoaXMub25zZWxlY3QuZW1pdChzZWxlY3RlZClcbiAgfVxuXG4gIC8qKioqKioqKioqKioqKiogZXNjYXBlIGFwcCBmdW5jdGlvbnMgKioqKioqKioqKioqKi9cblxuICBwcml2YXRlIG9wZW5NZW51KCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGxheU1lbnUgPSBcInNob3ctbWVudVwiO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9zZU1lbnUoKTogdm9pZCB7XG4gICAgdGhpcy5kaXNwbGF5TWVudSA9IFwiXCI7XG4gIH1cbiAgLy8gc2hvdyBlc2NhcGUgbWVzc2FnZVxuICBwcml2YXRlIHNlbGVjdE1lbnUoa2V5KTogdm9pZCB7XG4gICAgaWYgKGtleSA9PSBcIkVzY2FwZVwiKSB7XG4gICAgICB0aGlzLmNsb3NlTWVudSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdGhpcy52YWxpZEVzY2FwZSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKioqKioqKioqKioqKiogbmF2aWdhdGUgYmV0d2VlbiBtYXJrZXJzICoqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBzZXROYXZpZ2F0aW9uTW9kZSgpOiB2b2lkIHtcbiAgICB0aGlzLm5hdmlnYXRlID0gdHJ1ZTtcbiAgICB0aGlzLmhhbmRsZUljb24gPSBcIm5hdmlnYXRpb25cIjtcbiAgICB0aGlzLm5hdmlnYXRlTWFya2VyKDAsIDApXG4gICAgLy8gZGVmaW5lIG1lbnUgdG8gbW92ZVxuICAgIHRoaXMubW92ZU1vZGUgPSBmYWxzZVxuICAgIHRoaXMuaGFuZGxlTWVudUljb24gPSBcIm1vdmVcIlxuICB9XG5cbiAgcHJpdmF0ZSBuYXZpZ2F0ZU1hcmtlcihsYXQsIGxuZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5tYXJrZXIubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLm1hcmtlci5sZW5ndGggPT0gMSkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gMDtcbiAgICAgIHRoaXMuZWxlbS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFya2VyX1wiICsgdGhpcy5uYXZpZ2F0ZUlkKS5zdHlsZS5iYWNrZ3JvdW5kID0gXCJvcmFuZ2VcIjtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMubmF2aWdhdGVJZCA+IHRoaXMubWFya2VyLmxlbmd0aCkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gMDtcbiAgICB9XG4gICAgaWYgKGxhdCAhPSAwIHx8IGxuZyAhPSAwKSB7XG4gICAgICAvLyByZXNldCBwcmV2aW91c1xuICAgICAgdGhpcy5lbGVtLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcihcIiNtYXJrZXJfXCIgKyB0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWRdLmlkKS5zdHlsZS5iYWNrZ3JvdW5kID0gXCJ3aGl0ZVwiO1xuICAgIH1cbiAgICAvLyBkaXNwbGF5IG5ld1xuICAgIGlmIChsbmcgPiAwKSB7XG4gICAgICB0aGlzLmZpbmRGaXJzdFJpZ2h0RWxlbWVudCgpO1xuICAgIH0gZWxzZSBpZiAobG5nIDwgMCkge1xuICAgICAgdGhpcy5maW5kRmlyc3RMZWZ0RWxlbWVudCgpO1xuICAgIH0gZWxzZSBpZiAobGF0ID4gMCkge1xuICAgICAgdGhpcy5maW5kRmlyc3RUb3BFbGVtZW50KCk7XG4gICAgfSBlbHNlIGlmIChsYXQgPCAwKSB7XG4gICAgICB0aGlzLmZpbmRGaXJzdEJvdHRvbUVsZW1lbnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gMFxuICAgIH1cbiAgICBsZXQgZWwgPSB0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWRdO1xuICAgIHRoaXMubWFwTGF0ID0gZWwubGF0XG4gICAgdGhpcy5tYXBMbmcgPSBlbC5sbmdcbiAgICB0aGlzLm1vdmVNYXAoMCwgMClcbiAgICB0aGlzLnNlbmRNb2RpZmljYXRpb25zKFwiXCIpXG4gIH1cblxuICBwcml2YXRlIGNhbGNBbmdsZShhZGphY2VudCwgb3Bwb3NpdGUpIHtcbiAgICByZXR1cm4gTWF0aC5hdGFuKE1hdGguYWJzKG9wcG9zaXRlKS9NYXRoLmFicyhhZGphY2VudCkpICogKDE4MC9NYXRoLlBJKTtcbiAgfVxuICBwcml2YXRlIGNhbGNIeXAoYWRqYWNlbnQsIG9wcG9zaXRlKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhhZGphY2VudCwgMikgKyBNYXRoLnBvdyhvcHBvc2l0ZSwgMikpOztcbiAgfVxuXG4gIHByaXZhdGUgZmluZEZpcnN0TGVmdEVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdGVkID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXTtcbiAgICBsZXQgbmV3U2VsZWN0ID0gbnVsbDtcbiAgICB0aGlzLm1hcmtlci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQgIT0gc2VsZWN0ZWQgJiYgZWxlbWVudC5sbmcgPCBzZWxlY3RlZC5sbmcgJiYgKG5ld1NlbGVjdD09bnVsbCB8fCAoZWxlbWVudC5sbmcgPiBuZXdTZWxlY3QubG5nIHx8IG5ld1NlbGVjdC5sbmcgPiBzZWxlY3RlZC5sbmcpKSkge1xuICAgICAgICBsZXQgYW5nbGU9dGhpcy5jYWxjQW5nbGUoZWxlbWVudC5sbmcgLSBzZWxlY3RlZC5sbmcsIGVsZW1lbnQubGF0IC0gc2VsZWN0ZWQubGF0KTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlbGVtZW50LnRleHQrXCIgXCIrYW5nbGUpXG4gICAgICAgIGlmKGFuZ2xlPDQ1KXtcbiAgICAgICAgICBuZXdTZWxlY3QgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG5ld1NlbGVjdD09bnVsbCB8fCBuZXdTZWxlY3QubG5nID49IHNlbGVjdGVkLmxuZykge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gc2VsZWN0ZWQuaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IG5ld1NlbGVjdC5pZFxuICAgIH1cbiAgfVxuICBcbiAgcHJpdmF0ZSBmaW5kRmlyc3RSaWdodEVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdGVkID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXTtcbiAgICBsZXQgbmV3U2VsZWN0ID0gbnVsbFxuICAgIHRoaXMubWFya2VyLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBpZiAoZWxlbWVudCAhPSBzZWxlY3RlZCAmJiBlbGVtZW50LmxuZyA+IHNlbGVjdGVkLmxuZyAmJiAobmV3U2VsZWN0PT1udWxsIHx8IChlbGVtZW50LmxuZyA8IG5ld1NlbGVjdC5sbmcgfHwgbmV3U2VsZWN0LmxuZyA8IHNlbGVjdGVkLmxuZykpKSB7XG4gICAgICAgIGxldCBhbmdsZT10aGlzLmNhbGNBbmdsZShlbGVtZW50LmxuZyAtIHNlbGVjdGVkLmxuZywgZWxlbWVudC5sYXQgLSBzZWxlY3RlZC5sYXQpO1xuICAgICAgICBpZihhbmdsZTw0NSl7XG4gICAgICAgICAgbmV3U2VsZWN0ID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdTZWxlY3Q9PW51bGwgfHwgbmV3U2VsZWN0LmxuZyA8PSBzZWxlY3RlZC5sbmcpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IHNlbGVjdGVkLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5hdmlnYXRlSWQgPSBuZXdTZWxlY3QuaWRcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmRGaXJzdEJvdHRvbUVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdGVkID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXTtcbiAgICBsZXQgbmV3U2VsZWN0ID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkID09IDAgPyAxIDogMF07XG4gICAgdGhpcy5tYXJrZXIuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGlmIChlbGVtZW50ICE9IHNlbGVjdGVkICYmIGVsZW1lbnQubGF0IDwgc2VsZWN0ZWQubGF0ICYmIChlbGVtZW50LmxhdCA+IG5ld1NlbGVjdC5sYXQgfHwgbmV3U2VsZWN0LmxhdCA+IHNlbGVjdGVkLmxhdCkpIHtcbiAgICAgICAgICBuZXdTZWxlY3QgPSBlbGVtZW50O1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdTZWxlY3QubGF0ID49IHNlbGVjdGVkLmxhdCkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gc2VsZWN0ZWQuaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IG5ld1NlbGVjdC5pZFxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZEZpcnN0VG9wRWxlbWVudCgpIHtcbiAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWRdO1xuICAgIGxldCBuZXdTZWxlY3QgPSB0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWQgPT0gMCA/IDEgOiAwXTtcbiAgICB0aGlzLm1hcmtlci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQgIT0gc2VsZWN0ZWQgJiYgZWxlbWVudC5sYXQgPiBzZWxlY3RlZC5sYXQgJiYgKGVsZW1lbnQubGF0IDwgbmV3U2VsZWN0LmxhdCB8fCBuZXdTZWxlY3QubGF0IDwgc2VsZWN0ZWQubGF0KSkge1xuICAgICAgICAgIG5ld1NlbGVjdCA9IGVsZW1lbnQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG5ld1NlbGVjdC5sYXQgPD0gc2VsZWN0ZWQubGF0KSB7XG4gICAgICB0aGlzLm5hdmlnYXRlSWQgPSBzZWxlY3RlZC5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gbmV3U2VsZWN0LmlkXG4gICAgfVxuICB9XG5cbiAgLyoqKioqKioqKioqKioqKiBzZXQgcG9zaXRpb24sIG1vdmUgYW5kIHpvb20gZnVuY3Rpb25zICoqKioqKioqKioqKiovXG5cbiAgLy8gc2V0IG5ldyBjb29yZGluYXRlcyBhbmQgaGFuZGxlIHpvb20gXG4gIHByaXZhdGUgc2V0UG9zaXRpb24oKTogdm9pZCB7XG4gICAgbGV0IGNvb3JkID0gdGhpcy5tYXAuZ2V0Q2VudGVyKCk7XG4gICAgdGhpcy5tYXBMYXQgPSBjb29yZC5sYXQ7XG4gICAgdGhpcy5tYXBMbmcgPSBjb29yZC5sbmc7XG4gICAgdGhpcy5tYXBab29tID0gdGhpcy5tYXAuZ2V0Wm9vbSgpO1xuICAgIC8vIGNhbGN1bCBuZXcgbW92ZSBzaXplXG4gICAgdGhpcy5zZXRNb3ZlU2hpZnQoKTtcbiAgfVxuXG4gIC8vIGNhbGN1bCBuZXcgY29vcmRpbmF0ZXNcbiAgcHJpdmF0ZSBtb3ZlTWFwKGxhdCwgbG5nKTogdm9pZCB7XG4gICAgdGhpcy5tYXBMYXQgKz0gbGF0ICogdGhpcy5tb3ZlU2hpZnQ7XG4gICAgdGhpcy5tYXBMbmcgKz0gbG5nICogdGhpcy5tb3ZlU2hpZnQ7XG4gICAgdGhpcy5tYXAuc2V0VmlldyhbdGhpcy5tYXBMYXQsIHRoaXMubWFwTG5nXSwgdGhpcy5tYXBab29tKTtcbiAgfVxuXG4gIC8vIHVwZGF0ZSB6b29tXG4gIHByaXZhdGUgem9vbU1hcCh6b29tKTogdm9pZCB7XG4gICAgdGhpcy5tYXBab29tICs9IHpvb207XG4gICAgdGhpcy5tYXAuc2V0Wm9vbSh0aGlzLm1hcFpvb20pO1xuICB9XG5cbiAgLy8gYWx0ZXIgbW92ZSBwYWRkaW5nXG4gIHNldE1vdmVTaGlmdCgpIHtcbiAgICB0aGlzLm1vdmVTaGlmdCA9IDgwO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDwgdGhpcy5tYXBab29tOyBpKyspIHtcbiAgICAgIHRoaXMubW92ZVNoaWZ0IC89IDI7XG4gICAgfVxuICB9XG5cbiAgLyoqKioqKioqKioqKioqKiBzZWFyY2ggaW5wdXQgZnVuY3Rpb25zICoqKioqKioqKioqKiovXG5cbiAgLy8gc2V0IGlucHV0IGZvY3VzIG9yIGJsdXJcbiAgaW5pdElucHV0KCkge1xuICAgIC8vIHNlbGVjdCBzZWFyY2ggaW5wdXQgYm94XG4gICAgdGhpcy5zZWFyY2hJbnB1dCA9IHRoaXMuZWxlbS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5sZWFmbGV0LWNvbnRyb2wtZ2VvY29kZXItZm9ybSBpbnB1dFwiXG4gICAgKTtcbiAgICB0aGlzLnNlYXJjaEJhciA9IHRoaXMuZWxlbS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBcIi5sZWFmbGV0LWJhclwiXG4gICAgKTtcbiAgICB0aGlzLnNldEZvY3VzT3V0KCk7XG4gIH1cbiAgc2V0Rm9jdXMoKSB7XG5cbiAgICB0aGlzLnNlYXJjaEJhci5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIHRoaXMuc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICB0aGlzLnNlYXJjaElucHV0Rm9jdXNlZCA9IHRydWU7XG4gIH1cbiAgc2V0Rm9jdXNPdXQoKSB7XG4gICAgdGhpcy5zZWFyY2hJbnB1dC5ibHVyKCk7XG4gICAgdGhpcy5zZWFyY2hCYXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIHRoaXMuc2VhcmNoSW5wdXRGb2N1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLnNldFBvc2l0aW9uKCk7XG4gIH1cbn1cbiIsIjxkaXYgY2xhc3M9XCJtYXAtY29udGFpbmVyXCI+XG4gICAgPGkgY2xhc3M9XCJpY29uIHt7aGFuZGxlSWNvbn19XCI+PC9pPlxuICAgIDxkaXYgaWQ9XCJtYXBcIj48L2Rpdj5cbjwvZGl2PlxuPGRpdiBjbGFzcz1cIm1lbnUtY29udGFpbmVyXCIgY2xhc3M9XCJ7e2Rpc3BsYXlNZW51fX1cIj5cbiAgICA8ZGl2IGNsYXNzPVwibWVudS1ib3hcIj5cbiAgICAgICAgPGkgY2xhc3M9XCJpY29uIHNlYXJjaCB7eyhjaG9pc2VNZW51PT0wPydzZWxlY3RlZCc6JycpfX1cIj48L2k+XG4gICAgICAgIDxpIGNsYXNzPVwiaWNvbiBtb3ZlIHt7KGNob2lzZU1lbnU9PTE/J3NlbGVjdGVkJzonJyl9fVwiPjwvaT5cbiAgICAgICAgPGkgY2xhc3M9XCJpY29uIHpvb20ge3soY2hvaXNlTWVudT09Mj8nc2VsZWN0ZWQnOicnKX19XCI+PC9pPlxuICAgICAgICA8aSBjbGFzcz1cImljb24gbmF2aWdhdGlvbiB7eyhjaG9pc2VNZW51PT0zPydzZWxlY3RlZCc6JycpfX1cIj48L2k+XG4gICAgICAgIDxpIGNsYXNzPVwiaWNvbiBsb2dvdXQge3soY2hvaXNlTWVudT09ND8nc2VsZWN0ZWQnOicnKX19XCI+PC9pPlxuICAgIDwvZGl2PiAgXG48L2Rpdj4iXX0=