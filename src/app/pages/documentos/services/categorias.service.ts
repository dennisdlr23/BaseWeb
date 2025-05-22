import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { firstValueFrom } from 'rxjs';
import { Categorias } from '../models/categorias';

@Injectable({ providedIn: 'root' })
export class CategoriasService {
    constructor(private http: HttpClient) { }

    async get() {
      return await firstValueFrom(this.http.get<Categorias[]>(`${environment.uriApi}/Categorias`));
    }

    async add(categoria: Categorias) {
      return await firstValueFrom(this.http.post<Categorias>(`${environment.uriApi}/Categorias`, categoria));
    }

    async edit(categoria: Categorias) {
      return await firstValueFrom(this.http.put<Categorias>(`${environment.uriApi}/Categorias/${categoria.id}`, categoria));
    }

    async delete(id: number) {
      return await firstValueFrom(this.http.delete(`${environment.uriApi}/Categorias/${id}`));
    }
}
