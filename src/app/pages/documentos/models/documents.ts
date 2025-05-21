export interface Documento {
  id: number;
  nombreOriginal: string;
  nombreAlmacenado: string;
  rutaArchivo: string;
  fechaSubida: string; // O Date si lo vas a convertir con new Date()
  categoria: string;
  etiquetas: string;
  tipoContenido: string;
  tamanoKB: number;
}
