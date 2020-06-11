import { Component, OnInit } from '@angular/core';
import * as L from 'Leaflet';
import '../../assets/images/marker-shadow.png'
import 'leaflet-imageoverlay-rotated';
import { LoadDataService } from '../load-data.service';



interface imgControlPoints {
  TL: L.LatLng;
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

  constructor(private cartesianData: LoadDataService) { }
  imagePosition: imgControlPoints = { TL: new L.LatLng(0, 0), TR: new L.LatLng(0, 0), BL: new L.LatLng(0, 0), C: new L.LatLng(0, 0) }

  imagePositionDynamic: imgControlPoints = this.imagePosition
  imagePositionFinal: imgControlPoints = this.imagePosition

  map: L.Map
  rotateImageActive = false
  pickCenterActive = false
  pickStartActive = false
  moveImageActive = false
  pickOriginActive = false
  scaleImageActive = false
  distanceMeasureing = false
  ImageAdded = false
  rotationCenter: L.LatLng
  moveStart: L.LatLng
  scaleStart: L.LatLng
  overlay: L.ImageOverlay.Rotated
  newTL: L.LatLng
  newTR: L.LatLng
  newBL: L.LatLng
  newC: L.LatLng
  angleOnClick: number
  myUrl: string
  locatingMap = false
  imageWidth: number
  imageHeight: number
  imageSRC: string
  featureLayer: L.GeoJSON
  pointsGroup = L.layerGroup()
  pLineGroup = L.layerGroup()
  lineGroup: any[] = []
  polyline: L.Polyline
  smallPolyline: L.Polyline
  startingPoint: L.LatLng
  endingPoint: L.LatLng
  totalDistance = 0
  featurePopup: L.Popup
  currentUnit: string = 'ft'

  pointStyle = {
    radius: 3,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    fillColor: "yellow"
  };

  ngOnInit(): void {
    this.map = L.map('map', {
      crs: L.CRS.Simple,
      center: [10067355, 3112219],
      zoomControl: false,
      zoom: 0,
      minZoom: -1,
      doubleClickZoom: false
    });
    var myIcon = L.divIcon({ className: 'my-div-icon' });
    this.cartesianData.loadData().subscribe((res) => {
      this.featureLayer = L.geoJSON(res, {
        pointToLayer: function (geoJsonPoint, latlng) {
          return L.marker(latlng, { icon: myIcon });
        }
      }).bindPopup((layer: any) => {
        return `
       <table style="border: 1px solid black; border-collapse: collapse;  border-spacing: 15px;">
        <tr>
           <th colspan=2 style="border: 1px solid black; background-color: #dcdcdc">Designed Layer</th>
        </tr>
        <tr>
           <td style="color: gray; padding: 3px">Element Id:&nbsp</td>
           <td style="padding: 3px">${layer.feature.properties.Id}</td>
        </tr>
        <tr>
           <td style="color: gray; padding: 3px">Property 1:&nbsp</td>
           <td style="padding: 3px">${layer.feature.properties.Prop1}</td>
        </tr>
        <tr>
           <td style="color: gray; padding: 3px">X:&nbsp</td>
           <td style="padding: 3px">${layer.feature.properties.X.toFixed(1)} ${this.currentUnit}</td>
        </tr>
        <tr>
          <td style="color: gray; padding: 3px">Y:&nbsp</td>
          <td style="padding: 3px">${layer.feature.properties.Y.toFixed(1)} ${this.currentUnit}</td>
        </tr>   
     </table>
    `
      }).addTo(this.map);
    })

    this.pointsGroup.addTo(this.map)

    this.map.on('dblclick', (e: any) => {
      if (this.distanceMeasureing) {
        this.distanceMeasureing = false
        this.pointsGroup.clearLayers()
        this.pLineGroup.removeFrom(this.map)
        this.pLineGroup.clearLayers()
        this.lineGroup = []
        this.map.removeLayer(this.smallPolyline);
        this.startingPoint = undefined
        this.endingPoint = undefined
        this.totalDistance = 0
        this.featureLayer.bindPopup(this.featurePopup)
      }

    })

    this.map.on('click', (e: any) => {

      if (this.locatingMap) {
        this.locatingMap = false
        this.ImageAdded = true
        document.getElementById('map').style.cursor = 'default'
        this.imagePosition = {
          TL: L.latLng(e.latlng.lat + this.imageHeight / 20, e.latlng.lng - this.imageWidth / 20),
          TR: L.latLng(e.latlng.lat + this.imageHeight / 20, e.latlng.lng + this.imageWidth / 20),
          BL: L.latLng(e.latlng.lat - this.imageHeight / 20, e.latlng.lng - this.imageWidth / 20),
          C: L.latLng(e.latlng.lat, e.latlng.lng)
        }
        this.newTL = this.imagePosition.TL
        this.newTR = this.imagePosition.TR
        this.newBL = this.imagePosition.BL
        this.newC = this.imagePosition.C

        this.overlay = L.imageOverlay.rotated(this.imageSRC, this.imagePosition.TL, this.imagePosition.TR, this.imagePosition.BL, {
          interactive: true
        }).addTo(this.map);

        this.scaleStart = e.latlng
        this.scaleImageActive = true
        this.pickOriginActive = false
      } else {
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

        if (this.pickOriginActive && !this.scaleImageActive) {
          this.scaleStart = e.latlng
          this.scaleImageActive = true
          this.pickOriginActive = false
        } else if (!this.pickOriginActive && this.scaleImageActive) {
          this.scaleImageActive = false
          this.pickOriginActive = false
        }

        if (this.distanceMeasureing) {
          this.pointsGroup.addLayer(L.circleMarker(e.latlng, this.pointStyle))
          this.lineGroup.push(e.latlng)
          this.polyline = L.polyline(this.lineGroup, { color: 'gray', weight: 1 })
          this.pLineGroup.addLayer(this.polyline)
          this.pLineGroup.setZIndex(1000)
          this.pLineGroup.addTo(this.map)
          this.DistancePopup(e.latlng)
        }
      }

      if (this.ImageAdded) {

        this.imagePositionFinal.TL = this.newTL
        this.imagePositionFinal.TR = this.newTR
        this.imagePositionFinal.BL = this.newBL
        this.imagePositionFinal.C = this.newC

        this.angleOnClick = this.rotationAngle(this.newC.lng, this.newC.lat, e.latlng.lng, e.latlng.lat)
      }
    })

    this.map.on('mousemove', (e: any) => {



      if (this.rotateImageActive) {
        let angle = this.rotationAngle(this.newC.lng, this.newC.lat, e.latlng.lng, e.latlng.lat)

        let A = this.rotationCalculator(angle - this.angleOnClick, this.imagePositionFinal.TL.lat, this.imagePositionFinal.TL.lng, this.imagePositionFinal.TR.lat, this.imagePositionFinal.TR.lng, this.imagePositionFinal.BL.lat, this.imagePositionFinal.BL.lng)
        this.newTL = L.latLng(A.newTLY, A.newTLX)
        this.newTR = L.latLng(A.newTRY, A.newTRX)
        this.newBL = L.latLng(A.newBLY, A.newBLX)
        this.overlay.reposition(L.latLng(A.newTLY, A.newTLX), L.latLng(A.newTRY, A.newTRX), L.latLng(A.newBLY, A.newBLX));
      }

      if (this.moveImageActive) {

        let DLat = e.latlng.lat - this.moveStart.lat
        let DLng = e.latlng.lng - this.moveStart.lng

        this.newTL = L.latLng(this.imagePositionFinal.TL.lat + DLat, this.imagePositionFinal.TL.lng + DLng)
        this.newTR = L.latLng(this.imagePositionFinal.TR.lat + DLat, this.imagePositionFinal.TR.lng + DLng)
        this.newBL = L.latLng(this.imagePositionFinal.BL.lat + DLat, this.imagePositionFinal.BL.lng + DLng)
        this.newC = L.latLng(this.imagePositionFinal.C.lat + DLat, this.imagePositionFinal.C.lng + DLng)
        this.overlay.reposition(L.latLng(this.newTL.lat, this.newTL.lng), L.latLng(this.newTR.lat, this.newTR.lng), L.latLng(this.newBL.lat, this.newBL.lng));

      }

      if (this.scaleImageActive) {
        // let Distance = Math.sqrt(Math.pow(e.latlng.lng - this.scaleStart.lng, 2) + Math.pow(e.latlng.lat - this.scaleStart.lat, 2))
        let Distance = e.latlng.lat - this.scaleStart.lat

        let minImageDimention = Math.min(Math.sqrt(Math.pow(this.imagePositionFinal.TR.lng - this.imagePositionFinal.TL.lng, 2) + Math.pow(this.imagePositionFinal.TR.lat - this.imagePositionFinal.TL.lat, 2)), Math.sqrt(Math.pow(this.imagePositionFinal.BL.lng - this.imagePositionFinal.TL.lng, 2) + Math.pow(this.imagePositionFinal.BL.lat - this.imagePositionFinal.TL.lat, 2)))
        let scaleRate = (Distance + minImageDimention) / minImageDimention
        if (scaleRate < 0) { scaleRate = 0 }

        this.newTL = L.latLng((this.imagePositionFinal.TL.lat - this.imagePositionFinal.C.lat) * scaleRate + this.imagePositionFinal.C.lat, (this.imagePositionFinal.TL.lng - this.imagePositionFinal.C.lng) * scaleRate + this.imagePositionFinal.C.lng)
        this.newTR = L.latLng((this.imagePositionFinal.TR.lat - this.imagePositionFinal.C.lat) * scaleRate + this.imagePositionFinal.C.lat, (this.imagePositionFinal.TR.lng - this.imagePositionFinal.C.lng) * scaleRate + this.imagePositionFinal.C.lng)
        this.newBL = L.latLng((this.imagePositionFinal.BL.lat - this.imagePositionFinal.C.lat) * scaleRate + this.imagePositionFinal.C.lat, (this.imagePositionFinal.BL.lng - this.imagePositionFinal.C.lng) * scaleRate + this.imagePositionFinal.C.lng)
        this.overlay.reposition(L.latLng(this.newTL.lat, this.newTL.lng), L.latLng(this.newTR.lat, this.newTR.lng), L.latLng(this.newBL.lat, this.newBL.lng));

      }

    })

  }

  DistancePopup(latlng: L.LatLng) {
    if (this.smallPolyline) {
      this.map.removeLayer(this.smallPolyline);
    }

    if (this.startingPoint == undefined) {
      this.startingPoint = latlng
    } else {
      if (this.endingPoint == undefined) {
        this.endingPoint = latlng
      } else {
        this.startingPoint = this.endingPoint
        this.endingPoint = latlng
      }
      let distance = Math.sqrt(Math.pow(this.endingPoint.lat - this.startingPoint.lat, 2) + Math.pow(this.endingPoint.lng - this.startingPoint.lng, 2))
      let angle = this.calculateAzimuth(this.startingPoint.lat, this.endingPoint.lat, this.startingPoint.lng, this.endingPoint.lng)
      this.totalDistance += distance
      this.smallPolyline = L.polyline([this.startingPoint, this.endingPoint], { color: 'gray', weight: 1 }).addTo(this.map).bindPopup(
        `
        <div>Distance: ${distance.toFixed(2).toString()} ${this.currentUnit}</div>
        <div>Angle: ${angle.toFixed(1).toString()}&deg</div>
        <div>Total Distance: ${this.totalDistance.toFixed(2).toString()}</div>
        `
      ).openPopup()

    }

  }

  calculateAzimuth(latS: number, latE: number, lngS: number, lngE: number) {
    if (latE > latS && lngE > lngS) {
      return Math.atan((lngE - lngS) / (latE - latS)) * (180 / Math.PI)
    } else if (latE < latS) {
      return Math.atan((lngE - lngS) / (latE - latS)) * (180 / Math.PI) + 180
    } else if (latE > latS && lngE < lngS) {
      return Math.atan((lngE - lngS) / (latE - latS)) * (180 / Math.PI) + 360
    }

  }

  rotate() {
    this.pickOriginActive = false
    this.scaleImageActive = false
    this.pickStartActive = false
    this.moveImageActive = false
    this.pickCenterActive = true
    this.rotateImageActive = false
  }

  move() {
    this.pickOriginActive = false
    this.scaleImageActive = false
    this.rotateImageActive = false
    this.pickCenterActive = false
    this.pickStartActive = true
    this.moveImageActive = false
  }

  scale() {
    this.rotateImageActive = false
    this.pickCenterActive = false
    this.pickStartActive = false
    this.moveImageActive = false
    this.pickOriginActive = true
    this.scaleImageActive = false
  }

  distance() {
    this.distanceMeasureing = true
    this.featurePopup = this.featureLayer.getPopup()
    this.featureLayer.unbindPopup()
  }

  locate() {
    this.locatingMap = !this.locatingMap
    document.getElementById('map').style.cursor = 'crosshair'
  }

  changeUnit(e: { target: { value: string } }) {
    this.currentUnit = e.target.value
  }

  LoadImage(e) {
    let file = e.target.files[0]
    let fileReader = new FileReader()
    fileReader.readAsDataURL(file)

    fileReader.onload = (e) => {
      let image = new Image()
      this.imageSRC = image.src = e.target.result.toString()
      image.onload = () => {
        this.imageWidth = image.width
        this.imageHeight = image.height
        this.locate()
      }
    }
  }

  toggleEdit(e) {
    this.featureLayer.eachLayer((layer: any) => {
      if (e.target.checked) {
        layer.dragging.enable()
      } else {
        layer.dragging.disable()
      }
    })
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

    return { newTLX: XX2, newTLY: YY2, newTRX: XX3, newTRY: YY3, newBLX: XX4, newBLY: YY4, centerX: myCenter.Xc, centerY: myCenter.Yc }
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
