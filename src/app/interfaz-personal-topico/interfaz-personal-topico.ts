import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interfaz-personal-topico',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './interfaz-personal-topico.html',
  styleUrl: './interfaz-personal-topico.scss'
})
export class InterfazPersonalTopico {
  
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