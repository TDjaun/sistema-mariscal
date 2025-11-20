import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesService {
  private apiUrl = ENV.HTTP+'/estudiantes';

  constructor(private http: HttpClient) {}

  importarExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/importar`, formData);
  }
}
