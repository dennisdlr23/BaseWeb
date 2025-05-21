import { Component, OnInit, OnDestroy } from '@angular/core';
import { Documento } from '../models/documents';
import { DocumentService } from '../services/documets.service';
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { Messages } from 'src/app/helpers/messages';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-documentos-lista',
  templateUrl: './documentos-lista.component.html',
  styleUrls: ['./documentos-lista.component.scss']
})
export class DocumentosListaComponent implements OnInit, OnDestroy {
  documentos: Documento[] = [];
  filteredDocumentos: Documento[] = []; // Lista filtrada para mostrar en la tabla
  imagenPreviewUrls: { [key: number]: SafeUrl } = {};
  error: string | null = null;
  isModalOpen: boolean = false;
  selectedDoc: Documento | null = null;
  private blobUrls: string[] = [];
  previewUrl: SafeUrl | SafeResourceUrl | null = null;
  isFullScreen: boolean = false;
  isEditMode: boolean = false;

  // Variables para los filtros
  categorias: string[] = [];
  tiposContenido: string[] = [];
  selectedCategoria: string | null = null;
  selectedTipoContenido: string | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  constructor(
    private documentService: DocumentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
    this.previewUrl = null;
  }

  async cargarDocumentos() {
    try {
      this.documentos = await this.documentService.getAll();
      this.filteredDocumentos = [...this.documentos]; // Inicialmente, todos los documentos
      this.cargarFiltros(); // Cargar opciones de filtros
      await this.cargarPreviews();
    } catch (e) {
      this.error = "Error cargando documentos.";
      console.error('Error al cargar documentos:', e);
    }
  }

  cargarFiltros() {
    // Obtener categorías únicas
    this.categorias = [...new Set(this.documentos.map(doc => doc.categoria))].filter(cat => !!cat);
    // Obtener tipos de contenido únicos
    this.tiposContenido = [...new Set(this.documentos.map(doc => doc.tipoContenido))].filter(tipo => !!tipo);
  }

  async cargarPreviews() {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
    this.imagenPreviewUrls = {};

    for (const doc of this.filteredDocumentos) {
      if (doc.tipoContenido.toLowerCase().includes('image') || doc.tipoContenido.toLowerCase() === 'image/jpeg' || doc.tipoContenido.toLowerCase() === 'image/png' || doc.tipoContenido.toLowerCase() === 'image/gif') {
        try {
          console.log(`Solicitando previsualización para: /api/Upload/Imagenes/${doc.nombreOriginal}`);
          const blob = await this.documentService.getImagen(doc.nombreOriginal);
          const url = URL.createObjectURL(blob);
          this.imagenPreviewUrls[doc.id] = this.sanitizer.bypassSecurityTrustUrl(url);
          this.blobUrls.push(url);
          console.log(`Previsualización cargada para ID ${doc.id}:`, url);
        } catch (error) {
          console.error(`Error al cargar previsualización para ${doc.nombreOriginal}:`, error);
          this.imagenPreviewUrls[doc.id] = this.sanitizer.bypassSecurityTrustUrl('');
        }
      } else if (doc.tipoContenido.toLowerCase() === 'application/pdf') {
        this.imagenPreviewUrls[doc.id] = this.sanitizer.bypassSecurityTrustUrl('');
      }
    }
  }

  aplicarFiltros() {
    this.filteredDocumentos = this.documentos.filter(doc => {
      let pasaFiltro = true;

      // Filtro por categoría
      if (this.selectedCategoria && doc.categoria !== this.selectedCategoria) {
        pasaFiltro = false;
      }

      // Filtro por tipo de contenido
      if (this.selectedTipoContenido && doc.tipoContenido !== this.selectedTipoContenido) {
        pasaFiltro = false;
      }

      // Filtro por fechas
      const fechaSubida = new Date(doc.fechaSubida);
      if (this.fechaInicio && fechaSubida < this.fechaInicio) {
        pasaFiltro = false;
      }
      if (this.fechaFin && fechaSubida > this.fechaFin) {
        pasaFiltro = false;
      }

      return pasaFiltro;
    });

    // Recargar previsualizaciones para los documentos filtrados
    this.cargarPreviews();
  }

  resetFiltros() {
    this.selectedCategoria = null;
    this.selectedTipoContenido = null;
    this.fechaInicio = null;
    this.fechaFin = null;
    this.filteredDocumentos = [...this.documentos];
    this.cargarPreviews();
  }

  async renderPreview(doc: Documento): Promise<void> {
    try {
      console.log(`Solicitando previsualización para: /api/Upload/Imagenes/${doc.nombreOriginal}`);
      const blob = await this.documentService.getImagen(doc.nombreOriginal);
      const url = URL.createObjectURL(blob);

      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl.toString());
      }
      this.previewUrl = doc.tipoContenido.toLowerCase() === 'application/pdf'
        ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
        : this.sanitizer.bypassSecurityTrustUrl(url);
      this.blobUrls.push(url);
      this.selectedDoc = doc;
      this.isModalOpen = true;
      this.isEditMode = false;
    } catch (error) {
      console.error(`Error al cargar previsualización para ${doc.nombreOriginal}:`, error);
      this.previewUrl = this.sanitizer.bypassSecurityTrustUrl('');
      this.error = "No se pudo cargar la previsualización.";
    }
  }

  openAddDocumentDialog() {
    this.selectedDoc = null;
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  openEditDialog(doc: Documento) {
    this.selectedDoc = doc;
    this.isEditMode = true;
    this.isModalOpen = true;
  }

  async deleteDocument(doc: Documento) {
    if (confirm(`¿Estás seguro de eliminar el documento "${doc.nombreOriginal}"?`)) {
      try {
        Messages.loading("Eliminando", "Eliminando documento...");
        await this.documentService.delete(doc.id);
        Messages.closeLoading();
        Messages.Toas("Documento eliminado correctamente");
        this.cargarDocumentos();
      } catch (error: any) {
        Messages.closeLoading();
        Messages.warning("Error", error.message || "No se pudo eliminar el documento.");
        console.error('Error al eliminar documento:', error);
      }
    }
  }

  openFileLocation(doc: Documento) {
    if (doc.nombreOriginal) {
      const fileUrl = `${environment.uriApi}/Upload/Imagenes/${doc.nombreOriginal}`; // Usar la URL del servidor
      console.log('Abriendo ubicación del archivo:', fileUrl);
      window.open(fileUrl, '_blank');
    } else {
      Messages.warning("Advertencia", "No hay ubicación disponible para este documento.");
    }
  }

  closeModal(result: boolean) {
    this.isModalOpen = false;
    this.isFullScreen = false;
    this.selectedDoc = null;
    this.isEditMode = false;
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl.toString());
      this.previewUrl = null;
    }
    if (result) {
      this.cargarDocumentos();
    }
  }

  openPreview(doc: Documento) {
    this.renderPreview(doc);
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    console.log('Modo pantalla completa:', this.isFullScreen);
  }
}
