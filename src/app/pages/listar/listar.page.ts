import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Route, Router } from '@angular/router';
import { ServicebdService } from 'src/app/services/servicebd.service';

@Component({
  selector: 'app-listar',
  templateUrl: './listar.page.html',
  styleUrls: ['./listar.page.scss'],
})
export class ListarPage implements OnInit {

  arregloNoticias: any = [
    {
      id: '',
      titulo: '',
      texto: ''
    }
  ]

  constructor(private bd: ServicebdService, private router:Router) { }

  ngOnInit() {
    //verificar si la base de datos esta lista
    this.bd.dbState().subscribe(data=>{
      if(data){
        //Suscribir al observable de la consulta
        this.bd.fetchNoticias().subscribe(res=>{
          this.arregloNoticias = res;
        })
      }
    })
  }

  modificar(x:any){
    let navigationExtras: NavigationExtras = {
      state: {
        noticiaEnviada: x
      }
    }
    this.router.navigate(['/modificar'],navigationExtras);
  }

  eliminar(x:any){
    this.bd.eliminarNoticia(x.idnoticia);
  }

  agregar(){
    this.router.navigate(['/agregar']);
  }

}
