import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistorialMappedDto, HistorialQueryParams } from '../models/historial.model';
import { map } from 'rxjs/operators';
import { ENV } from '../env';

@Injectable({
  providedIn: 'root'
})

export class HistorialService { 
  private readonly API_BASE_URL = ENV.HTTP+'/historial'; 

  constructor(private http: HttpClient) { }

  getHistorial(params: HistorialQueryParams = {}): Observable<HistorialMappedDto[]> {
    let httpParams = new HttpParams();

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<HistorialMappedDto[]>(this.API_BASE_URL, { params: httpParams });
  }

  exportar(formato: 'csv' | 'pdf', query: string = ''): Observable<{ blob: Blob, filename: string }> {
    let httpParams = new HttpParams().set('formato', formato);
    
    if (query) {
      httpParams = httpParams.set('q', query);
    }
    
    return this.http.get(`${this.API_BASE_URL}/exportar`, { 
      params: httpParams, 
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `historial_exportado.${formato}`;
        
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+?)"/);
            if (match) {
                filename = match[1];
            }
        }
        
        return { blob: response.body!, filename };
      })
    );
  }
}