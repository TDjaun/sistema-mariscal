import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-interfaz-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './interfaz-admin.html',
  styleUrls: ['./interfaz-admin.scss']
})
export class InterfazAdmin {
  
      constructor(private authService: AuthService) {}
      cerrarSesion() {
        Swal.fire({
          title: '¿Cerrar Sesión?',
          text: "¿Estás seguro/a que deseas salir de tu cuenta?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#EF4444',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Sí, cerrar sesión',
          cancelButtonText: 'Permanecer conectado'
        }).then((result) => {
          if (result.isConfirmed) {
            this.authService.logout();
            
              Swal.fire({
                  title: '¡Sesión Cerrada!',
                  text: 'Has cerrado sesión correctamente.',
                  icon: 'success',
                  showConfirmButton: false,
                  timer: 800
              });
          }
        });
    }
}
