
export interface HistorialMappedDto {
    id_atencion: string;
    fecha_atencion: string;
    tipo_atencion: string;
    sintomas_reportados: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    medicamentos: any[] | null;
    nombre_estudiante: string;
    grado_seccion: string;
}

export interface HistorialQueryParams {
  q?: string;
  page?: number;
  limit?: number;
}