import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  WeatherData:any;
  weather =[]
  constructor() { }

  ngOnInit(){
  }
  getWeatherData(){
    //fetch('http://api.openweathermap.org/data/2.5/group?id=6452235,6454924,2995469&units=metric')
    //.then(response=>response.json)
    //.then(data=>{this.setWeatherData(data);}) 
  }
  setWeatherData(data){
    this.WeatherData = data;
    for (let item of (this.WeatherData.list)){
      this.weather.push(item.main.temp);
    }
      
  }
    

}
