import { AfterViewInit, Component } from '@angular/core';
import * as cities from '../assets/commune.json';


declare var EXIF: any;

@Component({
  selector: 'app-root',

  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  title = 'map-application';

  // component values
  public mapLat: number = 45;
  public mapLng: number = 5;
  public mapZoom: number = 6;
  public search: String = '';
  public marker: any = [];

  constructor() { }

  ngAfterViewInit(): void {

    setTimeout(()=>{

      this.getExif("../assets/1.jpg");
      this.getExif("../assets/2.jpg");
      this.getExif("../assets/3.jpg");
      this.getExif("../assets/4.jpg");
    },200)
  }

  onMapSelect(selected) {
    console.log(selected);
  }
  
  onMapChange(event) {
    //console.log(event);
    //this.displayCities(event);
  }

  displayCities(event){

    let tab=[]
    cities['cities'].forEach(element => {
      if(element.zoom <= event.zoom && element.latitude < event.view.top && element.latitude > event.view.bottom && element.longitude < event.view.right && element.longitude > event.view.left){
        tab.push({ text: element.city, content:"<span style='color:blue'>12°c</span> - <span style='color:green'>28°c</span>", img: "../assets/partly_cloudy.png", lat: element.latitude, lng: element.longitude })
      }
    });
    this.marker = tab;
  }

  getExif(imgUrl) {
    var self=this;
    this.getImageFromImageUrl(imgUrl, (image)=>{    
      EXIF.getData(image, function(){
        let imgLat = EXIF.getTag(this,'GPSLatitude')
        let imgLng = EXIF.getTag(this,'GPSLongitude')
        // convert from deg/min/sec to decimal for Google
        var strLatRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
        var strLongRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";
        var fLat = (imgLat[0] + imgLat[1]/60 + imgLat[2]/3600) * (strLatRef == "N" ? 1 : -1);
        var fLng = (imgLng[0] + imgLng[1]/60 + imgLng[2]/3600) * (strLongRef == "W" ? -1 : 1);
        // add image to markers
        self.addMarker({ img: imgUrl, lat: fLat, lng: fLng });
      });
    });
  }

  addMarker(element){
    let tab=[]
    this.marker.forEach(el => { tab.push(el); });
    tab.push(element)
    this.marker = tab
  }
  
  getImageFromImageUrl(url, callback) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
        callback(img);
    };
    img.src = url;
  }

  toDataURL(url, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'blob';
    xhr.onload = function(){
      var fr = new FileReader();
      fr.onload = function(){
        callback(this.result);
      };
      fr.readAsDataURL(xhr.response); // async call
    };
    xhr.send();
  }

}
