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

      let A = this.rotationCalculator(300, 40, 60, 60, 60, 40, 46)
      overlay.reposition(L.latLng(A.newBRY, A.newBRX), L.latLng(A.newTRY, A.newTRX), L.latLng(A.newBLY, A.newBLX));

    })
  }


  //   X1,Y1 ---------------------------X3,Y3
  //     |                                |
  //     |               x                |
  //     |             Xc,Yc              |
  //   X4,Y4 ---------------------------X2,Y2

  rotationCalculator(Angle: number, Y2: number, X2: number, Y3: number, X3: number, Y4: number, X4: number) {
    let Y1 = Y3 - (Y2 - Y4)
    let X1 = X3 - (X2 - X4)

    let Xc = ((X2 * Y1 - X1 * Y2) * (X4 - X3) - (X4 * Y3 - X3 * Y4) * (X2 - X1)) / ((X2 - X1) * (Y4 - Y3) - (X4 - X3) * (Y2 - Y1))
    let Yc = ((X2 * Y1 - X1 * Y2) * (Y4 - Y3) - (X4 * Y3 - X3 * Y4) * (Y2 - Y1)) / ((X2 - X1) * (Y4 - Y3) - (X4 - X3) * (Y2 - Y1))

    let AngleRad = Angle * Math.PI / 180

    let XX2 = (X2 - Xc) * Math.cos(AngleRad) - (Y2 - Yc) * Math.sin(AngleRad) + Xc
    let YY2 = (X2 - Xc) * Math.sin(AngleRad) + (Y2 - Yc) * Math.cos(AngleRad) + Yc
    let XX3 = (X3 - Xc) * Math.cos(AngleRad) - (Y3 - Yc) * Math.sin(AngleRad) + Xc
    let YY3 = (X3 - Xc) * Math.sin(AngleRad) + (Y3 - Yc) * Math.cos(AngleRad) + Yc
    let XX4 = (X4 - Xc) * Math.cos(AngleRad) - (Y4 - Yc) * Math.sin(AngleRad) + Xc
    let YY4 = (X4 - Xc) * Math.sin(AngleRad) + (Y4 - Yc) * Math.cos(AngleRad) + Yc

    return { newBRX: XX2, newBRY: YY2, newTRX: XX3, newTRY: YY3, newBLX: XX4, newBLY: YY4 }
  }


}
