import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistorialService } from '../../services/historial.service'; 
import { HistorialMappedDto } from '../../models/historial.model'; 
import Swal from 'sweetalert2';

interface ExtendedHistorialMappedDto extends HistorialMappedDto {
  total_atenciones_estudiante?: number; 
}


@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './historial.html',
  host: { ngSkipHydration: 'true' },
  styleUrl: './historial.scss'
})
export class HistorialComponent implements OnInit {

  historial: ExtendedHistorialMappedDto[] = [];
  isLoading: boolean = false;
  
  searchQuery: string = '';
  
  currentPage: number = 1;
  itemsPerPage: number = 10;
  
  mostrarDetalleModal: boolean = false;
  atencionSeleccionada: ExtendedHistorialMappedDto | null = null; 

  constructor(private historialService: HistorialService) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }
  
  cargarHistorial(): void {
    this.isLoading = true;
    
    const params = {
      q: this.searchQuery || undefined,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.historialService.getHistorial(params).subscribe({
      next: (response: any) => { 
        this.historial = (response.data || response) as ExtendedHistorialMappedDto[]; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'Hubo un error al cargar los datos. Revisa la Consola (F12) y el estado de tu API (puerto 3000).',
            confirmButtonText: 'Entendido',
        });
        this.historial = [];
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1) { 
      this.currentPage = page;
      this.cargarHistorial();
    }
  }

  buscarHistorial(): void {
    this.currentPage = 1; 
    this.cargarHistorial();
  }
  
  verDetalle(item: ExtendedHistorialMappedDto): void {
    this.atencionSeleccionada = item;
    this.mostrarDetalleModal = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalleModal = false;
    this.atencionSeleccionada = null;
  }
  
  exportarHistorial(): void {
    const query = this.searchQuery.trim();
    const formato: 'pdf' = 'pdf'; 
    
    this.historialService.exportar(formato, query).subscribe({
      next: ({ blob, filename }) => {
        this.downloadFile(blob, filename);
        Swal.fire({
            icon: 'success',
            title: 'Descarga Exitosa',
            text: `¡El Reporte Detallado PDF ha sido completado! Archivo: ${filename}`,
            timer: 4000,
            showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Error al exportar:', err);
        Swal.fire({
            icon: 'error',
            title: 'Fallo en la Descarga',
            text: `No se pudo generar el archivo. Asegúrate que tu API está activa y que existen datos para exportar.`,
            confirmButtonText: 'Aceptar',
        });
      }
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
  }
  
  truncateSintomas(sintomas: string | undefined | null): string {
    if (!sintomas || typeof sintomas !== 'string') {
        return '— Sin detalles —';
    }
    
    const maxLen = 50;
    return sintomas.length > maxLen ? sintomas.substring(0, maxLen) + '...' : sintomas;
  }
  
  getTipoBadgeClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'consulta general':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'urgencia':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'seguimiento':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  }
}