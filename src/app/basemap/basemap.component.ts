import { Component, OnInit } from '@angular/core';
import * as L from 'Leaflet';
import 'leaflet-imageoverlay-rotated';


interface imgControlPoints {
  BR: L.LatLng;
  TR: L.LatLng;
  BL: L.LatLng;
  C: L.LatLng;
}

@Component({
  selector: 'app-basemap',
  templateUrl: './basemap.component.html',
  styleUrls: ['./basemap.component.css']
})



export class BasemapComponent implements OnInit {

  constructor() { }
  imagePosition: imgControlPoints = {
    BR: L.latLng(40, 60),
    TR: L.latLng(60, 60),
    BL: L.latLng(40, 46),
    C: L.latLng(50, 53)
  }

  imagePositionDynamic: imgControlPoints = this.imagePosition
  imagePositionFinal: imgControlPoints = this.imagePosition

  map: L.Map
  rotateImageActive = false
  pickCenterActive = false
  pickStartActive = false
  moveImageActive = false
  rotationCenter: L.LatLng
  moveStart: L.LatLng
  overlay: L.ImageOverlay.Rotated
  newBR: L.LatLng = this.imagePosition.BR
  newTR: L.LatLng = this.imagePosition.TR
  newBL: L.LatLng = this.imagePosition.BL
  newC: L.LatLng = this.imagePosition.C
  angleOnClick: number

  ngOnInit(): void {
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      center: [50, 50],
      zoomControl: false,
      zoom: 5,
    });

    // latLng(Y, X) or (lat, lng)
    // var bottomright = L.latLng(40, 60),
    //   topright = L.latLng(60, 60),
    //   bottomleft = L.latLng(40, 46);

    this.overlay = L.imageOverlay.rotated("../../assets/images/sample.jpg", this.imagePosition.BR, this.imagePosition.TR, this.imagePosition.BL, {
      interactive: true
    }).addTo(this.map);

    L.marker([40, 60]).addTo(this.map);
    L.marker([60, 60]).addTo(this.map);
    L.marker([40, 46]).addTo(this.map);

    this.map.on('click', (e: any) => {

      if (this.pickCenterActive && !this.rotateImageActive) {
        this.rotationCenter = e.latlng
        this.rotateImageActive = true
        this.pickCenterActive = false
      } else if (!this.pickCenterActive && this.rotateImageActive) {
        this.rotateImageActive = false
        this.pickCenterActive = false
      }

      if (this.pickStartActive && !this.moveImageActive) {
        this.moveStart = e.latlng
        this.moveImageActive = true
        this.pickStartActive = false
      } else if (!this.pickStartActive && this.moveImageActive) {
        this.moveImageActive = false
        this.pickStartActive = false
      }

      this.imagePositionFinal.BR.lat = this.newBR.lat
      this.imagePositionFinal.BR.lng = this.newBR.lng
      this.imagePositionFinal.TR.lat = this.newTR.lat
      this.imagePositionFinal.TR.lng = this.newTR.lng
      this.imagePositionFinal.BL.lat = this.newBL.lat
      this.imagePositionFinal.BL.lng = this.newBL.lng
      this.imagePositionFinal.C.lat = this.newC.lat
      this.imagePositionFinal.C.lng = this.newC.lng

      this.angleOnClick = this.rotationAngle(this.newC.lng, this.newC.lat, e.latlng.lng, e.latlng.lat)

    })

    this.map.on('mousemove', (e: any) => {

      // console.log(e.latlng);
      if (this.rotateImageActive) {
        let angle = this.rotationAngle(this.imagePositionFinal.C.lng, this.imagePositionFinal.C.lat, e.latlng.lng, e.latlng.lat)

        let A = this.rotationCalculator(angle - this.angleOnClick, this.imagePositionFinal.BR.lat, this.imagePositionFinal.BR.lng, this.imagePositionFinal.TR.lat, this.imagePositionFinal.TR.lng, this.imagePositionFinal.BL.lat, this.imagePositionFinal.BL.lng)
        this.newBR = L.latLng(A.newBRY, A.newBRX)
        this.newTR = L.latLng(A.newTRY, A.newTRX)
        this.newBL = L.latLng(A.newBLY, A.newBLX)
        this.overlay.reposition(L.latLng(A.newBRY, A.newBRX), L.latLng(A.newTRY, A.newTRX), L.latLng(A.newBLY, A.newBLX));
      }

      if (this.moveImageActive) {

        let DLat = e.latlng.lat - this.moveStart.lat
        let DLng = e.latlng.lng - this.moveStart.lng

        this.newBR = L.latLng(this.imagePositionFinal.BR.lat + DLat, this.imagePositionFinal.BR.lng + DLng)
        this.newTR = L.latLng(this.imagePositionFinal.TR.lat + DLat, this.imagePositionFinal.TR.lng + DLng)
        this.newBL = L.latLng(this.imagePositionFinal.BL.lat + DLat, this.imagePositionFinal.BL.lng + DLng)
        this.newC = L.latLng(this.imagePositionFinal.C.lat + DLat, this.imagePositionFinal.C.lng + DLng)
        this.overlay.reposition(L.latLng(this.newBR.lat, this.newBR.lng), L.latLng(this.newTR.lat, this.newTR.lng), L.latLng(this.newBL.lat, this.newBL.lng));

      }

    })

  }

  rotate() {
    this.pickStartActive = false
    this.moveImageActive = false
    this.pickCenterActive = true
    this.rotateImageActive = false
  }

  move() {
    this.rotateImageActive = false
    this.pickCenterActive = false
    this.pickStartActive = true
    this.moveImageActive = false
  }


  //   X1,Y1 ---------------------------X3,Y3
  //     |                                |
  //     |               x                |
  //     |             Xc,Yc              |
  //   X4,Y4 ---------------------------X2,Y2

  rotationCalculator(angle: number, Y2: number, X2: number, Y3: number, X3: number, Y4: number, X4: number) {

    let myCenter = this.calcRotationCenter(Y2, X2, Y3, X3, Y4, X4) 

    let angleRad = angle * Math.PI / 180

    //https://math.stackexchange.com/a/270204/796039

    let XX2 = (X2 - myCenter.Xc) * Math.cos(angleRad) - (Y2 - myCenter.Yc) * Math.sin(angleRad) + myCenter.Xc
    let YY2 = (X2 - myCenter.Xc) * Math.sin(angleRad) + (Y2 - myCenter.Yc) * Math.cos(angleRad) + myCenter.Yc
    let XX3 = (X3 - myCenter.Xc) * Math.cos(angleRad) - (Y3 - myCenter.Yc) * Math.sin(angleRad) + myCenter.Xc
    let YY3 = (X3 - myCenter.Xc) * Math.sin(angleRad) + (Y3 - myCenter.Yc) * Math.cos(angleRad) + myCenter.Yc
    let XX4 = (X4 - myCenter.Xc) * Math.cos(angleRad) - (Y4 - myCenter.Yc) * Math.sin(angleRad) + myCenter.Xc
    let YY4 = (X4 - myCenter.Xc) * Math.sin(angleRad) + (Y4 - myCenter.Yc) * Math.cos(angleRad) + myCenter.Yc

    return { newBRX: XX2, newBRY: YY2, newTRX: XX3, newTRY: YY3, newBLX: XX4, newBLY: YY4, centerX: myCenter.Xc, centerY: myCenter.Yc }
  }

  rotationAngle(Xc: number, Yc: number, X: number, Y: number) {
    let myAngle = 0
    if (Y > Yc && X >= Xc) {
      myAngle = Math.atan((Y - Yc) / (X - Xc)) * (180 / Math.PI)
    } else if (X < Xc) {
      myAngle = Math.atan((Y - Yc) / (X - Xc)) * (180 / Math.PI) + 180
    } else if (Y < Yc && X >= Xc) {
      myAngle = Math.atan((Y - Yc) / (X - Xc)) * (180 / Math.PI) + 360
    }
    return myAngle
  }

  calcRotationCenter(Y2: number, X2: number, Y3: number, X3: number, Y4: number, X4: number) {

    let Y1 = Y3 - (Y2 - Y4)
    let X1 = X3 - (X2 - X4)

    let Xc = ((X2 * Y1 - X1 * Y2) * (X4 - X3) - (X4 * Y3 - X3 * Y4) * (X2 - X1)) / ((X2 - X1) * (Y4 - Y3) - (X4 - X3) * (Y2 - Y1))
    let Yc = ((X2 * Y1 - X1 * Y2) * (Y4 - Y3) - (X4 * Y3 - X3 * Y4) * (Y2 - Y1)) / ((X2 - X1) * (Y4 - Y3) - (X4 - X3) * (Y2 - Y1))

    return { Yc, Xc }
  }

}
