import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentosRoutingModule } from './documentos-routing.module';
import { DocumentosListaComponent } from './documentos-lista/documentos-lista.component';
import { DocumentosDialogComponent } from './documentos-dialog/documentos-dialog.component';
import { DocumentService } from './services/documets.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentPrimeNg } from 'src/app/components.primeng';
import { CategoriasListaComponent } from './categorias-lista/categorias-lista.component';
import { CategoriasDialogComponent } from './categorias-dialog/categorias-dialog.component';


@NgModule({
  declarations: [
    DocumentosListaComponent,
    DocumentosDialogComponent,
    CategoriasListaComponent,
    CategoriasDialogComponent
  ],
  imports: [
    CommonModule,
    DocumentosRoutingModule,
    ReactiveFormsModule,
    ComponentPrimeNg
  ],
   providers: [DocumentService],
})
export class DocumentosModule { }
