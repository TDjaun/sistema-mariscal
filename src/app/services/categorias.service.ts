import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

export interface Categoria {
  id?: string;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriasService {
  private readonly apiUrl = ENV.HTTP+'/categorias';

  constructor(private http: HttpClient) {}
  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  crear(data: Categoria): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, data);
  }

  actualizar(id: string, data: Categoria): Observable<Categoria> {
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
