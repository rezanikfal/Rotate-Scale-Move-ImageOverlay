import { Component, OnInit } from '@angular/core';
import * as L from 'Leaflet';
import 'leaflet-imageoverlay-rotated';

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
      zoom: 5,
    });

    // latLng(Y, X) or (lat, lng)

    var bottomright = L.latLng(40, 60),
      topright = L.latLng(60, 60),
      bottomleft = L.latLng(40, 46);

    var overlay = L.imageOverlay.rotated("../../assets/images/sample.jpg", bottomright, topright, bottomleft, {
      interactive: true
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      
      overlay.reposition(L.latLng(61.0636, 47.8428), L.latLng(41.3675, 44.3699), L.latLng(58.6325, 61.6301));
      console.log(e.overlay);
    })






  }

}
