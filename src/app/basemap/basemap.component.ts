import { Component, OnInit } from '@angular/core';
import * as L from 'Leaflet';

@Component({
  selector: 'app-basemap',
  templateUrl: './basemap.component.html',
  styleUrls: ['./basemap.component.css']
})
export class BasemapComponent implements OnInit {

  constructor() { }

  map: L.Map

  ngOnInit(): void {
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      center: [50, 50],
      zoom: 15,
    });

    let imageUrl = 'http://www.lib.utexas.edu/maps/historical/newark_nj_1922.jpg'
    L.imageOverlay(imageUrl, [[40.712216, -74.22655], [40.773941, -74.12544]],{
      zIndex:1000
    }).addTo(this.map);


  }

}
