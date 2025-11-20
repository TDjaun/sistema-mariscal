import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { AtencionesService } from '../../services/atenciones.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; 

interface MedicamentoEntregado {
  producto_id: string | null;
  nombre: string;
  cantidad: number;
  dosis: string;
  stock_disponible?: number;
}

interface EstudianteSeleccionado {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  grado: string; 
  seccion: string;
}

@Component({
  selector: 'app-atencion',
  templateUrl: './atencion.html',
  styleUrls: ['./atencion.scss'],
  standalone: true, 
  imports: [FormsModule, CommonModule]
})
export class Atencion implements OnInit {
  
  queryEstudiante: string = '';
  estudianteSeleccionado: EstudianteSeleccionado | null = null;
  busquedaError: string | null = null;
  
  atencionData = {
    fecha_hora_atencion: new Date().toISOString().slice(0, 16),
    tipo_atencion: 'Consulta general',
    sintomas: '',
    diagnostico: '',
    recomendaciones: '',
    observaciones: '',
  };

  medicamentosEntregados: MedicamentoEntregado[] = [{ 
    producto_id: null, 
    nombre: '', 
    cantidad: 1, 
    dosis: '' 
  }];
  
  medicamentosDisponiblesMap: { [index: number]: any[] } = {};
  
  isSaving: boolean = false;
  
  constructor(
    private atencionesService: AtencionesService, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}
  
  ngOnInit(): void {}

    buscarEstudiante() {
        this.estudianteSeleccionado = null;
        this.busquedaError = null;
        if (!this.queryEstudiante) {
            this.busquedaError = 'Ingrese un DNI o nombre para buscar.';
            this.cdr.detectChanges(); 
            return;
        }
        this.atencionesService.buscarEstudiante(this.queryEstudiante).subscribe({
            next: (estudiante) => {
                this.zone.run(() => {
                    this.estudianteSeleccionado = { id: estudiante.id, dni: estudiante.dni, nombres: estudiante.nombres, apellidos: estudiante.apellidos, grado: estudiante.grado, seccion: estudiante.seccion, };
                    this.cdr.markForCheck(); 
                    this.cdr.detectChanges();
                });
            },
            error: (err) => {
                this.zone.run(() => {
                    this.busquedaError = err.error?.message || 'Estudiante no encontrado o error en el servidor.';
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                });
            }
        });
    }

    agregarMedicamento() {
        this.medicamentosEntregados.push({ producto_id: null, nombre: '', cantidad: 1, dosis: '' });
    }

    eliminarMedicamento(index: number) {
        this.medicamentosEntregados.splice(index, 1);
        delete this.medicamentosDisponiblesMap[index];
    }

    seleccionarMedicamento(medicamentoSeleccionado: any, index: number) {
        this.medicamentosEntregados[index].producto_id = medicamentoSeleccionado.id;
        this.medicamentosEntregados[index].nombre = medicamentoSeleccionado.nombre_producto;
        this.medicamentosEntregados[index].stock_disponible = medicamentoSeleccionado.cantidad_total;
        this.medicamentosDisponiblesMap[index] = [];
        this.cdr.detectChanges();
    }

    buscarMedicamentos(query: string, index: number) {
        for (let key in this.medicamentosDisponiblesMap) {
            if (Number(key) !== index) {
                this.medicamentosDisponiblesMap[key] = [];
            }
        }
        if (query.length < 3) {
            this.medicamentosDisponiblesMap[index] = [];
            return;
        }
        this.atencionesService.buscarMedicamentos(query).subscribe(data => {
            this.medicamentosDisponiblesMap[index] = data;
        });
    }

  mostrarAlertaLimpieza() {
    Swal.fire({
        icon: 'info',
        title: 'Formulario Reiniciado',
        text: 'Los campos de la atención han sido limpiados.',
        showConfirmButton: false,
        timer: 1500
    });
  }

  limpiarFormulario() {
    this.queryEstudiante = '';
    this.estudianteSeleccionado = null;
    this.busquedaError = null;
    this.atencionData = {
      fecha_hora_atencion: new Date().toISOString().slice(0, 16),
      tipo_atencion: 'Consulta general',
      sintomas: '',
      diagnostico: '',
      recomendaciones: '',
      observaciones: '',
    };
    this.medicamentosEntregados = [{ producto_id: null, nombre: '', cantidad: 1, dosis: '' }];
    this.medicamentosDisponiblesMap = {};
    
    this.cdr.markForCheck(); 
    this.cdr.detectChanges();
  }

  registrarAtencion() {
    if (!this.estudianteSeleccionado) {
        Swal.fire({ icon: 'warning', title: 'Paciente Requerido', text: 'Debe buscar y seleccionar un estudiante primero para registrar la atención.', confirmButtonColor: '#3085d6' });
      return;
    }

    const medicamentosFinales = this.medicamentosEntregados
      .filter(m => m.producto_id && m.cantidad > 0)
      .map(m => ({ producto_id: m.producto_id!, nombre: m.nombre, cantidad: m.cantidad, dosis: m.dosis, }));

    const payload = {
        estudiante_id: this.estudianteSeleccionado.id, fecha_hora_atencion: this.atencionData.fecha_hora_atencion, tipo_atencion: this.atencionData.tipo_atencion, sintomas: this.atencionData.sintomas, diagnostico: this.atencionData.diagnostico, recomendaciones: this.atencionData.recomendaciones, observaciones: this.atencionData.observaciones, medicamentos: medicamentosFinales,
    };

    this.isSaving = true;
    this.atencionesService.registrarAtencion(payload).subscribe({
      next: (res) => {
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Atención registrada y stock descontado exitosamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#10B981'
        }).then(() => { 
            this.limpiarFormulario();
            this.mostrarAlertaLimpieza();
        });
      },
      error: (err) => {
        const msg = err.error?.message || 'Error desconocido al registrar la atención.';
        Swal.fire({ icon: 'error', title: 'Error de Registro', text: `Ha ocurrido un problema: ${msg}`, confirmButtonColor: '#EF4444' });
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }
}