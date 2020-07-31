import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
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
  public focused: boolean = true;

  private imageTab: any = [];
  private infobox;

  constructor(private elem: ElementRef) { }

  ngAfterViewInit(): void {

    this.infobox = this.elem.nativeElement.querySelector("#infobox");

    setTimeout(()=>{
      // get gps metadata and display infos of paris
      for(let i=1; i<7; i++){
        this.getExif("../assets/"+i+".jpg");
      }      
    },200)
    /*setTimeout(()=>{
      this.displayInfos({text: "Paris", content: "<span style='color:blue'>12°c</span> - <span style='color:green'>28°c</span>", img: "../assets/partly_cloudy.png", lat: 48.86, lng: 2.34445});
    },2200)*/
  }

  /******************************* map component's events *******************/
  onMapSelect(selected) {
    console.log(selected);
    this.displayInfos(selected);
  }
  
  onMapChange(event) {
    //console.log(event);
    this.displayCities(event);
    
  }

  /******************************* display images and infos *******************/
  displayInfos(element){
    this.focused=false;
    this.infobox.style.display = 'block';

    let images = "";
    this.imageTab.forEach(el => {
      if(element.lat > el.lat-0.5 && element.lat < el.lat+0.5 && element.lng > el.lng-0.5 && element.lng < el.lng+0.5){
        images += `
        <div class="imgContainer">
          <div>
            <img src="${el.img}">
          </div>
        </div>
        `;
      }
    });
    
    this.infobox.innerHTML = ` 
    <div class="col wheather">
      <h2>${element.text}</h2>
        <div class="wheatherInfo">
          <img src="${element.img}"/>
          <div class="content">${element.content}</div>
        </div>
    </div>
    <div class="col thumb">${images}</div>
    `;
  }
  hideInfos(){
    this.infobox.style.display = 'none';
    setTimeout(()=>{ this.focused=true; },10)
  }

  /******************************* keyboard event *******************/
  @HostListener("window:keyup", ["$event"])
  keyEvent(event: KeyboardEvent) {
    if(!this.focused){
      this.handlingNavigation(event.key);
    }
  }

  private handlingNavigation(key): void {
    console.log(key)
    switch (key) {
      case "ArrowUp":
        break;
      case "ArrowDown":
        break;
      case "ArrowRight":
        break;
      case "ArrowLeft":
        break;
      case "Enter":
        break;
      case "Escape":
        this.hideInfos();
        break;
    }
  }

  /******************************* display cities weather *******************/
  displayCities(event){

    let tab=[]
    cities['cities'].forEach(element => {
      if(element.zoom <= event.zoom && element.latitude < event.view.top && element.latitude > event.view.bottom && element.longitude < event.view.right && element.longitude > event.view.left){
        tab.push({ text: element.city, content:"<span style='color:blue'>12°c</span> - <span style='color:green'>28°c</span>", img: "../assets/partly_cloudy.png", lat: element.latitude, lng: element.longitude })
      }
    });
    this.marker = tab;
  }

  /******************************* get image gps data *******************/
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
        //self.addMarker({ img: imgUrl, lat: fLat, lng: fLng });
        self.imageTab.push({ img: imgUrl, lat: fLat, lng: fLng })
        console.log(self.imageTab)
      });
    });
  }

  // display image directly
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
