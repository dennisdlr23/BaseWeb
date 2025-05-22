import { Component, OnInit, ViewChild } from '@angular/core';


import { Messages } from 'src/app/helpers/messages';

import { AuthService } from 'src/app/service/users/auth.service';
import { CategoriasDialogComponent } from '../categorias-dialog/categorias-dialog.component';
import { Categorias } from '../models/categorias';
import { CategoriasService } from '../services/categorias.service';

@Component({
  selector: 'app-categorias-lista',
  templateUrl: './categorias-lista.component.html',
  styleUrls: ['./categorias-lista.component.scss']
})
export class CategoriasListaComponent implements OnInit {

  categorias: Categorias[];
  @ViewChild(CategoriasDialogComponent) categoriaDialog: CategoriasDialogComponent;
  loading: boolean = false;
  title: string = "Listado de Categorías";

  constructor(private categoriasService: CategoriasService, private auth: AuthService) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  async loadCategorias() {
    try {
      this.loading = true;
      this.categorias = await this.categoriasService.get();
      this.loading = false;
    } catch (ex) {
      this.loading = false;
      Messages.warning('Advertencia', ex);
    }
  }

  editCategoria(categoria: Categorias) {

    this.categoriaDialog.showDialog(categoria, false);
  }

  addCategoria() {

    this.categoriaDialog.showDialog({ id: 0, nombre: '', activa: true }, true);
  }

  categoriaModify(categorias: Categorias[]) {
    this.categorias = categorias;
  }
}
