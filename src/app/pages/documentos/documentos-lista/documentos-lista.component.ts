import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Documento } from '../models/documents';
import { DocumentService } from '../services/documets.service';
import { CategoriasService } from '../services/categorias.service'; // Importa el servicio
import { Categorias } from '../models/categorias'; // Importa el modelo
import { DomSanitizer, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import { Messages } from 'src/app/helpers/messages';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/service/users/user.service';
import { AuthService } from 'src/app/service/users/auth.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-documentos-lista',
  templateUrl: './documentos-lista.component.html',
  styleUrls: ['./documentos-lista.component.scss']
})
export class DocumentosListaComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt: Table | undefined;
  users: User[] = [];
  userMap: { [key: number]: string } = {};
  documentos: Documento[] = [];
  filteredDocumentos: Documento[] = [];
  imagenPreviewUrls: { [key: number]: SafeUrl } = {};
  error: string | null = null;
  isModalOpen: boolean = false;
  selectedDoc: Documento | null = null;
  private blobUrls: string[] = [];
  previewUrl: SafeUrl | SafeResourceUrl | null = null;
  isFullScreen: boolean = false;
  isEditMode: boolean = false;
  categorias: Categorias[] = []; // Cambiado a Categorias[]
  tiposContenido: string[] = [];
  selectedCategoria: Categorias | null = null; // Cambiado a Categorias | null
  selectedTipoContenido: string | null = null;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  isAdmin: boolean = false;
  loading: boolean = false;

  constructor(
    private documentService: DocumentService,
    private categoriasService: CategoriasService, // Inyecta el servicio
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private authService: AuthService
  ) {
    const user = this.authService.UserValue;
    this.isAdmin = user && user.userName.toLowerCase() === 'admin';
    console.log(`User is ${this.isAdmin ? 'Admin' : 'Non-Admin'}`);
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.cargarUsuarios(), this.cargarCategorias(), this.cargarDocumentos()]);
  }

  ngOnDestroy(): void {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
    this.previewUrl = null;
  }

  async cargarUsuarios(): Promise<void> {
    try {
      this.loading = true;
      this.users = await this.userService.get();
      this.userMap = this.users.reduce((map, user) => {
        map[user.userId] = user.userName;
        return map;
      }, {} as { [key: number]: string });
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      this.error = 'Error al cargar los usuarios.';
    } finally {
      this.loading = false;
    }
  }

  async cargarCategorias(): Promise<void> {
    try {
      this.loading = true;
      this.categorias = await this.categoriasService.get();
      // Filtra solo las categorías activas
      this.categorias = this.categorias.filter(categoria => categoria.activa);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      this.error = 'Error al cargar las categorías.';
    } finally {
      this.loading = false;
    }
  }

  getUserName(userId: number): string {
    return this.userMap[userId] || 'Desconocido';
  }

  async cargarDocumentos(): Promise<void> {
    try {
      this.loading = true;
      this.documentos = await this.documentService.getAll();
      this.filteredDocumentos = [...this.documentos];
      this.cargarFiltros();
      await this.cargarPreviews();
    } catch (e) {
      this.error = 'Error cargando documentos.';
      console.error('Error al cargar documentos:', e);
    } finally {
      this.loading = false;
    }
  }

  cargarFiltros(): void {
    // Solo carga tipos de contenido, ya que categorías se cargan desde el servicio
    this.tiposContenido = [...new Set(this.documentos.map(doc => doc.tipoContenido))].filter(tipo => !!tipo);
  }

  async cargarPreviews(): Promise<void> {
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
    this.blobUrls = [];
    this.imagenPreviewUrls = {};

    for (const doc of this.filteredDocumentos) {
      if (
        doc.tipoContenido.toLowerCase().includes('image') ||
        doc.tipoContenido.toLowerCase() === 'image/jpeg' ||
        doc.tipoContenido.toLowerCase() === 'image/png' ||
        doc.tipoContenido.toLowerCase() === 'image/gif'
      ) {
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

  aplicarFiltros(): void {
    this.filteredDocumentos = this.documentos.filter(doc => {
      let pasaFiltro = true;

      if (this.selectedCategoria && doc.categoria !== this.selectedCategoria.nombre) {
        pasaFiltro = false;
      }

      if (this.selectedTipoContenido && doc.tipoContenido !== this.selectedTipoContenido) {
        pasaFiltro = false;
      }

      const fechaSubida = new Date(doc.fechaSubida);
      if (this.fechaInicio && fechaSubida < this.fechaInicio) {
        pasaFiltro = false;
      }
      if (this.fechaFin && fechaSubida > this.fechaFin) {
        pasaFiltro = false;
      }

      return pasaFiltro;
    });

    this.cargarPreviews();
  }

  resetFiltros(): void {
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
      this.error = 'No se pudo cargar la previsualización.';
    }
  }

  openAddDocumentDialog(): void {
    this.selectedDoc = null;
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  openEditDialog(doc: Documento): void {
    this.selectedDoc = doc;
    this.isEditMode = true;
    this.isModalOpen = true;
  }

  async deleteDocument(doc: Documento): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar el documento "${doc.nombreOriginal}"?`)) {
      try {
        Messages.loading('Eliminando', 'Eliminando documento...');
        const response = await this.documentService.delete(doc.id);
        Messages.closeLoading();
        Messages.Toas(response?.mensaje || 'Documento eliminado correctamente');
        await this.cargarDocumentos();
      } catch (error: any) {
        Messages.closeLoading();
        Messages.warning('Error', error.message || 'No se pudo eliminar el documento.');
        console.error('Error al eliminar documento:', error);
      }
    }
  }

  openFileLocation(doc: Documento): void {
    if (doc.nombreOriginal) {
      const fileUrl = `${environment.uriApi}/Upload/Imagenes/${doc.nombreOriginal}`;
      console.log('Abriendo ubicación del archivo:', fileUrl);
      window.open(fileUrl, '_blank');
    } else {
      Messages.warning('Advertencia', 'No hay ubicación disponible para este documento.');
    }
  }

  closeModal(result: boolean): void {
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

  openPreview(doc: Documento): void {
    this.renderPreview(doc);
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
    console.log('Modo pantalla completa:', this.isFullScreen);
  }
}
