import { Component, OnInit } from '@angular/core';

declare var ol: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'map-application';
  latitude: number = 48.74441767602127;
  longitude: number = -3.4510803222656246;

  map: any;

  ngOnInit() {
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.longitude, this.latitude]),
        zoom: 8
      })
    });


  this.map.on('click', function (args) {
    console.log(args.coordinate);
    var lonlat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');
    console.log(lonlat);
  
    var lon = lonlat[0];
    var lat = lonlat[1];
    //alert(`lat: ${lat} long: ${lon}`);
  });
  };
  setCenter() {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(8);
  }
  
}
