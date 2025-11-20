import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CategoriasService, Categoria } from '../../services/categorias.service';
import { MedicamentosService, Medicamento } from '../../services/medicamentos.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
})
export class Inventario implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  cargando = true;
  modalAbierto = false;
  editando = false;
  textoBusqueda = '';

  categoriaActual: Categoria = {
    nombre: '',
    descripcion: '',
    estado: true,
  };

  medicamentos: Medicamento[] = [];

  constructor(
    private categoriasService: CategoriasService,
    private medicamentosService: MedicamentosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales() {
    try {
      this.cargando = true;
      await Promise.all([
        this.obtenerCategorias(),
        this.obtenerMedicamentos(),
      ]);
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  obtenerCategorias() {
    return new Promise<void>((resolve) => {
      this.categoriasService.listar().subscribe({
        next: (data) => {
          this.categorias = data;
          this.categoriasFiltradas = data;
          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => {
          console.error('Error al obtener categorías:', err);
          Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
          resolve();
        },
      });
    });
  }

  obtenerMedicamentos() {
    return new Promise<void>((resolve) => {
      this.medicamentosService.listar().subscribe({
        next: (data) => {
          this.medicamentos = data;
          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => {
          console.error('Error al obtener medicamentos:', err);
          Swal.fire('Error', 'No se pudieron cargar los medicamentos', 'error');
          resolve();
        },
      });
    });
  }

  buscar() {
    const termino = this.textoBusqueda.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter(
      (cat) =>
        cat.nombre.toLowerCase().includes(termino) ||
        (cat.descripcion && cat.descripcion.toLowerCase().includes(termino))
    );
  }

  abrirModal(editar = false, categoria?: Categoria) {
    this.modalAbierto = true;
    this.editando = editar;

    if (editar && categoria) {
      this.categoriaActual = { ...categoria };
    } else {
      this.categoriaActual = { nombre: '', descripcion: '', estado: true };
    }
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.categoriaActual = { nombre: '', descripcion: '', estado: true };
  }

  guardarCategoria() {
    if (!this.categoriaActual.nombre.trim()) {
      Swal.fire('Advertencia', 'El nombre es obligatorio', 'warning');
      return;
    }

    if (this.editando && this.categoriaActual.id) {
      this.categoriasService.actualizar(this.categoriaActual.id, this.categoriaActual).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'La categoría se actualizó correctamente', 'success');
          this.obtenerCategorias();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          Swal.fire('Error', 'No se pudo actualizar la categoría', 'error');
        },
      });
    } else {
      this.categoriasService.crear(this.categoriaActual).subscribe({
        next: () => {
          Swal.fire('Registrado', 'La categoría fue creada correctamente', 'success');
          this.obtenerCategorias();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al registrar:', err);
          Swal.fire('Error', 'No se pudo registrar la categoría', 'error');
        },
      });
    }
  }

  eliminarCategoria(id: string) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriasService.eliminar(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La categoría fue eliminada correctamente', 'success');
            this.obtenerCategorias();
          },
          error: (err) => {
            console.error('Error al eliminar:', err);
            Swal.fire('Error', 'No se pudo eliminar la categoría', 'error');
          },
        });
      }
    });
  }

  cambiarEstado(cat: Categoria) {
    const actualizado = { ...cat, estado: !cat.estado };
    this.categoriasService.actualizar(cat.id!, actualizado).subscribe({
      next: () => {
        Swal.fire(
          'Actualizado',
          `La categoría ahora está ${actualizado.estado ? 'activa' : 'inactiva'}`,
          'success'
        );
        this.obtenerCategorias();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
      },
    });
  }

  obtenerNombreCategoria(id: string): string {
    const cat = this.categorias.find((c) => c.id === id);
    return cat ? cat.nombre : '—';
  }

  diasParaVencer(fecha?: string): number {
    if (!fecha) return 9999;
    const hoy = new Date().getTime();
    const venc = new Date(fecha).getTime();
    return Math.ceil((venc - hoy) / (1000 * 60 * 60 * 24));
  }

  // === Getters ===
  get totalCategorias() {
    return this.categorias.length;
  }

  get totalMedicamentos() {
    return this.medicamentos.length;
  }

  get stockBajo() {
    return this.medicamentos.filter((m) => m.cantidad_total < 10).length;
  }

  get proximosAVencer() {
    return this.medicamentos.filter(
      (m) => this.diasParaVencer(m.fecha_vencimiento) <= 30
    ).length;
  }
}
