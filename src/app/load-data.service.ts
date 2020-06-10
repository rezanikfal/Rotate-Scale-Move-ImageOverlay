import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface geoJSON {
  type: string;
  name: string;
  crs: {
    type: string;
    properties: {
      name: string;
    }
  },
  features:
  {
    type: string;
    properties: {
      Id: number;
      Y: number;
      X: number;
      Prop1: string;
      Prop2: number;
    },
    geometry: {
      type: string;
      coordinates: number[]
    }
  }[],
}

@Injectable({
  providedIn: 'root'
})
export class LoadDataService {

  constructor(private http: HttpClient) { }
  loadData() {
    return this.http.get<any>(
      'http://demo6963645.mockable.io/newpoints'
    );
  }}
