import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENV } from '../env';

export interface Medicamento {
  id?: string;
  categoria_id: string;
  nombre_producto: string;
  concentracion: string;
  presentacion: string;
  laboratorio: string;
  lote?: string;
  fecha_vencimiento?: string;
  cantidad_total: number;
  unidad_medida: string;
  proveedor?: string;
  costo_unitario?: number;
  costo_total?: number;
  observaciones?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MedicamentosService {
  private apiUrl = ENV.HTTP+'/inventario';

  constructor(private http: HttpClient) {}

  listar(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(this.apiUrl);
  }
}
