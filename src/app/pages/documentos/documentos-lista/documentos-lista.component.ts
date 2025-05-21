import { Component, OnInit } from '@angular/core';
import { Documento } from '../models/documents';
import { DocumentService } from '../services/documets.service';

@Component({
  selector: 'app-documentos-lista',
  templateUrl: './documentos-lista.component.html',
  styleUrls: ['./documentos-lista.component.scss']
})
export class DocumentosListaComponent implements OnInit {

  documentos: Documento[] = [];
  imagenPreviewUrls: { [key: number]: string } = {};
  error: string | null = null;
  isModalOpen: boolean = false; // Control modal visibility

  constructor(private documentService: DocumentService) { }

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  async cargarDocumentos() {
    try {
      this.documentos = await this.documentService.getAll();
      await this.cargarPreviews();
    } catch (e) {
      this.error = "Error cargando documentos.";
      console.error(e);
    }
  }

  async cargarPreviews() {
    for (const doc of this.documentos) {
      if (doc.tipoContenido.toLowerCase().includes('image') || doc.tipoContenido.toLowerCase().includes('img')) {
        try {
          const blob = await this.documentService.getImagen(doc.nombreAlmacenado);
          this.imagenPreviewUrls[doc.id] = URL.createObjectURL(blob);
        } catch {
          this.imagenPreviewUrls[doc.id] = '';
        }
      }
    }
  }

  openAddDocumentDialog() {
    this.isModalOpen = true; // Show modal
  }

  closeModal(result: boolean) {
    this.isModalOpen = false; // Hide modal
    if (result) {
      this.cargarDocumentos(); // Reload documents if saved
    }
  }
}