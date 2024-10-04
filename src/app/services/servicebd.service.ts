import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //VARIABLE DE CONEXION A LA BASE DE DATOS
  public database!: SQLiteObject;

  //VARIABLES DE CREACION DE TABLAS
  tablaNoticia: string = "CREATE TABLE noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto NOT NULL);";

  //VARIABLE DE INSERT POR DEFECTO EN LA BASE DE DATOS
  registroNoticia: string = "INSERT INTO or IGNORE noticia(idnoticia, titulo, texto) VALUES(1,'Soy el titulo de noticia','Soy el contenido completo de la noticia por defecto')"

  //VARIABLE PARA GUARDAR LOS REGISTROS RESULTANTES DE UN SELECT
  listadoNoticias = new BehaviorSubject([])

  //VARIABLE PARA MANIPULAR EL ESTADO DE LA BASE DE DATOS
  private isDBReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private sqlite: SQLite, private platform: Platform,
    private alertController: AlertController) { }

  //FUNCIONES DE RETORNO DE OBSERVABLE
  fetchNoticias(): Observable<Noticias[]>{
    return this.listadoNoticias.asObservable();
  }

  dbState(){
    return this.isDBReady.asObservable();
  }

  //ALERTA PARA TODOS
  async presentAlert(titulo:string, mdj:string) {
    const alert = await this.alertController.create({
      header: 'A Short Title Is Best',
      subHeader: 'A Sub Header Is Optional',
      message: 'A message should be a short, complete sentence.',
      buttons: ['Action'],
    });

    await alert.present();
  }

  crearBD(){
    //VERIFICAR LA PLATAFORMA
    this.platform.ready().then(()=>{
      //Prodecimiento creacion base de datos
      this.sqlite.create({
        name: 'noticias.db',
        location: 'default'
      }).then((db: SQLiteObject)=>{
        //Captura y guardado de la conexion de base de datos
        this.database = db;
        //llamar a la funcion de creacion de tablas
        this.crearTablas();
        this.consultarNoticias();
        //modificar el observable del status de la base de datos
        this.isDBReady.next(true);

      }).catch((e)=>{
        this.presentAlert("Creacion de BD", "Error creando la BD: " + JSON.stringify(e));
      })
    })
  }

  async crearTablas(){
    try{
      //mandar a ejecutar las tablas en el orden especifico
      await this.database.executeSql(this.tablaNoticia,[]);

      //generamos los insert en caso que existan
      await this.database.executeSql(this.registroNoticia,[]);

    }catch(error){
      this.presentAlert("Creacion de tabla", "Error creando las tbalas: " + JSON.stringify(error));
    }
  }

  //FUNCION PARA HACER UN SELECT 
  consultarNoticias(){
    return this.database.executeSql('SELECT * FROM noticia',[]).then(respuesta=>{
      //variable para almacenar el resultado de la consulta
      let items: Noticias[] = [];
      //verificar si tenemos registros en la consulta
      if(respuesta.rows.length > 0){
        //recorro el resultado
        for(var i = 0; i <respuesta.rows.length; i++){
          items.push({
            idnoticia: respuesta.rows.item(i).idnoticia,
            titulo: respuesta.rows.item(i).titulo,
            texto: respuesta.rows.item(i).texto,
          })
        }
      }
      this.listadoNoticias.next(items as any)

    })
  }

  modificarNoticia(id:string, titulo:string, texto: string){
    //SIGNO ? intecambio por un valor de programacion
    return this.database.executeSql('UPDATE noticia SET titulo = ?, texto = ? WHERE idnoticia = ?',
    [titulo, texto, id]).then(res=>{
      this.presentAlert("Modificar","Noticia Modificada Correctamente");
      this.consultarNoticias();
    }).catch(e=>{
      this.presentAlert("Modificacion noticia", "Error al modificar " + JSON.stringify(e));
    })

  }

  eliminarNoticia(id:string){
    return this.database.executeSql('DELETE FROM noticia WHERE idnoticia= ?',[id]).then(res=>{
      this.presentAlert("Eliminar","Noticia eliminada");
      this.consultarNoticias();
    }).catch(e=>{
      this.presentAlert("Eliminar", "Error al eliminar " + JSON.stringify(e));
    })
  }

  agregarNoticia(titulo: string, texto: string){
    return this.database.executeSql('INSERT INTO noticias(titulo,texto) VALUES (?,?)',[titulo,texto]).then(res=>{
      this.presentAlert("Agregar","Se agrego bien la noticia");
      this.consultarNoticias();
    }).catch(e=>{
      this.presentAlert("Agregar", "Error al insertar " + JSON.stringify(e));
    })
  }

}
