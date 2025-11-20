import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

export interface EstudianteData {
  id: string; 
  dni: string;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
}

interface EstudianteResponse {
  nombres: string;
  apellidos: string;
  dni: string;
  grado: string;
  seccion: string;
}

export interface IncidenciaPayload {
  dniEstudiante: string;
  fechaHoraOcurrencia: string; 
  tipoIncidencia: string;
  ubicacionIncidente: string;
  reportadoPor: string;
  nivelSeveridad: 'Baja' | 'Media' | 'Alta';
  descripcionDetallada: string;
  primerosAuxiliosAplicados: string;
  notificacionPadres: string;
  trasladoCentroMedico: string;
}

interface IncidenciaResponse {
  id: string;
  fecha_hora_ocurrencia: string;
  tipo_incidencia: string;
  nivel_severidad: string;
  descripcion_detallada: string;
  estudiante: EstudianteResponse; 
}


@Injectable({
  providedIn: 'root'
})
export class IncidenciasService {

  private readonly API_BASE_URL = ENV.HTTP; 
  private readonly INCIDENCIAS_URL = `${this.API_BASE_URL}/incidencias`; 
  private readonly ESTUDIANTES_URL = `${this.API_BASE_URL}/estudiantes`; 
  constructor(private http: HttpClient) { }

  registrarIncidencia(payload: IncidenciaPayload): Observable<IncidenciaResponse> {
    return this.http.post<IncidenciaResponse>(this.INCIDENCIAS_URL, payload);
  }

  /**
   * * @param query El DNI o el Nombre/Apellido a buscar.
   * @returns Un Observable con los datos del estudiante.
   */
  buscarEstudiantePorQuery(query: string): Observable<EstudianteData> {
    let httpParams = new HttpParams();
    
    if (query) {
      httpParams = httpParams.set('query', query); 
    }
    
    const url = `${this.ESTUDIANTES_URL}/buscar`; 
    return this.http.get<EstudianteData>(url, { params: httpParams });
  }
}