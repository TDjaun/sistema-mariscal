import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ENV } from '../../env';

interface Medicamento {
  id?: string;
  categoria_id: string;
  nombre_producto: string;
  concentracion: string;
  presentacion: string;
  laboratorio: string;
  lote: string;
  fecha_vencimiento: string;
  fecha_ingreso: string | null;
  cantidad_total: number;
  unidad_medida: string;
  unidades_por_contenedor: number | null;
  condiciones_almacenamiento: string;
  proveedor: string;
  factura_recibo: string | null;
  costo_unitario: number;
  costo_total: number;
  moneda: string;
  observaciones: string;
}

interface Categoria {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-entrada',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada.html',
  styleUrls: ['./entrada.scss'],
})
export class Entrada implements OnInit {
  apiUrl = ENV.HTTP+'/inventario';
  apiCategorias = ENV.HTTP+'/categorias';

  categorias: Categoria[] = [];

  medicamento: Medicamento = {
    categoria_id: '',
    nombre_producto: '',
    concentracion: '',
    presentacion: '',
    laboratorio: '',
    lote: '',
    fecha_vencimiento: '',
    fecha_ingreso: '',
    cantidad_total: 0,
    unidad_medida: '',
    unidades_por_contenedor: null,
    condiciones_almacenamiento: '',
    proveedor: '',
    factura_recibo: null,
    costo_unitario: 0,
    costo_total: 0,
    moneda: 'Soles (PEN)',
    observaciones: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.http.get<Categoria[]>(this.apiCategorias).subscribe({
      next: (data) => (this.categorias = data),
      error: (err) => {
          console.error('Error al cargar categorías:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudieron cargar las categorías desde el servidor.',
            confirmButtonColor: '#EF4444'
          });
      }
    });
  }

  mostrarAlertaLimpieza() {
    Swal.fire({
        icon: 'info',
        title: 'Formulario Reiniciado',
        text: 'Los campos de la entrada de inventario han sido limpiados.',
        showConfirmButton: false, 
        timer: 1500
    });
  }

  registrarMedicamento() {
    if (!this.medicamento.nombre_producto || !this.medicamento.categoria_id || this.medicamento.cantidad_total <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos Incompletos',
            text: 'Asegúrate de completar el Nombre del Producto, Categoría y Cantidad Total (mayor a cero).',
            confirmButtonColor: '#F59E0B'
        });
      return;
    }

    this.medicamento.costo_total =
      this.medicamento.costo_unitario * this.medicamento.cantidad_total;

    this.http.post(this.apiUrl, this.medicamento).subscribe({
      next: (res) => {
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'La nueva entrada de inventario ha sido registrada y el stock actualizado.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#10B981'
        }).then(() => {
            this.limpiarFormulario(); 
            setTimeout(() => {
                this.mostrarAlertaLimpieza();
            }, 50); 
        });
      },
      error: (err) => {
        console.error('Error al registrar medicamento:', err);
        const msg = err.error?.message || 'Error desconocido al registrar el medicamento. Revise la consola.';
        Swal.fire({
            icon: 'error',
            title: 'Error de Registro',
            text: msg,
            confirmButtonColor: '#EF4444'
        });
      },
    });
  }

  limpiarFormulario() {
    this.medicamento = {
      categoria_id: '',
      nombre_producto: '',
      concentracion: '',
      presentacion: '',
      laboratorio: '',
      lote: '',
      fecha_vencimiento: '',
      fecha_ingreso: '',
      cantidad_total: 0,
      unidad_medida: '',
      unidades_por_contenedor: null,
      condiciones_almacenamiento: '',
      proveedor: '',
      factura_recibo: null,
      costo_unitario: 0,
      costo_total: 0,
      moneda: 'Soles (PEN)',
      observaciones: '',
    };
  }
}