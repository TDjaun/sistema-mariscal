import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ENV } from '../env';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = ENV.HTTP+'/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        if (res.accessToken && res.refreshToken) {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.clearSession();
      return;
    }

    this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
      next: () => {
        console.log('✅ Sesión cerrada correctamente en el servidor');
        this.clearSession();
      },
      error: (err) => {
        console.error('❌ Error al cerrar sesión:', err);
        this.clearSession();
      }
    });
  }

  private clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
