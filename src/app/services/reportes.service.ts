import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly apiUrl = ENV.HTTP+'/reportes'; 

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el reporte en formato Blob (PDF) desde el backend.
   * @param endpoint El sufijo del endpoint (ej. 'resumen-ejecutivo', 'atenciones', 'inventario').
   */
  getReportePdf(endpoint: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${endpoint}`, { 
      responseType: 'blob' 
    });
  }
}