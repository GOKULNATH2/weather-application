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

the component return json object from onselect event

``` json
{ 
  text: "", 
  content:"", 
  img: "", 
  lat: 48.56, 
  lng: 3.12 
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
    [focused]="focused"
    (onchange)="onMapChange($event)"
    (onselect)="onMapSelect($event)">
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
public focused: boolean = true;


onMapChange(event) {
  console.log(event);
}
onMapSelect(selected) {
  console.log(selected);
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

## populate map with cities

add file json-typings.ts to import json file who contain cities datas

add in app.component.ts

``` ts
import * as commune from '../assets/commune.json';

onMapChange(event) {
  this.displayCities(event);
}

displayCities(event){
  let tab=[]
  cities['cities'].forEach(element => {
    if(element.zoom <= event.zoom && element.latitude < event.view.top && element.latitude > event.view.bottom && element.longitude < event.view.right && element.longitude > event.view.left){
      tab.push({ text: element.city, content:"<div align='center'>12°c - 28°c</div>", img: "../assets/partly_cloudy.png", lat: element.latitude, lng: element.longitude })
    }
  });
  this.marker = tab;
}
```