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
var MapLibraryComponent = /** @class */ (function () {
    function MapLibraryComponent(elem) {
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
    MapLibraryComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        // init map
        this.initMap();
        this.initInput();
        this.setMoveShift();
        // init display input request
        this.setSearch(this.search);
        this.setMarker(this.marker);
        // send init event
        setTimeout(function () {
            _this.sendModifications("");
        }, 2000);
    };
    MapLibraryComponent.prototype.initMap = function () {
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
    };
    MapLibraryComponent.prototype.setSearch = function (search) {
        var _this = this;
        if (this.search) {
            // load searching
            this.geocoder.setQuery(search)._geocode();
            // search the first element
            setTimeout(function () {
                if (_this.geocoder._results && _this.geocoder._results.length) {
                    _this.geocoder._geocodeResultSelected(_this.geocoder._results[0]);
                    _this.geocoder._clearResults();
                }
            }, 2000);
        }
    };
    MapLibraryComponent.prototype.setMarker = function (marker) {
        var _this = this;
        this.cleanMarkers();
        var i = 0;
        marker.forEach(function (element) {
            if ("lat" in element && "lng" in element) {
                element.id = i;
                if (!element.text && element.img) {
                    _this.mapMarkers[i] = _this.generateImageMarker(element);
                }
                else if (!element.text) {
                    _this.mapMarkers[i] = L.marker([element.lat, element.lng]);
                }
                else {
                    _this.mapMarkers[i] = _this.generateIconMarker(element);
                }
                _this.mapMarkers[i].addTo(_this.map);
                if (_this.navigate && _this.mapLat == element.lat && _this.mapLng == element.lng) {
                    _this.navigateId = i;
                    _this.elem.nativeElement.querySelector("#marker_" + _this.navigateId).style.background = "orange";
                }
                i++;
            }
        });
    };
    // remove all markers to display news
    MapLibraryComponent.prototype.cleanMarkers = function () {
        for (var i = 0; i < this.mapMarkers.length; i++) {
            this.map.removeLayer(this.mapMarkers[i]);
        }
    };
    // generate Marker
    MapLibraryComponent.prototype.generateIconMarker = function (element) {
        // set html form
        var html = "\n      <div class=\"marker\" id=\"marker_" + element.id + "\">\n        <div>" + element.text + "</div>\n        " + (element.content ? "<span>" + element.content + "</span>" : "") +
            (element.img ? "<img src=\"" + element.img + "\"/>" : "") + "\n      </div>";
        // return leaflet marker
        return new L.Marker([element.lat, element.lng], {
            icon: new L.DivIcon({
                className: '',
                iconSize: [100, 70],
                iconAnchor: [60, element.img ? 40 : 10],
                html: html,
            })
        });
    };
    // generate image Marker
    MapLibraryComponent.prototype.generateImageMarker = function (element) {
        // set html form
        var html = "<img id=\"marker_" + element.id + "\" style=\"width:80px;\" src=\"" + element.img + "\"/>";
        // return leaflet marker
        return new L.Marker([element.lat, element.lng], {
            icon: new L.DivIcon({
                className: '',
                iconSize: [80, 70],
                iconAnchor: [45, element.img ? 40 : 10],
                html: html,
            })
        });
    };
    /*************** components attributes events *************/
    MapLibraryComponent.prototype.ngOnChanges = function (changes) {
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
    };
    /*************** keyboard event detect and functions *************/
    MapLibraryComponent.prototype.keyEvent = function (event) {
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
    };
    MapLibraryComponent.prototype.handlingNavigation = function (key) {
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
    };
    MapLibraryComponent.prototype.handlingMenu = function (key) {
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
    };
    MapLibraryComponent.prototype.handlingMap = function (key) {
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
    };
    // display move or zoom icon when press
    MapLibraryComponent.prototype.changeMode = function () {
        this.moveMode = !this.moveMode;
        if (this.moveMode) {
            this.handleIcon = "move";
            this.choiseMenu = 1;
        }
        else {
            this.handleIcon = "zoom";
            this.choiseMenu = 2;
        }
    };
    MapLibraryComponent.prototype.sendModifications = function (key) {
        // calcul map outline by container size and pixel progection
        var mapSize = this.map.getSize();
        var centerPixel = this.map.project([this.mapLat, this.mapLng], this.mapZoom);
        var topLeft = this.map.unproject([centerPixel.x - mapSize.x / 2, centerPixel.y - mapSize.y / 2], this.mapZoom);
        var bottomRight = this.map.unproject([centerPixel.x + mapSize.x / 2, centerPixel.y + mapSize.y / 2], this.mapZoom);
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
    };
    MapLibraryComponent.prototype.sendSelectEvent = function (selected) {
        this.onselect.emit(selected);
    };
    /*************** escape app functions *************/
    MapLibraryComponent.prototype.openMenu = function () {
        this.displayMenu = "show-menu";
    };
    MapLibraryComponent.prototype.closeMenu = function () {
        this.displayMenu = "";
    };
    // show escape message
    MapLibraryComponent.prototype.selectMenu = function (key) {
        if (key == "Escape") {
            this.closeMenu();
        }
        else {
            //this.validEscape = false;
        }
    };
    /*************** navigate between markers *************/
    MapLibraryComponent.prototype.setNavigationMode = function () {
        this.navigate = true;
        this.handleIcon = "navigation";
        this.navigateMarker(0, 0);
        // define menu to move
        this.moveMode = false;
        this.handleMenuIcon = "move";
    };
    MapLibraryComponent.prototype.navigateMarker = function (lat, lng) {
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
        var el = this.marker[this.navigateId];
        this.mapLat = el.lat;
        this.mapLng = el.lng;
        this.moveMap(0, 0);
        this.sendModifications("");
    };
    MapLibraryComponent.prototype.calcAngle = function (adjacent, opposite) {
        return Math.atan(Math.abs(opposite) / Math.abs(adjacent)) * (180 / Math.PI);
    };
    MapLibraryComponent.prototype.calcHyp = function (adjacent, opposite) {
        return Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
        ;
    };
    MapLibraryComponent.prototype.findFirstLeftElement = function () {
        var _this = this;
        var selected = this.marker[this.navigateId];
        var newSelect = null;
        this.marker.forEach(function (element) {
            if (element != selected && element.lng < selected.lng && (newSelect == null || (element.lng > newSelect.lng || newSelect.lng > selected.lng))) {
                var angle = _this.calcAngle(element.lng - selected.lng, element.lat - selected.lat);
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
    };
    MapLibraryComponent.prototype.findFirstRightElement = function () {
        var _this = this;
        var selected = this.marker[this.navigateId];
        var newSelect = null;
        this.marker.forEach(function (element) {
            if (element != selected && element.lng > selected.lng && (newSelect == null || (element.lng < newSelect.lng || newSelect.lng < selected.lng))) {
                var angle = _this.calcAngle(element.lng - selected.lng, element.lat - selected.lat);
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
    };
    MapLibraryComponent.prototype.findFirstBottomElement = function () {
        var selected = this.marker[this.navigateId];
        var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(function (element) {
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
    };
    MapLibraryComponent.prototype.findFirstTopElement = function () {
        var selected = this.marker[this.navigateId];
        var newSelect = this.marker[this.navigateId == 0 ? 1 : 0];
        this.marker.forEach(function (element) {
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
    };
    /*************** set position, move and zoom functions *************/
    // set new coordinates and handle zoom 
    MapLibraryComponent.prototype.setPosition = function () {
        var coord = this.map.getCenter();
        this.mapLat = coord.lat;
        this.mapLng = coord.lng;
        this.mapZoom = this.map.getZoom();
        // calcul new move size
        this.setMoveShift();
    };
    // calcul new coordinates
    MapLibraryComponent.prototype.moveMap = function (lat, lng) {
        this.mapLat += lat * this.moveShift;
        this.mapLng += lng * this.moveShift;
        this.map.setView([this.mapLat, this.mapLng], this.mapZoom);
    };
    // update zoom
    MapLibraryComponent.prototype.zoomMap = function (zoom) {
        this.mapZoom += zoom;
        this.map.setZoom(this.mapZoom);
    };
    // alter move padding
    MapLibraryComponent.prototype.setMoveShift = function () {
        this.moveShift = 80;
        for (var i = 1; i < this.mapZoom; i++) {
            this.moveShift /= 2;
        }
    };
    /*************** search input functions *************/
    // set input focus or blur
    MapLibraryComponent.prototype.initInput = function () {
        // select search input box
        this.searchInput = this.elem.nativeElement.querySelector(".leaflet-control-geocoder-form input");
        this.searchBar = this.elem.nativeElement.querySelector(".leaflet-bar");
        this.setFocusOut();
    };
    MapLibraryComponent.prototype.setFocus = function () {
        this.searchBar.style.display = "block";
        this.searchInput.focus();
        this.searchInputFocused = true;
    };
    MapLibraryComponent.prototype.setFocusOut = function () {
        this.searchInput.blur();
        this.searchBar.style.display = "none";
        this.searchInputFocused = false;
        this.setPosition();
    };
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
    return MapLibraryComponent;
}());
export { MapLibraryComponent };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLWxpYnJhcnkuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbWFwLWxpYnJhcnkvIiwic291cmNlcyI6WyJsaWIvbWFwLWxpYnJhcnkuY29tcG9uZW50LnRzIiwibGliL21hcC1saWJyYXJ5LmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFFTCxTQUFTLEVBQ1QsWUFBWSxFQUVaLE1BQU0sRUFDTixZQUFZLEVBRWIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxLQUFLLENBQUMsTUFBTSxTQUFTLENBQUM7QUFDN0IsT0FBTywwQkFBMEIsQ0FBQzs7QUFFbEMsTUFBTSxDQUFOLElBQVksS0FJWDtBQUpELFdBQVksS0FBSztJQUNmLDBDQUFhLENBQUE7SUFDYix5Q0FBWSxDQUFBO0lBQ1osd0NBQVksQ0FBQTtBQUNkLENBQUMsRUFKVyxLQUFLLEtBQUwsS0FBSyxRQUloQjtBQUVEO0lBa0NFLDZCQUFvQixJQUFnQjtRQUFoQixTQUFJLEdBQUosSUFBSSxDQUFZO1FBekJwQyxlQUFlO1FBQ1IsV0FBTSxHQUFXLEVBQUUsQ0FBQztRQUNwQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBQ25CLFlBQU8sR0FBVyxDQUFDLENBQUM7UUFLakIsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDbkMsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFNckMsdUJBQWtCLEdBQUcsS0FBSyxDQUFDO1FBQzNCLGFBQVEsR0FBRyxJQUFJLENBQUM7UUFFakIsZUFBVSxHQUFHLE1BQU0sQ0FBQztRQUNwQixtQkFBYyxHQUFHLE1BQU0sQ0FBQztRQUN4QixnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUNqQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNqQixlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBc0R2QixrQkFBa0I7UUFDVixlQUFVLEdBQUcsRUFBRSxDQUFDO0lBckRn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QUNyQixDQUFDOzBGQWxpQlUsbUJBQW1COzREQUFuQixtQkFBbUI7OztZQ3pCaEMsOEJBQ0k7WUFBQSxvQkFBbUM7WUFDbkMseUJBQW9CO1lBQ3hCLGlCQUFNO1lBQ04sOEJBQ0k7WUFBQSw4QkFDSTtZQUFBLG9CQUE2RDtZQUM3RCxvQkFBMkQ7WUFDM0Qsb0JBQTJEO1lBQzNELG9CQUFpRTtZQUNqRSxvQkFBNkQ7WUFDakUsaUJBQU07WUFDVixpQkFBTTs7WUFYQyxlQUEyQjtZQUEzQixzREFBMkI7WUFHTixlQUF1QjtZQUF2Qiw4QkFBdUI7WUFFeEMsZUFBcUQ7WUFBckQsb0ZBQXFEO1lBQ3JELGVBQW1EO1lBQW5ELGtGQUFtRDtZQUNuRCxlQUFtRDtZQUFuRCxrRkFBbUQ7WUFDbkQsZUFBeUQ7WUFBekQsd0ZBQXlEO1lBQ3pELGVBQXFEO1lBQXJELG9GQUFxRDs7OEJEVmhFO0NBNGpCQyxBQTFpQkQsSUEwaUJDO1NBbmlCWSxtQkFBbUI7a0RBQW5CLG1CQUFtQjtjQVAvQixTQUFTO2VBQUM7Z0JBQ1QsUUFBUSxFQUFFLGFBQWE7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsU0FBUyxDQUFDO2dCQUNyRSxXQUFXLEVBQUUsOEJBQThCO2dCQUMzQyxTQUFTLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRTthQUM1Qzs7a0JBWUUsTUFBTTs7a0JBQ04sTUFBTTs7a0JBc0tOLFlBQVk7bUJBQUMsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWZ0ZXJWaWV3SW5pdCxcbiAgQ29tcG9uZW50LFxuICBIb3N0TGlzdGVuZXIsXG4gIEVsZW1lbnRSZWYsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBTaW1wbGVDaGFuZ2VzXG59IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgKiBhcyBMIGZyb20gXCJsZWFmbGV0XCI7XG5pbXBvcnQgXCJsZWFmbGV0LWNvbnRyb2wtZ2VvY29kZXJcIjtcblxuZXhwb3J0IGVudW0gQ09OU1Qge1xuICBaT09NX01BWCA9IDE4LFxuICBaT09NX01JTiA9IDIsXG4gIExBVF9NQVggPSA4NSxcbn1cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiBcIm1hcC1saWJyYXJ5XCIsXG4gIGlucHV0czogWydtYXBMYXQnLCAnbWFwTG5nJywgJ21hcFpvb20nLCAnc2VhcmNoJywgJ21hcmtlcicsJ2ZvY3VzZWQnXSxcbiAgdGVtcGxhdGVVcmw6IFwiLi9tYXAtbGlicmFyeS5jb21wb25lbnQuaHRtbFwiLFxuICBzdHlsZVVybHM6IFtcIi4vbWFwLWxpYnJhcnkuY29tcG9uZW50LmNzc1wiLF0sXG59KVxuXG5leHBvcnQgY2xhc3MgTWFwTGlicmFyeUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuXG4gIC8vIGlucHV0IHZhbHVlc1xuICBwdWJsaWMgbWFwTGF0OiBudW1iZXIgPSA0NTtcbiAgcHVibGljIG1hcExuZzogbnVtYmVyID0gNTtcbiAgcHVibGljIG1hcFpvb206IG51bWJlciA9IDU7XG4gIHB1YmxpYyBzZWFyY2g6IFN0cmluZztcbiAgcHVibGljIG1hcmtlcjogYW55O1xuICBwdWJsaWMgZm9jdXNlZDogYm9vbGVhbjtcblxuICBAT3V0cHV0KCkgb25jaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIG9uc2VsZWN0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgcHJpdmF0ZSBtYXA7XG4gIHByaXZhdGUgZ2VvY29kZXI7XG4gIHByaXZhdGUgc2VhcmNoSW5wdXQ7XG4gIHByaXZhdGUgc2VhcmNoQmFyO1xuICBwcml2YXRlIHNlYXJjaElucHV0Rm9jdXNlZCA9IGZhbHNlO1xuICBwcml2YXRlIG1vdmVNb2RlID0gdHJ1ZTtcbiAgcHJpdmF0ZSBtb3ZlU2hpZnQ7XG4gIHB1YmxpYyBoYW5kbGVJY29uID0gXCJtb3ZlXCI7XG4gIHB1YmxpYyBoYW5kbGVNZW51SWNvbiA9IFwiem9vbVwiO1xuICBwdWJsaWMgZGlzcGxheU1lbnUgPSBcIlwiO1xuICBwdWJsaWMgY2hvaXNlTWVudSA9IDE7XG4gIHByaXZhdGUgbmF2aWdhdGUgPSBmYWxzZTtcbiAgcHJpdmF0ZSBuYXZpZ2F0ZUlkID0gMDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW06IEVsZW1lbnRSZWYpIHsgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICAvLyBpbml0IG1hcFxuICAgIHRoaXMuaW5pdE1hcCgpO1xuICAgIHRoaXMuaW5pdElucHV0KCk7XG4gICAgdGhpcy5zZXRNb3ZlU2hpZnQoKTtcblxuICAgIC8vIGluaXQgZGlzcGxheSBpbnB1dCByZXF1ZXN0XG4gICAgdGhpcy5zZXRTZWFyY2godGhpcy5zZWFyY2gpO1xuICAgIHRoaXMuc2V0TWFya2VyKHRoaXMubWFya2VyKTtcbiAgICAvLyBzZW5kIGluaXQgZXZlbnRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2VuZE1vZGlmaWNhdGlvbnMoXCJcIik7XG4gICAgfSwgMjAwMClcbiAgfVxuXG4gIHByaXZhdGUgaW5pdE1hcCgpOiB2b2lkIHtcbiAgICAvLyBpbml0IG1hcFxuICAgIHRoaXMubWFwID0gTC5tYXAoXCJtYXBcIiwge1xuICAgICAgYXR0cmlidXRpb25Db250cm9sOiBmYWxzZSxcbiAgICAgIHpvb21Db250cm9sOiBmYWxzZSxcbiAgICAgIGNlbnRlcjogW3RoaXMubWFwTGF0LCB0aGlzLm1hcExuZ10sXG4gICAgICB6b29tOiB0aGlzLm1hcFpvb20sXG4gICAgfSk7XG4gICAgLy8gZGlzcGxheSBtYXBcbiAgICBMLnRpbGVMYXllcihcImh0dHBzOi8ve3N9LnRpbGUub3NtLm9yZy97en0ve3h9L3t5fS5wbmdcIikuYWRkVG8odGhpcy5tYXApO1xuICAgIC8vIGRpc2FibGUga2V5Ym9hcmRcbiAgICB0aGlzLm1hcC5rZXlib2FyZC5kaXNhYmxlKCk7XG4gICAgLy8gYWRkIHNlYXJjaCBib3hcbiAgICB0aGlzLmdlb2NvZGVyID0gTC5Db250cm9sLmdlb2NvZGVyKHtcbiAgICAgIHBvc2l0aW9uOiBcInRvcGxlZnRcIixcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICBwbGFjZWhvbGRlcjogXCJSZWNoZXJjaGUuLi5cIixcbiAgICAgIGRlZmF1bHRNYXJrR2VvY29kZTogdHJ1ZSxcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gIH1cblxuICBwcml2YXRlIHNldFNlYXJjaChzZWFyY2gpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zZWFyY2gpIHtcbiAgICAgIC8vIGxvYWQgc2VhcmNoaW5nXG4gICAgICB0aGlzLmdlb2NvZGVyLnNldFF1ZXJ5KHNlYXJjaCkuX2dlb2NvZGUoKVxuICAgICAgLy8gc2VhcmNoIHRoZSBmaXJzdCBlbGVtZW50XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZ2VvY29kZXIuX3Jlc3VsdHMgJiYgdGhpcy5nZW9jb2Rlci5fcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLmdlb2NvZGVyLl9nZW9jb2RlUmVzdWx0U2VsZWN0ZWQodGhpcy5nZW9jb2Rlci5fcmVzdWx0c1swXSlcbiAgICAgICAgICB0aGlzLmdlb2NvZGVyLl9jbGVhclJlc3VsdHMoKTtcbiAgICAgICAgfVxuICAgICAgfSwgMjAwMCk7XG4gICAgfVxuICB9XG5cbiAgLy8gZGlzcGxheSBtYXJrZXJzXG4gIHByaXZhdGUgbWFwTWFya2VycyA9IFtdO1xuICBwcml2YXRlIHNldE1hcmtlcihtYXJrZXIpOiB2b2lkIHtcblxuICAgIHRoaXMuY2xlYW5NYXJrZXJzKCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIG1hcmtlci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKFwibGF0XCIgaW4gZWxlbWVudCAmJiBcImxuZ1wiIGluIGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5pZCA9IGk7XG4gICAgICAgIGlmICghZWxlbWVudC50ZXh0ICYmIGVsZW1lbnQuaW1nKSB7XG4gICAgICAgICAgdGhpcy5tYXBNYXJrZXJzW2ldID0gdGhpcy5nZW5lcmF0ZUltYWdlTWFya2VyKGVsZW1lbnQpXG4gICAgICAgIH0gZWxzZSBpZiAoIWVsZW1lbnQudGV4dCkge1xuICAgICAgICAgIHRoaXMubWFwTWFya2Vyc1tpXSA9IEwubWFya2VyKFtlbGVtZW50LmxhdCwgZWxlbWVudC5sbmddKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubWFwTWFya2Vyc1tpXSA9IHRoaXMuZ2VuZXJhdGVJY29uTWFya2VyKGVsZW1lbnQpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXBNYXJrZXJzW2ldLmFkZFRvKHRoaXMubWFwKTtcblxuICAgICAgICBpZiAodGhpcy5uYXZpZ2F0ZSAmJiB0aGlzLm1hcExhdCA9PSBlbGVtZW50LmxhdCAmJiB0aGlzLm1hcExuZyA9PSBlbGVtZW50LmxuZykge1xuICAgICAgICAgIHRoaXMubmF2aWdhdGVJZCA9IGlcbiAgICAgICAgICB0aGlzLmVsZW0ubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI21hcmtlcl9cIiArIHRoaXMubmF2aWdhdGVJZCkuc3R5bGUuYmFja2dyb3VuZCA9IFwib3JhbmdlXCI7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gcmVtb3ZlIGFsbCBtYXJrZXJzIHRvIGRpc3BsYXkgbmV3c1xuICBwcml2YXRlIGNsZWFuTWFya2VycygpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubWFwTWFya2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5tYXBNYXJrZXJzW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBnZW5lcmF0ZSBNYXJrZXJcbiAgcHJpdmF0ZSBnZW5lcmF0ZUljb25NYXJrZXIoZWxlbWVudCkge1xuXG4gICAgLy8gc2V0IGh0bWwgZm9ybVxuICAgIGxldCBodG1sID0gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1hcmtlclwiIGlkPVwibWFya2VyXyR7ZWxlbWVudC5pZH1cIj5cbiAgICAgICAgPGRpdj4ke2VsZW1lbnQudGV4dH08L2Rpdj5cbiAgICAgICAgYCsgKGVsZW1lbnQuY29udGVudCA/IGA8c3Bhbj4ke2VsZW1lbnQuY29udGVudH08L3NwYW4+YCA6IGBgKSArXG4gICAgICAgIChlbGVtZW50LmltZyA/IGA8aW1nIHNyYz1cIiR7ZWxlbWVudC5pbWd9XCIvPmAgOiBgYCkgKyBgXG4gICAgICA8L2Rpdj5gXG5cbiAgICAvLyByZXR1cm4gbGVhZmxldCBtYXJrZXJcbiAgICByZXR1cm4gbmV3IEwuTWFya2VyKFtlbGVtZW50LmxhdCwgZWxlbWVudC5sbmddLCB7XG4gICAgICBpY29uOiBuZXcgTC5EaXZJY29uKHtcbiAgICAgICAgY2xhc3NOYW1lOiAnJyxcbiAgICAgICAgaWNvblNpemU6IFsxMDAsIDcwXSwgLy8gc2l6ZSBvZiB0aGUgaWNvblxuICAgICAgICBpY29uQW5jaG9yOiBbNjAsIGVsZW1lbnQuaW1nID8gNDAgOiAxMF0sXG4gICAgICAgIGh0bWwsXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvLyBnZW5lcmF0ZSBpbWFnZSBNYXJrZXJcbiAgcHJpdmF0ZSBnZW5lcmF0ZUltYWdlTWFya2VyKGVsZW1lbnQpIHtcblxuICAgIC8vIHNldCBodG1sIGZvcm1cbiAgICBsZXQgaHRtbCA9IGA8aW1nIGlkPVwibWFya2VyXyR7ZWxlbWVudC5pZH1cIiBzdHlsZT1cIndpZHRoOjgwcHg7XCIgc3JjPVwiJHtlbGVtZW50LmltZ31cIi8+YFxuXG4gICAgLy8gcmV0dXJuIGxlYWZsZXQgbWFya2VyXG4gICAgcmV0dXJuIG5ldyBMLk1hcmtlcihbZWxlbWVudC5sYXQsIGVsZW1lbnQubG5nXSwge1xuICAgICAgaWNvbjogbmV3IEwuRGl2SWNvbih7XG4gICAgICAgIGNsYXNzTmFtZTogJycsXG4gICAgICAgIGljb25TaXplOiBbODAsIDcwXSwgLy8gc2l6ZSBvZiB0aGUgaWNvblxuICAgICAgICBpY29uQW5jaG9yOiBbNDUsIGVsZW1lbnQuaW1nID8gNDAgOiAxMF0sXG4gICAgICAgIGh0bWwsXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKioqKioqKioqKioqKioqIGNvbXBvbmVudHMgYXR0cmlidXRlcyBldmVudHMgKioqKioqKioqKioqKi9cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKHRoaXMubWFwKSB7XG4gICAgICBzd2l0Y2ggKE9iamVjdC5rZXlzKGNoYW5nZXMpWzBdKSB7XG4gICAgICAgIGNhc2UgXCJtYXBab29tXCI6XG4gICAgICAgIGNhc2UgXCJtYXBMYXRcIjpcbiAgICAgICAgY2FzZSBcIm1hcExuZ1wiOlxuICAgICAgICAgIHRoaXMubWFwLnNldFZpZXcoW3RoaXMubWFwTGF0LCB0aGlzLm1hcExuZ10sIHRoaXMubWFwWm9vbSk7XG4gICAgICAgICAgdGhpcy5zZXRNb3ZlU2hpZnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcIm1hcmtlclwiOlxuICAgICAgICAgIHRoaXMuc2V0TWFya2VyKHRoaXMubWFya2VyKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInNlYXJjaFwiOlxuICAgICAgICAgIHRoaXMuc2V0U2VhcmNoKHRoaXMuc2VhcmNoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKioqKioqKioqKioqKioqIGtleWJvYXJkIGV2ZW50IGRldGVjdCBhbmQgZnVuY3Rpb25zICoqKioqKioqKioqKiovXG5cblxuXG4gIEBIb3N0TGlzdGVuZXIoXCJ3aW5kb3c6a2V5dXBcIiwgW1wiJGV2ZW50XCJdKVxuICBrZXlFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmKHRoaXMuZm9jdXNlZCl7XG4gICAgICBpZiAodGhpcy5kaXNwbGF5TWVudSAhPSBcIlwiKSB7XG4gICAgICAgIHRoaXMuaGFuZGxpbmdNZW51KGV2ZW50LmtleSk7XG5cbiAgICAgIH0gZWxzZSBpZiAodGhpcy5uYXZpZ2F0ZSkge1xuICAgICAgICB0aGlzLmhhbmRsaW5nTmF2aWdhdGlvbihldmVudC5rZXkpXG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuaGFuZGxpbmdNYXAoZXZlbnQua2V5KVxuICAgICAgICAvLyBzZW5kIGNoYW5nZSB0byBwYXJlbnQgYXBwbGljYXRpb25cbiAgICAgICAgdGhpcy5zZW5kTW9kaWZpY2F0aW9ucyhldmVudC5rZXkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxpbmdOYXZpZ2F0aW9uKGtleSk6IHZvaWQge1xuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlIFwiQXJyb3dVcFwiOlxuICAgICAgICB0aGlzLm5hdmlnYXRlTWFya2VyKDEsIDApXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93RG93blwiOlxuICAgICAgICB0aGlzLm5hdmlnYXRlTWFya2VyKC0xLCAwKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd1JpZ2h0XCI6XG4gICAgICAgIHRoaXMubmF2aWdhdGVNYXJrZXIoMCwgMSlcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgIHRoaXMubmF2aWdhdGVNYXJrZXIoMCwgLTEpXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkVudGVyXCI6XG4gICAgICAgIC8vIHNlbmQgY2hhbmdlIHRvIHBhcmVudCBhcHBsaWNhdGlvblxuICAgICAgICBpZiAodGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXSlcbiAgICAgICAgICB0aGlzLnNlbmRTZWxlY3RFdmVudCh0aGlzLm1hcmtlclt0aGlzLm5hdmlnYXRlSWRdKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFc2NhcGVcIjpcbiAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGhhbmRsaW5nTWVudShrZXkpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgdGhpcy5jaG9pc2VNZW51Kys7XG4gICAgICAgIGlmICh0aGlzLmNob2lzZU1lbnUgPiA0KSB7XG4gICAgICAgICAgdGhpcy5jaG9pc2VNZW51ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0xlZnRcIjpcbiAgICAgICAgdGhpcy5jaG9pc2VNZW51LS07XG4gICAgICAgIGlmICh0aGlzLmNob2lzZU1lbnUgPCAwKSB7XG4gICAgICAgICAgdGhpcy5jaG9pc2VNZW51ID0gNDtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFbnRlclwiOlxuICAgICAgICAvLyByZXNldCBuYXZpZ2F0aW9uIG1vZGVcbiAgICAgICAgdGhpcy5uYXZpZ2F0ZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLmNob2lzZU1lbnUgPT0gMCkge1xuICAgICAgICAgIHRoaXMuc2V0Rm9jdXMoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2V0Rm9jdXNPdXQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaG9pc2VNZW51ID09IDEpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUljb24gPSBcIm1vdmVcIjtcbiAgICAgICAgICB0aGlzLm1vdmVNb2RlID0gdHJ1ZVxuXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5jaG9pc2VNZW51ID09IDIpIHtcbiAgICAgICAgICB0aGlzLmhhbmRsZUljb24gPSBcInpvb21cIjtcbiAgICAgICAgICB0aGlzLm1vdmVNb2RlID0gZmFsc2VcblxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY2hvaXNlTWVudSA9PSAzKSB7XG4gICAgICAgICAgdGhpcy5zZXROYXZpZ2F0aW9uTW9kZSgpXG5cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNob2lzZU1lbnUgPT0gNCkge1xuICAgICAgICAgIGFsZXJ0KFwiZXhpdFwiKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KClcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiRXNjYXBlXCI6XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxpbmdNYXAoa2V5KTogdm9pZCB7XG4gICAgc3dpdGNoIChrZXkpIHtcbiAgICAgIGNhc2UgXCJBcnJvd1VwXCI6XG4gICAgICAgIGlmICh0aGlzLm1vdmVNb2RlKSB7XG4gICAgICAgICAgaWYgKHRoaXMubWFwLmdldENlbnRlcigpLmxhdCA8IENPTlNULkxBVF9NQVgpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZU1hcCgxLCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMubWFwWm9vbSA8IENPTlNULlpPT01fTUFYKSB7XG4gICAgICAgICAgICB0aGlzLnpvb21NYXAoMSk7XG4gICAgICAgICAgICB0aGlzLm1vdmVTaGlmdCAvPSAyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJBcnJvd0Rvd25cIjpcbiAgICAgICAgaWYgKHRoaXMubW92ZU1vZGUpIHtcbiAgICAgICAgICBpZiAodGhpcy5tYXAuZ2V0Q2VudGVyKCkubGF0ID4gLUNPTlNULkxBVF9NQVgpIHtcbiAgICAgICAgICAgIHRoaXMubW92ZU1hcCgtMSwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLm1hcFpvb20gPiBDT05TVC5aT09NX01JTikge1xuICAgICAgICAgICAgdGhpcy56b29tTWFwKC0xKTtcbiAgICAgICAgICAgIHRoaXMubW92ZVNoaWZ0ICo9IDI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcIkFycm93UmlnaHRcIjpcbiAgICAgICAgaWYgKHRoaXMubW92ZU1vZGUpIHtcbiAgICAgICAgICB0aGlzLm1vdmVNYXAoMCwgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiQXJyb3dMZWZ0XCI6XG4gICAgICAgIGlmICh0aGlzLm1vdmVNb2RlKSB7XG4gICAgICAgICAgdGhpcy5tb3ZlTWFwKDAsIC0xKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFbnRlclwiOlxuICAgICAgICB0aGlzLmNoYW5nZU1vZGUoKVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJFc2NhcGVcIjpcbiAgICAgICAgdGhpcy5vcGVuTWVudSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvLyBkaXNwbGF5IG1vdmUgb3Igem9vbSBpY29uIHdoZW4gcHJlc3NcbiAgcHJpdmF0ZSBjaGFuZ2VNb2RlKCk6IHZvaWQge1xuICAgIHRoaXMubW92ZU1vZGUgPSAhdGhpcy5tb3ZlTW9kZTtcbiAgICBpZiAodGhpcy5tb3ZlTW9kZSkge1xuICAgICAgdGhpcy5oYW5kbGVJY29uID0gXCJtb3ZlXCI7XG4gICAgICB0aGlzLmNob2lzZU1lbnUgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZUljb24gPSBcInpvb21cIjtcbiAgICAgIHRoaXMuY2hvaXNlTWVudSA9IDI7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzZW5kTW9kaWZpY2F0aW9ucyhrZXkpIHtcbiAgICAvLyBjYWxjdWwgbWFwIG91dGxpbmUgYnkgY29udGFpbmVyIHNpemUgYW5kIHBpeGVsIHByb2dlY3Rpb25cbiAgICBsZXQgbWFwU2l6ZSA9IHRoaXMubWFwLmdldFNpemUoKTtcbiAgICBsZXQgY2VudGVyUGl4ZWwgPSB0aGlzLm1hcC5wcm9qZWN0KFt0aGlzLm1hcExhdCwgdGhpcy5tYXBMbmddLCB0aGlzLm1hcFpvb20pXG4gICAgbGV0IHRvcExlZnQgPSB0aGlzLm1hcC51bnByb2plY3QoW2NlbnRlclBpeGVsLnggLSBtYXBTaXplLnggLyAyLCBjZW50ZXJQaXhlbC55IC0gbWFwU2l6ZS55IC8gMl0sIHRoaXMubWFwWm9vbSlcbiAgICBsZXQgYm90dG9tUmlnaHQgPSB0aGlzLm1hcC51bnByb2plY3QoW2NlbnRlclBpeGVsLnggKyBtYXBTaXplLnggLyAyLCBjZW50ZXJQaXhlbC55ICsgbWFwU2l6ZS55IC8gMl0sIHRoaXMubWFwWm9vbSlcblxuICAgIC8vIHNlbmQgY29vcmRpbmF0ZXMgcmVzdWx0c1xuICAgIHRoaXMub25jaGFuZ2UuZW1pdChcbiAgICAgIHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIHpvb206IHRoaXMubWFwWm9vbSxcbiAgICAgICAgbGF0OiB0aGlzLm1hcExhdCxcbiAgICAgICAgbG5nOiB0aGlzLm1hcExuZyxcbiAgICAgICAgdmlldzoge1xuICAgICAgICAgIHRvcDogdG9wTGVmdC5sYXQsXG4gICAgICAgICAgbGVmdDogdG9wTGVmdC5sbmcsXG4gICAgICAgICAgYm90dG9tOiBib3R0b21SaWdodC5sYXQsXG4gICAgICAgICAgcmlnaHQ6IGJvdHRvbVJpZ2h0LmxuZ1xuICAgICAgICB9XG4gICAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBzZW5kU2VsZWN0RXZlbnQoc2VsZWN0ZWQpIHtcbiAgICB0aGlzLm9uc2VsZWN0LmVtaXQoc2VsZWN0ZWQpXG4gIH1cblxuICAvKioqKioqKioqKioqKioqIGVzY2FwZSBhcHAgZnVuY3Rpb25zICoqKioqKioqKioqKiovXG5cbiAgcHJpdmF0ZSBvcGVuTWVudSgpOiB2b2lkIHtcbiAgICB0aGlzLmRpc3BsYXlNZW51ID0gXCJzaG93LW1lbnVcIjtcbiAgfVxuXG4gIHByaXZhdGUgY2xvc2VNZW51KCk6IHZvaWQge1xuICAgIHRoaXMuZGlzcGxheU1lbnUgPSBcIlwiO1xuICB9XG4gIC8vIHNob3cgZXNjYXBlIG1lc3NhZ2VcbiAgcHJpdmF0ZSBzZWxlY3RNZW51KGtleSk6IHZvaWQge1xuICAgIGlmIChrZXkgPT0gXCJFc2NhcGVcIikge1xuICAgICAgdGhpcy5jbG9zZU1lbnUoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMudmFsaWRFc2NhcGUgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKioqKioqKioqKioqKioqIG5hdmlnYXRlIGJldHdlZW4gbWFya2VycyAqKioqKioqKioqKioqL1xuXG4gIHByaXZhdGUgc2V0TmF2aWdhdGlvbk1vZGUoKTogdm9pZCB7XG4gICAgdGhpcy5uYXZpZ2F0ZSA9IHRydWU7XG4gICAgdGhpcy5oYW5kbGVJY29uID0gXCJuYXZpZ2F0aW9uXCI7XG4gICAgdGhpcy5uYXZpZ2F0ZU1hcmtlcigwLCAwKVxuICAgIC8vIGRlZmluZSBtZW51IHRvIG1vdmVcbiAgICB0aGlzLm1vdmVNb2RlID0gZmFsc2VcbiAgICB0aGlzLmhhbmRsZU1lbnVJY29uID0gXCJtb3ZlXCJcbiAgfVxuXG4gIHByaXZhdGUgbmF2aWdhdGVNYXJrZXIobGF0LCBsbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMubWFya2VyLmxlbmd0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5tYXJrZXIubGVuZ3RoID09IDEpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IDA7XG4gICAgICB0aGlzLmVsZW0ubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiI21hcmtlcl9cIiArIHRoaXMubmF2aWdhdGVJZCkuc3R5bGUuYmFja2dyb3VuZCA9IFwib3JhbmdlXCI7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLm5hdmlnYXRlSWQgPiB0aGlzLm1hcmtlci5sZW5ndGgpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IDA7XG4gICAgfVxuICAgIGlmIChsYXQgIT0gMCB8fCBsbmcgIT0gMCkge1xuICAgICAgLy8gcmVzZXQgcHJldmlvdXNcbiAgICAgIHRoaXMuZWxlbS5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWFya2VyX1wiICsgdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXS5pZCkuc3R5bGUuYmFja2dyb3VuZCA9IFwid2hpdGVcIjtcbiAgICB9XG4gICAgLy8gZGlzcGxheSBuZXdcbiAgICBpZiAobG5nID4gMCkge1xuICAgICAgdGhpcy5maW5kRmlyc3RSaWdodEVsZW1lbnQoKTtcbiAgICB9IGVsc2UgaWYgKGxuZyA8IDApIHtcbiAgICAgIHRoaXMuZmluZEZpcnN0TGVmdEVsZW1lbnQoKTtcbiAgICB9IGVsc2UgaWYgKGxhdCA+IDApIHtcbiAgICAgIHRoaXMuZmluZEZpcnN0VG9wRWxlbWVudCgpO1xuICAgIH0gZWxzZSBpZiAobGF0IDwgMCkge1xuICAgICAgdGhpcy5maW5kRmlyc3RCb3R0b21FbGVtZW50KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IDBcbiAgICB9XG4gICAgbGV0IGVsID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXTtcbiAgICB0aGlzLm1hcExhdCA9IGVsLmxhdFxuICAgIHRoaXMubWFwTG5nID0gZWwubG5nXG4gICAgdGhpcy5tb3ZlTWFwKDAsIDApXG4gICAgdGhpcy5zZW5kTW9kaWZpY2F0aW9ucyhcIlwiKVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxjQW5nbGUoYWRqYWNlbnQsIG9wcG9zaXRlKSB7XG4gICAgcmV0dXJuIE1hdGguYXRhbihNYXRoLmFicyhvcHBvc2l0ZSkvTWF0aC5hYnMoYWRqYWNlbnQpKSAqICgxODAvTWF0aC5QSSk7XG4gIH1cbiAgcHJpdmF0ZSBjYWxjSHlwKGFkamFjZW50LCBvcHBvc2l0ZSkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coYWRqYWNlbnQsIDIpICsgTWF0aC5wb3cob3Bwb3NpdGUsIDIpKTs7XG4gIH1cblxuICBwcml2YXRlIGZpbmRGaXJzdExlZnRFbGVtZW50KCkge1xuICAgIGxldCBzZWxlY3RlZCA9IHRoaXMubWFya2VyW3RoaXMubmF2aWdhdGVJZF07XG4gICAgbGV0IG5ld1NlbGVjdCA9IG51bGw7XG4gICAgdGhpcy5tYXJrZXIuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGlmIChlbGVtZW50ICE9IHNlbGVjdGVkICYmIGVsZW1lbnQubG5nIDwgc2VsZWN0ZWQubG5nICYmIChuZXdTZWxlY3Q9PW51bGwgfHwgKGVsZW1lbnQubG5nID4gbmV3U2VsZWN0LmxuZyB8fCBuZXdTZWxlY3QubG5nID4gc2VsZWN0ZWQubG5nKSkpIHtcbiAgICAgICAgbGV0IGFuZ2xlPXRoaXMuY2FsY0FuZ2xlKGVsZW1lbnQubG5nIC0gc2VsZWN0ZWQubG5nLCBlbGVtZW50LmxhdCAtIHNlbGVjdGVkLmxhdCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZWxlbWVudC50ZXh0K1wiIFwiK2FuZ2xlKVxuICAgICAgICBpZihhbmdsZTw0NSl7XG4gICAgICAgICAgbmV3U2VsZWN0ID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdTZWxlY3Q9PW51bGwgfHwgbmV3U2VsZWN0LmxuZyA+PSBzZWxlY3RlZC5sbmcpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IHNlbGVjdGVkLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5hdmlnYXRlSWQgPSBuZXdTZWxlY3QuaWRcbiAgICB9XG4gIH1cbiAgXG4gIHByaXZhdGUgZmluZEZpcnN0UmlnaHRFbGVtZW50KCkge1xuICAgIGxldCBzZWxlY3RlZCA9IHRoaXMubWFya2VyW3RoaXMubmF2aWdhdGVJZF07XG4gICAgbGV0IG5ld1NlbGVjdCA9IG51bGxcbiAgICB0aGlzLm1hcmtlci5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgaWYgKGVsZW1lbnQgIT0gc2VsZWN0ZWQgJiYgZWxlbWVudC5sbmcgPiBzZWxlY3RlZC5sbmcgJiYgKG5ld1NlbGVjdD09bnVsbCB8fCAoZWxlbWVudC5sbmcgPCBuZXdTZWxlY3QubG5nIHx8IG5ld1NlbGVjdC5sbmcgPCBzZWxlY3RlZC5sbmcpKSkge1xuICAgICAgICBsZXQgYW5nbGU9dGhpcy5jYWxjQW5nbGUoZWxlbWVudC5sbmcgLSBzZWxlY3RlZC5sbmcsIGVsZW1lbnQubGF0IC0gc2VsZWN0ZWQubGF0KTtcbiAgICAgICAgaWYoYW5nbGU8NDUpe1xuICAgICAgICAgIG5ld1NlbGVjdCA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3U2VsZWN0PT1udWxsIHx8IG5ld1NlbGVjdC5sbmcgPD0gc2VsZWN0ZWQubG5nKSB7XG4gICAgICB0aGlzLm5hdmlnYXRlSWQgPSBzZWxlY3RlZC5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gbmV3U2VsZWN0LmlkXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kRmlyc3RCb3R0b21FbGVtZW50KCkge1xuICAgIGxldCBzZWxlY3RlZCA9IHRoaXMubWFya2VyW3RoaXMubmF2aWdhdGVJZF07XG4gICAgbGV0IG5ld1NlbGVjdCA9IHRoaXMubWFya2VyW3RoaXMubmF2aWdhdGVJZCA9PSAwID8gMSA6IDBdO1xuICAgIHRoaXMubWFya2VyLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICBpZiAoZWxlbWVudCAhPSBzZWxlY3RlZCAmJiBlbGVtZW50LmxhdCA8IHNlbGVjdGVkLmxhdCAmJiAoZWxlbWVudC5sYXQgPiBuZXdTZWxlY3QubGF0IHx8IG5ld1NlbGVjdC5sYXQgPiBzZWxlY3RlZC5sYXQpKSB7XG4gICAgICAgICAgbmV3U2VsZWN0ID0gZWxlbWVudDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3U2VsZWN0LmxhdCA+PSBzZWxlY3RlZC5sYXQpIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IHNlbGVjdGVkLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5hdmlnYXRlSWQgPSBuZXdTZWxlY3QuaWRcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmRGaXJzdFRvcEVsZW1lbnQoKSB7XG4gICAgbGV0IHNlbGVjdGVkID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkXTtcbiAgICBsZXQgbmV3U2VsZWN0ID0gdGhpcy5tYXJrZXJbdGhpcy5uYXZpZ2F0ZUlkID09IDAgPyAxIDogMF07XG4gICAgdGhpcy5tYXJrZXIuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgIGlmIChlbGVtZW50ICE9IHNlbGVjdGVkICYmIGVsZW1lbnQubGF0ID4gc2VsZWN0ZWQubGF0ICYmIChlbGVtZW50LmxhdCA8IG5ld1NlbGVjdC5sYXQgfHwgbmV3U2VsZWN0LmxhdCA8IHNlbGVjdGVkLmxhdCkpIHtcbiAgICAgICAgICBuZXdTZWxlY3QgPSBlbGVtZW50O1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdTZWxlY3QubGF0IDw9IHNlbGVjdGVkLmxhdCkge1xuICAgICAgdGhpcy5uYXZpZ2F0ZUlkID0gc2VsZWN0ZWQuaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmF2aWdhdGVJZCA9IG5ld1NlbGVjdC5pZFxuICAgIH1cbiAgfVxuXG4gIC8qKioqKioqKioqKioqKiogc2V0IHBvc2l0aW9uLCBtb3ZlIGFuZCB6b29tIGZ1bmN0aW9ucyAqKioqKioqKioqKioqL1xuXG4gIC8vIHNldCBuZXcgY29vcmRpbmF0ZXMgYW5kIGhhbmRsZSB6b29tIFxuICBwcml2YXRlIHNldFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGxldCBjb29yZCA9IHRoaXMubWFwLmdldENlbnRlcigpO1xuICAgIHRoaXMubWFwTGF0ID0gY29vcmQubGF0O1xuICAgIHRoaXMubWFwTG5nID0gY29vcmQubG5nO1xuICAgIHRoaXMubWFwWm9vbSA9IHRoaXMubWFwLmdldFpvb20oKTtcbiAgICAvLyBjYWxjdWwgbmV3IG1vdmUgc2l6ZVxuICAgIHRoaXMuc2V0TW92ZVNoaWZ0KCk7XG4gIH1cblxuICAvLyBjYWxjdWwgbmV3IGNvb3JkaW5hdGVzXG4gIHByaXZhdGUgbW92ZU1hcChsYXQsIGxuZyk6IHZvaWQge1xuICAgIHRoaXMubWFwTGF0ICs9IGxhdCAqIHRoaXMubW92ZVNoaWZ0O1xuICAgIHRoaXMubWFwTG5nICs9IGxuZyAqIHRoaXMubW92ZVNoaWZ0O1xuICAgIHRoaXMubWFwLnNldFZpZXcoW3RoaXMubWFwTGF0LCB0aGlzLm1hcExuZ10sIHRoaXMubWFwWm9vbSk7XG4gIH1cblxuICAvLyB1cGRhdGUgem9vbVxuICBwcml2YXRlIHpvb21NYXAoem9vbSk6IHZvaWQge1xuICAgIHRoaXMubWFwWm9vbSArPSB6b29tO1xuICAgIHRoaXMubWFwLnNldFpvb20odGhpcy5tYXBab29tKTtcbiAgfVxuXG4gIC8vIGFsdGVyIG1vdmUgcGFkZGluZ1xuICBzZXRNb3ZlU2hpZnQoKSB7XG4gICAgdGhpcy5tb3ZlU2hpZnQgPSA4MDtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IHRoaXMubWFwWm9vbTsgaSsrKSB7XG4gICAgICB0aGlzLm1vdmVTaGlmdCAvPSAyO1xuICAgIH1cbiAgfVxuXG4gIC8qKioqKioqKioqKioqKiogc2VhcmNoIGlucHV0IGZ1bmN0aW9ucyAqKioqKioqKioqKioqL1xuXG4gIC8vIHNldCBpbnB1dCBmb2N1cyBvciBibHVyXG4gIGluaXRJbnB1dCgpIHtcbiAgICAvLyBzZWxlY3Qgc2VhcmNoIGlucHV0IGJveFxuICAgIHRoaXMuc2VhcmNoSW5wdXQgPSB0aGlzLmVsZW0ubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIubGVhZmxldC1jb250cm9sLWdlb2NvZGVyLWZvcm0gaW5wdXRcIlxuICAgICk7XG4gICAgdGhpcy5zZWFyY2hCYXIgPSB0aGlzLmVsZW0ubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgXCIubGVhZmxldC1iYXJcIlxuICAgICk7XG4gICAgdGhpcy5zZXRGb2N1c091dCgpO1xuICB9XG4gIHNldEZvY3VzKCkge1xuXG4gICAgdGhpcy5zZWFyY2hCYXIuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB0aGlzLnNlYXJjaElucHV0LmZvY3VzKCk7XG4gICAgdGhpcy5zZWFyY2hJbnB1dEZvY3VzZWQgPSB0cnVlO1xuICB9XG4gIHNldEZvY3VzT3V0KCkge1xuICAgIHRoaXMuc2VhcmNoSW5wdXQuYmx1cigpO1xuICAgIHRoaXMuc2VhcmNoQmFyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB0aGlzLnNlYXJjaElucHV0Rm9jdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5zZXRQb3NpdGlvbigpO1xuICB9XG59XG4iLCI8ZGl2IGNsYXNzPVwibWFwLWNvbnRhaW5lclwiPlxuICAgIDxpIGNsYXNzPVwiaWNvbiB7e2hhbmRsZUljb259fVwiPjwvaT5cbiAgICA8ZGl2IGlkPVwibWFwXCI+PC9kaXY+XG48L2Rpdj5cbjxkaXYgY2xhc3M9XCJtZW51LWNvbnRhaW5lclwiIGNsYXNzPVwie3tkaXNwbGF5TWVudX19XCI+XG4gICAgPGRpdiBjbGFzcz1cIm1lbnUtYm94XCI+XG4gICAgICAgIDxpIGNsYXNzPVwiaWNvbiBzZWFyY2gge3soY2hvaXNlTWVudT09MD8nc2VsZWN0ZWQnOicnKX19XCI+PC9pPlxuICAgICAgICA8aSBjbGFzcz1cImljb24gbW92ZSB7eyhjaG9pc2VNZW51PT0xPydzZWxlY3RlZCc6JycpfX1cIj48L2k+XG4gICAgICAgIDxpIGNsYXNzPVwiaWNvbiB6b29tIHt7KGNob2lzZU1lbnU9PTI/J3NlbGVjdGVkJzonJyl9fVwiPjwvaT5cbiAgICAgICAgPGkgY2xhc3M9XCJpY29uIG5hdmlnYXRpb24ge3soY2hvaXNlTWVudT09Mz8nc2VsZWN0ZWQnOicnKX19XCI+PC9pPlxuICAgICAgICA8aSBjbGFzcz1cImljb24gbG9nb3V0IHt7KGNob2lzZU1lbnU9PTQ/J3NlbGVjdGVkJzonJyl9fVwiPjwvaT5cbiAgICA8L2Rpdj4gIFxuPC9kaXY+Il19