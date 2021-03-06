import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
//import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { trigger,style,transition,animate,keyframes,query,stagger,group, state, animateChild } from '@angular/animations';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {
    ReactiveFormsModule,
    FormsModule,
    FormGroup,
    FormControl,
    Validators,
    FormBuilder,
    NgForm,
  } from '@angular/forms';

import { PromocionesService } from "./promociones.service";
import { IPromociones } from "./promociones";
import { IServerResponse } from "./ServerResponse";
import { IEmpresas } from "./empresas";
import { ITipoPromocion } from "./tipo-promocion";
import { IMarca } from "./marca";
import { ISucursal } from "./sucursal";
import { stringify } from 'querystring';
import { IPromise } from 'protractor/node_modules/@types/q';
import { IPromocionesById } from "./promocionById";
import { Iimage } from "./Img";


@Component({
    selector: 'app-promociones',
    templateUrl: './promociones.component.html',
    styleUrls: ['./promociones.component.scss'],
    animations: [routerTransition()]
})
export class PromocionesComponent implements OnInit {
    //Variables para el formulario de guardar una nueva promocion
    form: FormGroup;
    SelectTipoPromocion = new FormControl("", Validators.required);
    SelectEmpresa = new FormControl("", Validators.required);
    SelectSucursal = new FormControl("", Validators.required);
    SelectMarca = new FormControl("", Validators.required);
    TxtDescripcion = new FormControl("", Validators.required);
    imageInput = new FormControl("");
    idUsuario = new FormControl("");
    RealImg = new FormControl("");

    //Variables para el formualario de actualizar imagen
    formUpdate: FormGroup;
    RealImgUpdate = new FormControl("");
    imageInputUpdate = new FormControl("");
    promoIdUp = new FormControl("");
    
    //Variables a utilizar en la clase
    errorMessage: any;

    //ModalImagenVariables
    ModalDesc: string = "";
    ModalImg: string = "";
    ModalIdPromo: number = 0;
    
    selectedEmpresa:number     = 0;
    selectedTPromocion:number  = 0;
    selectedMarca:number       = 0;
    selectedSucursal:number    = 0;
    descripcion: string = "";

    closeResult: string;
    idPromocion: number = 0;

    constructor( private _Promoservice: PromocionesService, private modalService: NgbModal, public fb: FormBuilder ) { 
        this.form = fb.group({
            "SelectTipoPromocion": this.SelectTipoPromocion,
            "SelectEmpresa": this.SelectEmpresa,
            "SelectSucursal": this.SelectSucursal,
            "SelectMarca": this.SelectMarca,
            "TxtDescripcion": this.TxtDescripcion,
            "imageInput": this.imageInput,
            "idUsuario": this.idUsuario,
            "RealImg": this.RealImg,
        });

        this.formUpdate = fb.group({
            "RealImgUpdate": this.RealImgUpdate,
            "imageInputUpdate": this.imageInputUpdate,
            "promoIdUp": this.promoIdUp,
        });

    }

    resultadoPromociones:       IPromociones[] = [];
    resultadoPromocionesById:   IPromocionesById[] = [];
    serverResponse:             IServerResponse[] = [];
    resultadoEmpresas:          IEmpresas[] = [];
    resultadoTPromocion:        ITipoPromocion[] = [];
    resultadoMarca:             IMarca[] = [];
    resultadoSucursal:          ISucursal[] = [];

    ngOnInit() {
        this.getTablaPromociones();
        this.getEmpresas();
        this.getTipoPromocion();
    }

    getTablaPromociones(): void{
        this._Promoservice.getPromoColumn()
        .subscribe( resultadoPromociones => {
            this.resultadoPromociones = resultadoPromociones;
            this.resultadoPromociones.forEach(function( item, key ){
                item.pathImagen = 'file/promociones/' + item.po_RutaImagen;
            });
        },
        error => this.errorMessage = <any>error);
    }

    getEmpresas(): void{
        this._Promoservice.getEmpresas()
        .subscribe( resultadoEmpresas => {
            this.resultadoEmpresas = resultadoEmpresas;
            //console.log( resultadoEmpresas );
        },
        error => this.errorMessage = <any>error);
    }

    getTipoPromocion(): void{
        this._Promoservice.getTipoPromocion()
        .subscribe( resultadoTPromocion => {
            this.resultadoTPromocion = resultadoTPromocion;
            //console.log( resultadoTPromocion );
        },
        error => this.errorMessage = <any>error);
    }

    onChangeEmpresa(newValueEmp: number): void {
        this.selectedEmpresa = newValueEmp;
        this.selectedMarca = 0;
        this.GetMarcaBy_empId(this.selectedEmpresa);
        this.GetSucursalBy_empId(this.selectedEmpresa);
    }

    GetMarcaBy_empId(empId){
        this._Promoservice.GetMarcaBy_empId({ empId: empId })
        .subscribe( resultadoMarca => {
            this.resultadoMarca = resultadoMarca;
        },
        error => this.errorMessage = <any>error );
    }

    GetSucursalBy_empId(empId){
        this._Promoservice.GetSucursalBy_empId({ empId: empId })
        .subscribe( resultadoSucursal => {
            this.resultadoSucursal = resultadoSucursal;
        },
        error => this.errorMessage = <any>error );
    }

    onFileChange($event) {
        let reader = new FileReader();
        let file = $event.target.files[0]; 
        console.log( file.type );
        if( file.type != "image/jpeg" && file.type != "image/png" && file.type != "application/pdf" ){
            confirm( "Seleccione una imagen JPG/PNG o un archivo PDF" );
            this.form.controls['RealImg'].setValue("");
        }else{
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.form.controls['imageInput'].setValue({
                    filename: file.name,
                    filetype: file.type,
                    value: reader.result.split(',')[1]
                });
              };
    
            this.form.controls['imageInput'].setValue(file ? file : '');
            this.form.controls['idUsuario'].setValue(JSON.parse(localStorage.getItem("UserData")).usu_id);
        }   
    }

    savePromocion() {
        console.log(this.form);
        var r = confirm("¿Desea guardar esta promoción?");
        if( r ){
            this._Promoservice.savePromocion( this.form )
            .subscribe( serverResponse => {
                this.serverResponse = serverResponse;
                console.log( this.serverResponse );
                this.getTablaPromociones();
            },
            error => this.errorMessage = <any>error );
        }
    }

    onFileChangeUp($event) {
        let reader = new FileReader();
        let file = $event.target.files[0]; 
        if( file.type != "image/jpeg" && file.type != "image/png" && file.type != "application/pdf" ){
            confirm( "Seleccione una imagen JPG/PNG o un archivo PDF" );
            this.formUpdate.controls['RealImgUpdate'].setValue("");
        }else{
            reader.readAsDataURL(file);
            reader.onload = () => {
                this.formUpdate.controls['imageInputUpdate'].setValue({
                    filename: file.name,
                    filetype: file.type,
                    value: reader.result.split(',')[1]
                });
              }; 
            this.formUpdate.controls['imageInputUpdate'].setValue(file ? file : '');
        }   
    }

    updateImage(promoId){
        this.formUpdate.controls["promoIdUp"].setValue(promoId);
        var r = confirm("¿Desea actualizar esta imagen?");
        if( r ){
            this._Promoservice.UpdateImage( this.formUpdate )
            .subscribe( serverResponse => {
                this.serverResponse = serverResponse;
                console.log( this.serverResponse );
                this.ModalImg = 'file/promociones/' + this.formUpdate.value.imageInputUpdate.filename;
            },
            error => this.errorMessage = <any>error );
        }
    }

    updatePromocion(promoid){
        this._Promoservice.UpdatePromocion({ 
            po_IdTipoPromocion: this.selectedTPromocion,
            po_idEmpresa: this.selectedEmpresa,
            po_IdSucursal: this.selectedSucursal,
            po_IdMarca: this.selectedMarca,
            po_Descripcion: this.descripcion,
            //po_RutaImagen: this.img,
            po_IdUsuario: JSON.parse(localStorage.getItem("UserData")).usu_id,
            po_IdPromocion: promoid
         })
        .subscribe( serverResponse => {
            this.serverResponse = serverResponse;
            this.getTablaPromociones();
        },
        error => this.errorMessage = <any>error );
    }

    deletePromocion(promoId){
        var r = confirm("¿Desea eliminar esta promoción?");
        if( r ){
            this._Promoservice.deletePromocion({ promoId: promoId })
            .subscribe( serverResponse => {
            this.serverResponse = serverResponse;
            this.getTablaPromociones();
            },
            error => this.errorMessage = <any>error );
        }
    }

    //================================================================= M O D A L E S =================================================//

  //========= MODAL INSERT ========//
    open(content, algo) {
        this.modalService.open( content, { 
            size: "lg" } );
            this.getTablaPromociones();
    }

    private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    //========= MODAL UPDATE ========//
    openU(contentU, promoId) {
        this.modalService.open( contentU, {  size: "lg" });
        this._Promoservice.GetPromocion_ById({ promoId: promoId })
        .subscribe( resultadoPromocionesById => {
            this.resultadoPromocionesById = resultadoPromocionesById;
            this.onChangeEmpresa( this.resultadoPromocionesById[0].po_idEmpresa );
            this.selectedTPromocion     = this.resultadoPromocionesById[0].po_IdTipoPromocion;
            this.selectedEmpresa        = this.resultadoPromocionesById[0].po_idEmpresa;
            this.selectedMarca          = this.resultadoPromocionesById[0].po_IdMarca;
            this.selectedSucursal       = this.resultadoPromocionesById[0].po_IdSucursal;
            this.descripcion            = this.resultadoPromocionesById[0].po_Descripcion;
           // this.img                    = this.resultadoPromocionesById[0].po_RutaImagen;
            this.idPromocion            = this.resultadoPromocionesById[0].po_IdPromocion;
        },
        error => this.errorMessage = <any>error );
    }

    private getDismissReasonU(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }

    //========= MODAL IMAGEN ========//
    openImg(contentImg, img, desc, promoId) {
        this.modalService.open( contentImg, { 
            size: "lg" });
            this.ModalImg = img;
            this.ModalDesc = desc;
            this.ModalIdPromo = promoId;
    }

    private getDismissReasonImg(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }
}
