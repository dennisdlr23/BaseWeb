import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Messages } from 'src/app/helpers/messages';
import { CategoriasService } from '../services/categorias.service';
import { Categorias } from '../models/categorias';

@Component({
  selector: 'app-categorias-dialog',
  templateUrl: './categorias-dialog.component.html',
  styleUrls: ['./categorias-dialog.component.scss']
})
export class CategoriasDialogComponent implements OnInit {

  @Output() categoriaModify = new EventEmitter<Categorias[]>();

  categoria: Categorias;
  isAdd: boolean;
  formCategoria: FormGroup;
  loading: boolean = false;
  display: boolean = false;

  constructor(private fb: FormBuilder, private categoriasService: CategoriasService) {}

  ngOnInit(): void {}

  showDialog(categoria: Categorias, isAdd: boolean) {
    this.isAdd = isAdd;
    this.categoria = {...categoria};  // Clonamos para no mutar directamente
    this._createForm();
    this.display = true;
  }

  private _createForm() {
    this.formCategoria = this.fb.group({
      id: [this.categoria.id ?? 0],
      nombre: [this.categoria.nombre ?? '', Validators.required],
      activa: [this.categoria.activa ?? true]
    });
  }

  async add() {
    if (this.formCategoria.valid) {
      try {
        Messages.loading('Agregando', 'Agregando Categoría');
        await this.categoriasService.add(this.formCategoria.value);
        Messages.closeLoading();
        Messages.Toas('Categoría agregada correctamente');
        await this._reloadCategorias();
        this.display = false;
      } catch (ex) {
        Messages.closeLoading();
        Messages.warning('Advertencia', ex);
      }
    }
  }

  async edit() {
    if (this.formCategoria.valid) {
      try {
        Messages.loading('Editando', 'Editando Categoría');
        await this.categoriasService.edit(this.formCategoria.value);
        Messages.closeLoading();
        Messages.Toas('Categoría editada correctamente');
        await this._reloadCategorias();
        this.display = false;
      } catch (ex) {
        Messages.closeLoading();
        Messages.warning('Advertencia', ex);
      }
    }
  }

  private async _reloadCategorias() {
    try {
      this.loading = true;
      const categorias = await this.categoriasService.get();
      this.categoriaModify.emit(categorias);
      this.loading = false;
    } catch (ex) {
      this.loading = false;
      Messages.warning('Advertencia', ex);
    }
  }

}
