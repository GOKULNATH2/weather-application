import { AfterViewInit, ElementRef, EventEmitter, SimpleChanges } from "@angular/core";
import "leaflet-control-geocoder";
import * as i0 from "@angular/core";
export declare enum CONST {
    ZOOM_MAX = 18,
    ZOOM_MIN = 2,
    LAT_MAX = 85
}
export declare class MapLibraryComponent implements AfterViewInit {
    private elem;
    mapLat: number;
    mapLng: number;
    mapZoom: number;
    search: String;
    marker: any;
    focused: boolean;
    onchange: EventEmitter<any>;
    onselect: EventEmitter<any>;
    private map;
    private geocoder;
    private searchInput;
    private searchBar;
    private searchInputFocused;
    private moveMode;
    private moveShift;
    handleIcon: string;
    handleMenuIcon: string;
    displayMenu: string;
    choiseMenu: number;
    private navigate;
    private navigateId;
    constructor(elem: ElementRef);
    ngAfterViewInit(): void;
    private initMap;
    private setSearch;
    private mapMarkers;
    private setMarker;
    private cleanMarkers;
    private generateIconMarker;
    private generateImageMarker;
    /*************** components attributes events *************/
    ngOnChanges(changes: SimpleChanges): void;
    /*************** keyboard event detect and functions *************/
    keyEvent(event: KeyboardEvent): void;
    private handlingNavigation;
    private handlingMenu;
    private handlingMap;
    private changeMode;
    private sendModifications;
    private sendSelectEvent;
    /*************** escape app functions *************/
    private openMenu;
    private closeMenu;
    private selectMenu;
    /*************** navigate between markers *************/
    private setNavigationMode;
    private navigateMarker;
    private calcAngle;
    private calcHyp;
    private findFirstLeftElement;
    private findFirstRightElement;
    private findFirstBottomElement;
    private findFirstTopElement;
    /*************** set position, move and zoom functions *************/
    private setPosition;
    private moveMap;
    private zoomMap;
    setMoveShift(): void;
    /*************** search input functions *************/
    initInput(): void;
    setFocus(): void;
    setFocusOut(): void;
    static ɵfac: i0.ɵɵFactoryDef<MapLibraryComponent>;
    static ɵcmp: i0.ɵɵComponentDefWithMeta<MapLibraryComponent, "map-library", never, { "mapLat": "mapLat"; "mapLng": "mapLng"; "mapZoom": "mapZoom"; "search": "search"; "marker": "marker"; "focused": "focused"; }, { "onchange": "onchange"; "onselect": "onselect"; }, never>;
}
