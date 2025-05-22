import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../services/documets.service';
import { CategoriasService } from '../services/categorias.service'; // Importa el servicio
import { Documento } from '../models/documents';
import { Categorias } from '../models/categorias'; // Importa el modelo
import { Messages } from 'src/app/helpers/messages';
import { AuthService } from 'src/app/service/users/auth.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentos-dialog',
  templateUrl: './documentos-dialog.component.html',
  styleUrls: ['./documentos-dialog.component.scss']
})
export class DocumentosDialogComponent implements OnInit {
  documentForm: FormGroup;
  selectedFile: File | null = null;
  @Output() close = new EventEmitter<boolean>();
  @Input() documentToEdit: Documento | null = null;
  @Input() isEditMode: boolean = false;
  loading: boolean = false;
  previewUrl: string | ArrayBuffer | null = null;
  readonly basePath: string = 'C:\\SAANAA\\';
  userId: number;
  categorias: Categorias[] = []; // Lista de categorías
  filteredCategorias: Categorias[] = []; // Lista filtrada para el dropdown
  categoriaFilter: string = ''; // Valor del filtro de búsqueda

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private categoriasService: CategoriasService, // Inyecta el servicio
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = this.authService.getCurrentUserId();
    if (!this.userId) {
      Messages.warning("Advertencia", "No se detectó un usuario autenticado. Por favor, inicia sesión.");
      this.router.navigate(['/login']);
    }
    this.documentForm = this.fb.group({
      id: [0],
      nombreOriginal: [{ value: '', disabled: true }],
      nombreAlmacenado: ['', Validators.required],
      rutaArchivo: [{ value: '', disabled: true }],
      fechaSubida: [{ value: '', disabled: true }],
      categoria: ['', Validators.required], // Campo para la categoría seleccionada
      etiquetas: [''],
      tipoContenido: [{ value: '', disabled: true }],
      tamanoKB: [{ value: '', disabled: true }],
      userId: [this.userId, Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCategorias(); // Carga las categorías al iniciar
    if (this.isEditMode && this.documentToEdit) {
      this.loadDocumentForEdit();
    }
  }

  async loadCategorias(): Promise<void> {
    try {
      this.categorias = await this.categoriasService.get();
      this.filteredCategorias = [...this.categorias]; // Inicializa la lista filtrada
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      Messages.warning("Error", "No se pudieron cargar las categorías");
    }
  }

  filterCategorias(): void {
    const filterValue = this.categoriaFilter.toLowerCase();
    this.filteredCategorias = this.categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(filterValue) && categoria.activa
    );
  }

  loadDocumentForEdit(): void {
    if (this.documentToEdit) {
      this.documentForm.patchValue({
        id: this.documentToEdit.id,
        nombreOriginal: this.documentToEdit.nombreOriginal,
        nombreAlmacenado: this.documentToEdit.nombreAlmacenado,
        rutaArchivo: this.documentToEdit.rutaArchivo,
        fechaSubida: this.documentToEdit.fechaSubida,
        categoria: this.documentToEdit.categoria,
        etiquetas: this.documentToEdit.etiquetas,
        tipoContenido: this.documentToEdit.tipoContenido,
        tamanoKB: this.documentToEdit.tamanoKB,
        userId: this.documentToEdit.userId
      });
      this.loadPreview();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type || fileName.split('.').pop()?.toLowerCase() || '';
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(fileType)) {
        alert('Tipo de archivo no soportado');
        this.selectedFile = null;
        this.previewUrl = null;
        return;
      }
      const fileSizeKB = Math.round(this.selectedFile.size / 1024);
      const fechaSubida = new Date().toISOString();

      this.documentForm.patchValue({
        nombreOriginal: fileName,
        tipoContenido: fileType,
        tamanoKB: fileSizeKB,
        fechaSubida: fechaSubida,
        rutaArchivo: `${this.basePath}${fileName}`,
        userId: this.userId
      });

      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result;
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.documentForm.valid) {
      try {
        this.loading = true;
        Messages.loading("Guardando", this.isEditMode ? "Actualizando documento" : "Subiendo documento");

        let response;
        if (this.isEditMode && this.documentToEdit) {
          const updatedDocument: Documento = {
            ...this.documentToEdit,
            ...this.documentForm.getRawValue(),
            userId: this.userId
          };
          response = await this.documentService.update(updatedDocument.id, updatedDocument);
        } else {
          if (!this.selectedFile) throw new Error('No hay archivo seleccionado');
          const uploadedFilePath = await this.documentService.uploadFile(this.selectedFile);
          const fileName = this.selectedFile.name;
          const document: Documento = {
            id: 0,
            ...this.documentForm.getRawValue(),
            rutaArchivo: `${this.basePath}${fileName}`,
            userId: this.userId
          };
          response = await this.documentService.add(document);
        }

        Messages.closeLoading();
        Messages.Toas(this.isEditMode ? "Documento actualizado correctamente" : "Documento guardado correctamente");
        this.close.emit(true);
        this.documentForm.reset();
        this.previewUrl = null;
        this.selectedFile = null;
      } catch (error: any) {
        Messages.closeLoading();
        const errorMessage = error.message || 'No se pudo guardar el documento';
        Messages.warning("Error", errorMessage);
        console.error('❌ Error al guardar el documento:', {
          message: errorMessage,
          payload: JSON.stringify(this.documentForm.getRawValue(), null, 2),
          errorDetails: error
        });
        this.close.emit(false);
      } finally {
        this.loading = false;
      }
    } else {
      Messages.warning("Advertencia", "Formulario inválido");
      this.close.emit(false);
    }
  }

  onCancel(): void {
    this.close.emit(false);
  }

  async loadPreview(): Promise<void> {
    const fileName = this.documentForm.get('nombreOriginal')?.value;
    if (fileName) {
      try {
        const blob = await this.documentService.getImagen(fileName);
        const url = URL.createObjectURL(blob);
        this.previewUrl = url;
      } catch (error) {
        console.error('Error al cargar la vista previa:', error);
        this.previewUrl = null;
        Messages.warning("Error", "No se pudo cargar la vista previa");
      }
    } else {
      Messages.warning("Advertencia", "No hay archivo para mostrar la vista previa");
    }
  }
}
