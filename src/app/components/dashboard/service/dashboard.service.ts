import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DocumentosPorTipoContenido } from "../models/documentosPorTipoContenido";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";
import { DocumentosPorUsuarios } from "../models/documentosPorUsuarios";

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
    constructor(private http: HttpClient) { }



    async getDocumentosPorTipoContenido(): Promise<DocumentosPorTipoContenido[]> {
        return firstValueFrom(
            this.http.get<DocumentosPorTipoContenido[]>(
                `${environment.uriLogistic}/api/Dashboard/Tipo-Documentos`
            )
        );
    }

     async getDocumentosPorUsuarios(): Promise<DocumentosPorUsuarios[]> {
        return firstValueFrom(
            this.http.get<DocumentosPorUsuarios[]>(
                `${environment.uriLogistic}/api/Dashboard/Documentos-Usuarios`
            )
        );
    }

    }
