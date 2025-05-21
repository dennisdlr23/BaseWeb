import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentosRoutingModule } from './documentos-routing.module';
import { DocumentosListaComponent } from './documentos-lista/documentos-lista.component';
import { DocumentosDialogComponent } from './documentos-dialog/documentos-dialog.component';
import { DocumentService } from './services/documets.service';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DocumentosListaComponent,
    DocumentosDialogComponent
  ],
  imports: [
    CommonModule,
    DocumentosRoutingModule,
    ReactiveFormsModule
  ],
   providers: [DocumentService],
})
export class DocumentosModule { }
