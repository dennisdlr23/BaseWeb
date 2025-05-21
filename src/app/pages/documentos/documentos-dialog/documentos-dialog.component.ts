import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentService } from '../services/documets.service';
import { Documento } from '../models/documents';

@Component({
  selector: 'app-documentos-dialog',
  templateUrl: './documentos-dialog.component.html',
  styleUrls: ['./documentos-dialog.component.scss']
})
export class DocumentosDialogComponent implements OnInit {
  documentForm: FormGroup;
  selectedFile: File | null = null;
  @Output() close = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService
  ) {
    this.documentForm = this.fb.group({
      nombreOriginal: [{ value: '', disabled: true }],
      nombreAlmacenado: ['', Validators.required],
      rutaArchivo: [{ value: '', disabled: true }],
      fechaSubida: [{ value: '', disabled: true }],
      categoria: ['', Validators.required],
      etiquetas: [''],
      tipoContenido: [{ value: '', disabled: true }],
      tamanoKB: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {}

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
        return;
      }
      const fileSizeKB = Math.round(this.selectedFile.size / 1024);
      const fechaSubida = new Date().toISOString();

      this.documentForm.patchValue({
        nombreOriginal: fileName,
        tipoContenido: fileType,
        tamanoKB: fileSizeKB,
        fechaSubida: fechaSubida,
        rutaArchivo: `/Uploads/${fileName}`
      });
    }
  }

  async onSubmit(): Promise<void> {
  if (this.documentForm.valid && this.selectedFile) {
    try {
      const uploadedFilePath = await this.documentService.uploadFile(this.selectedFile);
      console.log('📁 Ruta del archivo subido:', uploadedFilePath);

      // ⚠️ Obtenemos todos los valores, incluso los deshabilitados
      const rawValues = this.documentForm.getRawValue();

      console.log('📝 Valores del formulario (raw):');
      console.table(rawValues);

      const document: Documento = {
        id: 0,
        nombreOriginal: rawValues.nombreOriginal,
        nombreAlmacenado: rawValues.nombreAlmacenado,
        rutaArchivo: uploadedFilePath,
        fechaSubida: rawValues.fechaSubida,
        categoria: rawValues.categoria,
        etiquetas: rawValues.etiquetas,
        tipoContenido: rawValues.tipoContenido,
        tamanoKB: rawValues.tamanoKB
      };

      console.log('📤 Payload enviado a DocumentService.add():');
      console.log(JSON.stringify(document, null, 2));

      const response = await this.documentService.add(document);

      console.log('✅ Respuesta del backend:', response);

      this.close.emit(true);
    } catch (error: any) {
      console.error('❌ Error al guardar el documento:', error.message || error);
      this.close.emit(false);
    }
  } else {
    console.warn('⚠️ Formulario inválido o no hay archivo seleccionado');
    this.close.emit(false);
  }
}



  onCancel(): void {
    this.close.emit(false);
  }
}