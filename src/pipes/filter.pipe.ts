import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], busqueda: string = '', rol: string = '', estado: string = ''): any[] {
    if (!items) return [];
    
    return items.filter(item => {
      const coincideBusqueda =
        item.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.usuario?.toLowerCase().includes(busqueda.toLowerCase());

      const coincideRol = rol ? item.rol === rol : true;
      const coincideEstado = estado ? item.estado === estado : true;

      return coincideBusqueda && coincideRol && coincideEstado;
    });
  }
}
