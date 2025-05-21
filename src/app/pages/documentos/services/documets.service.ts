import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, firstValueFrom, map } from "rxjs";
import { environment } from "src/environments/environment";
import { Documento } from "../models/documents";

@Injectable()
export class DocumentService {

  constructor(private http: HttpClient) { }

  async getAll() {
    return await firstValueFrom(this.http.get<Documento[]>(`${environment.uriLogistic}/Documents`));
  }

  async getByTipoContenido(tipoContenido: string) {
    return await firstValueFrom(this.http.get<Documento[]>(`${environment.uriLogistic}/Documents/tipo/${tipoContenido}`));
  }

  async getByCategoria(categoria: string) {
    return await firstValueFrom(this.http.get<Documento[]>(`${environment.uriLogistic}/Documents/categoria/${categoria}`));
  }

  add(documento: Documento): Promise<any> {
  const url = `${environment.uriLogistic}/Add`; // O la ruta correcta de tu endpoint
  console.log('🧾 Payload JSON a enviar:', JSON.stringify(documento, null, 2));

  return firstValueFrom(
    this.http.post(url, documento, { observe: 'response' }).pipe(
      map((res) => {
        console.log('📥 Respuesta completa del backend:', res);
        return res.body;
      }),
      catchError((error) => {
        console.error('🔥 Error en DocumentService.add():', error);
        throw error;
      })
    )
  );
}


  async update(id: number, document: Documento) {
    return await firstValueFrom(this.http.put(`${environment.uriLogistic}/Documents/${id}`, document));
  }

  async delete(id: number) {
    return await firstValueFrom(this.http.delete(`${environment.uriLogistic}/Documents/${id}`));
  }

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("signature", file);
    // Imprimir contenido de FormData
    const formDataContent: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      formDataContent[key] = value instanceof File ? `File: ${value.name}` : value;
    });
    console.log('Payload enviado a /Upload:', JSON.stringify(formDataContent, null, 2));
    try {
      const response = await firstValueFrom(this.http.post<string>(`${environment.uriLogistic}/Upload`, formData));
      console.log('Respuesta de uploadFile:', response);
      return response;
    } catch (error) {
      console.error('Error en uploadFile:', error);
      throw error;
    }
  }

  async getImagen(fileName: string) {
    return await firstValueFrom(this.http.get(`${environment.uriLogistic}/Upload/Imagenes/${fileName}`, {
      responseType: 'blob'
    }));
  }
}