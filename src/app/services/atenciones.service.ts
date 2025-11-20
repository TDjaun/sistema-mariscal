import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

interface MedicamentoEntregado {
  producto_id: string;
  nombre: string;
  cantidad: number;
  dosis: string;
}

interface Estudiante {
  id: string;            
  dni: string;
  nombres: string;
  apellidos: string;
  grado: string;
  seccion: string;
}

interface CreateAtencionPayload {
  estudiante_id: string;
  fecha_hora_atencion: string;
  tipo_atencion: string;
  sintomas?: string;
  diagnostico?: string;
  recomendaciones?: string;
  observaciones?: string;
  medicamentos?: MedicamentoEntregado[];
}

@Injectable({
  providedIn: 'root'
})
export class AtencionesService {
  private readonly baseUrl = ENV.HTTP; 

  constructor(private http: HttpClient) {}

  buscarEstudiante(query: string): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.baseUrl}/atenciones/estudiantes/buscar`, {
      params: { query }
    });
  }

  buscarMedicamentos(q: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventario/buscar`, {
      params: { q }
    });
  }

  registrarAtencion(payload: CreateAtencionPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/atenciones`, payload);
  }
}