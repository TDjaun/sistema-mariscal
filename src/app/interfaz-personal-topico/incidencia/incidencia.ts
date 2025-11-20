import { Component, OnInit, NgZone } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2'; 
import { IncidenciasService, IncidenciaPayload, EstudianteData } from '../../services/incidencias.service'; 

interface IncidenciaFormModel extends IncidenciaPayload {
    searchQuery: string;
}

interface EstudianteSeleccionado {
    id: string; 
    dni: string;
    nombreCompleto: string;
    gradoSeccion: string;
}

@Component({
    selector: 'app-incidencia',
    standalone: true, 
    imports: [CommonModule, FormsModule, HttpClientModule], 
    templateUrl: './incidencia.html', 
    host: { ngSkipHydration: 'true' }, 
    styleUrl: './incidencia.scss'
})
export class Incidencia implements OnInit { 

    estudianteSeleccionado: EstudianteSeleccionado | null = null;
    searchQuery: string = '';
    isSearching: boolean = false;

    incidenciaData: IncidenciaFormModel = {
        searchQuery: '',
        dniEstudiante: '',
        fechaHoraOcurrencia: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().substring(0, 16), 
        tipoIncidencia: 'Caída / Golpe',
        ubicacionIncidente: 'Patio de recreo',
        reportadoPor: '',
        nivelSeveridad: 'Baja', 
        descripcionDetallada: '',
        primerosAuxiliosAplicados: '',
        notificacionPadres: 'Sí, inmediatamente',
        trasladoCentroMedico: 'No, se quedó en la escuela',
    };

    constructor(
        private incidenciasService: IncidenciasService,
        private zone: NgZone,
    ) {}

    ngOnInit(): void {
    }

    async buscarEstudiante(): Promise<void> {
        const query = this.searchQuery.trim();
        
        if (!query) {
            await Swal.fire('Advertencia', 'Ingresa el DNI o Nombre del estudiante para buscar.', 'warning');
            return;
        }

        this.isSearching = true;
        this.estudianteSeleccionado = null;
        this.incidenciaData.dniEstudiante = '';

        this.incidenciasService.buscarEstudiantePorQuery(query).subscribe({
            next: async (data: EstudianteData) => {
                this.zone.run(() => {
                    this.estudianteSeleccionado = {
                        id: data.id, 
                        dni: data.dni, 
                        nombreCompleto: `${data.nombres} ${data.apellidos}`,
                        gradoSeccion: `${data.grado} ${data.seccion}`
                    };
                    this.incidenciaData.dniEstudiante = data.dni;
                    this.isSearching = false;
                });
                
                await Swal.fire('Éxito', `Estudiante ${this.estudianteSeleccionado!.nombreCompleto} seleccionado.`, 'success');
            },
            error: async (err: HttpErrorResponse | any) => { 
                console.error('Error al buscar estudiante:', err);
                const errorMessage = err.error?.message || 'Estudiante no encontrado. Verifica la conexión y el término de búsqueda.';
                await Swal.fire('Error', errorMessage, 'error');
                
                this.zone.run(() => {
                    this.isSearching = false;
                });
            }
        });
    }

    async registrarIncidencia(): Promise<void> {
        if (!this.estudianteSeleccionado || !this.incidenciaData.dniEstudiante) {
            await Swal.fire('Advertencia', 'Debes buscar y seleccionar un estudiante primero.', 'warning');
            return;
        }
        if (!this.incidenciaData.descripcionDetallada || !this.incidenciaData.reportadoPor || !this.incidenciaData.fechaHoraOcurrencia) {
            await Swal.fire('Advertencia', 'Faltan datos requeridos.', 'warning');
            return;
        }

        const fechaISO = new Date(this.incidenciaData.fechaHoraOcurrencia).toISOString();

        const payload: IncidenciaPayload = {
            dniEstudiante: this.incidenciaData.dniEstudiante,
            fechaHoraOcurrencia: fechaISO,
            tipoIncidencia: this.incidenciaData.tipoIncidencia,
            ubicacionIncidente: this.incidenciaData.ubicacionIncidente,
            reportadoPor: this.incidenciaData.reportadoPor,
            nivelSeveridad: this.incidenciaData.nivelSeveridad as 'Baja' | 'Media' | 'Alta',
            descripcionDetallada: this.incidenciaData.descripcionDetallada,
            primerosAuxiliosAplicados: this.incidenciaData.primerosAuxiliosAplicados,
            notificacionPadres: this.incidenciaData.notificacionPadres,
            trasladoCentroMedico: this.incidenciaData.trasladoCentroMedico,
        };

        this.incidenciasService.registrarIncidencia(payload).subscribe({
            next: async (response) => {
                await Swal.fire('Incidencia Registrada', `ID: ${response.id}. La incidencia de ${response.estudiante.nombres} fue registrada exitosamente.`, 'success');
                
                this.zone.run(() => {
                    this.limpiarFormulario(false); 
                });
            },
            error: async (err: HttpErrorResponse | any) => { 
                console.error('Error de registro:', err);
                const errorMessage = err.error?.message || 'Error desconocido.';
                await Swal.fire('Error de Registro', 'Fallo al guardar la incidencia: ' + errorMessage, 'error');
            }
        });
    }

    async limpiarFormulario(mostrarAlerta: boolean = true): Promise<void> {
        this.estudianteSeleccionado = null;
        this.searchQuery = '';
        this.incidenciaData = {
            searchQuery: '',
            dniEstudiante: '',
            fechaHoraOcurrencia: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().substring(0, 16),
            tipoIncidencia: 'Caída / Golpe',
            ubicacionIncidente: 'Patio de recreo',
            reportadoPor: '',
            nivelSeveridad: 'Baja',
            descripcionDetallada: '',
            primerosAuxiliosAplicados: '',
            notificacionPadres: 'Sí, inmediatamente',
            trasladoCentroMedico: 'No, se quedó en la escuela',
        };
        
        if (mostrarAlerta) {
            await Swal.fire('Formulario Limpio', 'Se ha reiniciado el formulario de registro.', 'info');
        }
    }
    
    get estudianteSeleccionadoDisplay(): string {
        if (this.estudianteSeleccionado) {
            return `${this.estudianteSeleccionado.nombreCompleto} (${this.estudianteSeleccionado.gradoSeccion})`;
        }
        return 'Ningún estudiante seleccionado';
    }
}