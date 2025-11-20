import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReportesService } from '../../services/reportes.service';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, NgIf], 
    templateUrl: './reportes.html',
    styleUrls: ['./reportes.scss']
})
export class Reportes {
    private reportesService = inject(ReportesService);
    loadingMap = signal<Map<string, boolean>>(new Map());
    errorMessage = signal<string | null>(null);

    /**
     * @param type
     */
    isLoading(type: string): boolean {
        return this.loadingMap().get(type) || false;
    }

    private setLoading(type: string, status: boolean): void {
        this.loadingMap.update(map => {
            const newMap = new Map(map);
            newMap.set(type, status);
            return newMap;
        });
    }

    /**
     * @param endpoint 
     * @param filename 
     */
    descargarReporte(endpoint: string, filename: string): void {
        
        let type: string;
        if (endpoint.includes('resumen')) {
            type = 'resumen';
        } else if (endpoint.includes('atenciones')) {
            type = 'atenciones';
        } else if (endpoint.includes('inventario')) {
            type = 'inventario';
        } 

        else if (endpoint === 'top-estudiantes') { 
            type = 'topico'; 
        } else {
            type = endpoint; 
        }

        this.setLoading(type, true);
        this.errorMessage.set(null);
        
        this.reportesService.getReportePdf(endpoint)
            .subscribe({
                next: (response: Blob) => {
                    const url = window.URL.createObjectURL(response);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    this.setLoading(type, false);
                },
                error: (err) => {
                    console.error(`Error al descargar el reporte de ${endpoint}:`, err);
                    this.setLoading(type, false);
                    this.errorMessage.set(`No se pudo descargar el reporte ${filename}. Verifique que el servidor de NestJS esté en ejecución y el endpoint '${endpoint}' esté disponible.`);
                }
            });
    }
}