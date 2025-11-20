import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ENV } from '../env';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  cargando: boolean = false;
  ENV=ENV

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.cargando = true;

    if (!this.email || !this.password) {
        this.cargando = false;
        Swal.fire({
            icon: 'warning',
            title: 'Campos Vacíos',
            text: 'Por favor, ingresa tu correo y contraseña para continuar.',
            confirmButtonColor: '#F59E0B'
        });
        return;
    }

    this.http.post(ENV.HTTP+'/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.cargando = false;

        const usuario = res.usuario || res.user;

        if (!usuario) {
          Swal.fire({
            icon: 'error',
            title: 'Error de Servidor',
            text: 'Respuesta inválida. Inténtalo de nuevo o contacta soporte.',
            confirmButtonColor: '#EF4444'
          });
          return;
        }

        if (usuario.estado === false) {
          Swal.fire({
            icon: 'warning',
            title: 'Cuenta Inactiva',
            text: 'Tu cuenta está inactiva. Contacta al administrador.',
            confirmButtonColor: '#F59E0B'
          });
          return;
        }

        localStorage.setItem('token', res.token || '');
        localStorage.setItem('usuario', JSON.stringify(usuario));
        Swal.fire({
            icon: 'success',
            title: `¡Bienvenido/a, ${usuario.nombres || 'Usuario'}!`,
            text: 'Redirigiendo al panel...',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            if (usuario.rol === 'admin') {
              this.router.navigate(['/admin']);
            } else if (usuario.rol === 'personal' || usuario.rol === 'topico') {
              this.router.navigate(['/personal']);
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Rol Desconocido',
                text: 'Rol de usuario no reconocido. Contacta al administrador.',
                confirmButtonColor: '#EF4444'
              });
            }
        });
      },
      error: (err) => {
        this.cargando = false;
        console.error('❌ Error en login:', err);

        let titulo = 'Error de Conexión';
        let texto = 'Error al conectar con el servidor. Verifica tu conexión.';
        let icono: 'error' | 'warning' = 'error';

        if (err.status === 401) {
          titulo = 'Credenciales Incorrectas';
          texto = 'Correo o contraseña no válidos. Vuelve a intentarlo.';
        } else if (err.status === 403) {
          titulo = 'Acceso Denegado';
          texto = 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
          icono = 'warning';
        }

        Swal.fire({
          icon: icono,
          title: titulo,
          text: texto,
          confirmButtonColor: '#EF4444'
        });
      }
    });
  }
}