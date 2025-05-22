import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Documento } from '../models/documents';
import { AuthService } from 'src/app/service/users/auth.service';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  constructor(
    private http: HttpClient,
    private authService: AuthService // Inyecta AuthService
  ) {}

  async getAll(): Promise<Documento[]> {
    const userId = this.authService.getCurrentUserId();
    return await firstValueFrom(
      this.http.get<Documento[]>(`${environment.uriApi}/Documents?userId=${userId}`)
    );
  }

  async getByTipoContenido(tipoContenido: string): Promise<Documento[]> {
    return await firstValueFrom(
      this.http.get<Documento[]>(`${environment.uriApi}/Documents/tipo/${tipoContenido}`)
    );
  }

  async getByCategoria(categoria: string): Promise<Documento[]> {
    return await firstValueFrom(
      this.http.get<Documento[]>(`${environment.uriApi}/Documents/categoria/${categoria}`)
    );
  }

  add(documento: Documento): Promise<any> {
    const url = `${environment.uriApi}/Documents`;
    console.log('🧾 Payload JSON a enviar:', JSON.stringify(documento, null, 2));

    return firstValueFrom(
      this.http.post(url, documento, { observe: 'response' }).pipe(
        map((res) => {
          console.log('📥 Respuesta completa del backend:', {
            status: res.status,
            body: res.body
          });
          if (res.status === 200 && res.body && (res.body as any).mensaje) {
            return res.body;
          } else if (res.status === 200 && !res.body) {
            return { mensaje: 'Documento insertado correctamente' };
          } else {
            throw new Error('Respuesta inesperada del backend');
          }
        }),
        catchError((error) => {
          console.error('🔥 Error en DocumentService.add():', {
            status: error.status,
            message: error.message,
            errorResponse: error.error
          });
          return throwError(() => new Error(error.error?.error || error.message || 'No se pudo guardar el documento'));
        })
      )
    );
  }

  async update(id: number, document: Documento): Promise<any> {
    return await firstValueFrom(
      this.http.put(`${environment.uriApi}/Documents/${id}`, document)
    );
  }

 async delete(id: number): Promise<any> {
  return await firstValueFrom(
    this.http.delete(`${environment.uriApi}/Documents/${id}`)
  );
}

  async uploadFile(file: File): Promise<string> {
    const url = `${environment.uriApi}/Upload`;
    const formData = new FormData();
    formData.append('signature', file);
    const formDataContent: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      formDataContent[key] = value instanceof File ? `File: ${value.name}` : value;
    });
    console.log('Payload enviado a /Upload:', JSON.stringify(formDataContent, null, 2));

    try {
      const response = await firstValueFrom(
        this.http.post(url, formData, { responseType: 'text' as const })
      );
      console.log('Respuesta de uploadFile:', response);
      if (!response || !response.startsWith('/Uploads/')) {
        throw new Error('Ruta devuelta por el servidor no es válida: ' + response);
      }
      return response;
    } catch (error) {
      console.error('🔥 Error en uploadFile:', {
        message: error.message,
        status: (error as any).status,
        errorResponse: (error as any).error
      });
      throw new Error('Error al subir el archivo: ' + (error.error?.error || error.message));
    }
  }

  async getImagen(fileName: string): Promise<Blob> {
    const url = `${environment.uriApi}/Upload/Imagenes/${fileName}`;
    console.log(`Solicitando imagen desde: ${url}`);
    try {
      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' })
      );
      console.log(`Imagen cargada desde ${url}`);
      return blob;
    } catch (error) {
      console.error(`Error al obtener imagen desde ${url}:`, error);
      throw error;
    }
  }
}
