# MapApplication

This is an application which allow to have map on web browser.

after running npm run build map-library, the library is available in dist folder. you can copy the folder into your own project. An implement example is available in src app.

## component event

the component return json object from onchange event

``` json
{
  key: "keyboard pressed key",
  zoom: "map zoom",
  lat: "map latitude",
  lng: "map lnggitude",
  view: {
    top: "top max displayed lat",
    left: "left max displayed lat",
    bottom: "bottom max displayed lat",
    right: "right max displayed lat"
  }
}
```

## implement

To implement the library, add elemants in each files:

* app.component.html

``` html
<map-library 
    [mapLat]="mapLat" 
    [mapLng]="mapLng" 
    [mapZoom]="mapZoom" 
    [search]="search" 
    [marker]="marker"
    (onchange)="onMapChange($event)">
</map-library>
```

* app.component.ts

``` ts
// component values
public mapLat: number = 45;
public mapLng: number = 5;
public mapZoom: number = 5;
public search: String = '';
public marker:any = [{ text: "myText", content:"", img: "url.png", lat: 48, lng: -3 }];


onMapChange(event) {
  console.log(event);
}
```

* app.module.ts

``` ts
import { MapLibraryModule } from 'map-library';

imports: [
    ... ,
    MapLibraryModule
  ]
```

* global css file

``` css
@import "~../dist/map-library/src/styles.css";
```