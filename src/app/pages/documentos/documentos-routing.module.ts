import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentosListaComponent } from './documentos-lista/documentos-lista.component';
import { CategoriasListaComponent } from './categorias-lista/categorias-lista.component';


const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'documentos-lista',
                component: DocumentosListaComponent,
            },
            {
                path: 'categorias-lista',
                component: CategoriasListaComponent,
            },
            { path: '**', redirectTo: 'documentos-lista' },
        ],
    },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentosRoutingModule { }
