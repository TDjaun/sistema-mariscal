import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { ENV } from '../../env';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  modalAbierto = false;
  modalImportar = false;
  nuevoUsuario = { email: '', password: '' };
  archivoSeleccionado: File | null = null;
  cargando = false;
  ENV=ENV

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  private subs: Subscription[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  obtenerUsuarios() {
    this.cargando = true;
    this.cdr.detectChanges();

    const s = this.http.get(ENV.HTTP+'/auth/usuarios').subscribe({
      next: (res: any) => {
        this.usuarios = Array.isArray(res) ? res : [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron obtener los usuarios.', 'error');
        this.usuarios = [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
    this.subs.push(s);
  }

  abrirModal() {
    this.modalAbierto = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.nuevoUsuario = { email: '', password: '' };
    this.cdr.detectChanges();
  }

  abrirModalImportar() {
    this.modalImportar = true;
    this.cdr.detectChanges();
  }

  cerrarModalImportar() {
    this.modalImportar = false;
    this.archivoSeleccionado = null;

    try {
      if (this.fileInputRef && this.fileInputRef.nativeElement) {
        this.fileInputRef.nativeElement.value = '';
      }
    } catch {}
    this.cdr.detectChanges();
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      Swal.fire('Atención', 'Por favor completa todos los campos.', 'warning');
      return;
    }

    const s = this.http
      .post('/auth/registrar-personal', this.nuevoUsuario)
      .subscribe({
        next: (created: any) => {
          if (created && created.id) {
            this.usuarios.unshift(created);
          } else {
            setTimeout(() => this.obtenerUsuarios(), 300);
          }

          Swal.fire('✅ Éxito', 'Usuario creado correctamente.', 'success');
          this.cerrarModal();
          this.cdr.detectChanges();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
        },
      });
    this.subs.push(s);
  }

  eliminarUsuario(id: string) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) {
        const s = this.http.delete(ENV.HTTP+`/auth/usuarios/${id}`).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El usuario fue eliminado correctamente.', 'success');
            this.usuarios = this.usuarios.filter(u => u.id !== id);
            this.cdr.detectChanges();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
          },
        });
        this.subs.push(s);
      }
    });
  }

  cambiarEstado(usuario: any) {
    const estadoAnterior = usuario.estado;
    const nuevoEstado = !estadoAnterior;
    usuario.estado = nuevoEstado;
    this.cdr.detectChanges();

    const s = this.http
      .patch(ENV.HTTP+`http:///auth/usuarios/${usuario.id}/estado`, { estado: nuevoEstado })
      .subscribe({
        next: () => {
          Swal.fire('Éxito', 'El estado se actualizó correctamente.', 'success');
          this.cdr.detectChanges();
        },
        error: () => {
          usuario.estado = estadoAnterior;
          this.cdr.detectChanges();
          Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
        },
      });
    this.subs.push(s);
  }

  exportarExcel() {
    try {
      const ws = XLSX.utils.json_to_sheet(this.usuarios);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      XLSX.writeFile(wb, 'usuarios.xlsx');
      Swal.fire('✅ Éxito', 'Archivo exportado correctamente.', 'success');
    } catch {
      Swal.fire('Error', 'No se pudo exportar el archivo.', 'error');
    }
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] ?? null;
    this.archivoSeleccionado = file;
    this.cdr.detectChanges();
  }

  importarDatos() {
    if (!this.archivoSeleccionado) {
      Swal.fire('Atención', 'Por favor selecciona un archivo Excel.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.archivoSeleccionado);

    const s = this.http.post(ENV.HTTP+'/estudiantes/importar', formData).subscribe({
      next: () => {
        Swal.fire('✅ Éxito', 'Datos importados correctamente.', 'success');

        try {
          if (this.fileInputRef && this.fileInputRef.nativeElement) {
            this.fileInputRef.nativeElement.value = '';
          }
        } catch {}

        this.archivoSeleccionado = null;
        this.cerrarModalImportar();

        setTimeout(() => this.obtenerUsuarios(), 250);
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron importar los datos.', 'error');
      },
    });
    this.subs.push(s);
  }
}
