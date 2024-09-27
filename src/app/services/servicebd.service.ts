import { Injectable } from '@angular/core';
import { SQLiteObject } from '@awesome-cordova-plugins/sqlite';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //VARIABLE DE CONEXION A LA BASE DE DATOS
  public database!: SQLiteObject;

  //VARIABLES DE CREACION DE TABLAS
  tablaNoticia: string = "CREATE TABLE noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto NOT NULL);";

  constructor() { }
}
