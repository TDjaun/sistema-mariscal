import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { InterfazAdmin } from './interfaz-admin/interfaz-admin';
import { Inicio } from './interfaz-admin/inicio/inicio';
import { UsuariosComponent } from './interfaz-admin/usuarios/usuarios';
import { Inventario } from './interfaz-admin/inventario/inventario';
import { Reportes } from './interfaz-admin/reportes/reportes';
import { MiPerfil } from './interfaz-admin/mi-perfil/mi-perfil';
import { InterfazPersonalTopico } from './interfaz-personal-topico/interfaz-personal-topico';
import { Home } from './interfaz-personal-topico/home/home';
import { Atencion } from './interfaz-personal-topico/atencion/atencion';
import { HistorialComponent } from './interfaz-personal-topico/historial/historial';
import { Entrada } from './interfaz-personal-topico/entrada/entrada';
import { ReportesUser } from './interfaz-personal-topico/reportes-user/reportes-user';
import { Incidencia } from './interfaz-personal-topico/incidencia/incidencia';
import { PerfilUser } from './interfaz-personal-topico/perfil-user/perfil-user';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: InterfazAdmin,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: Inicio },
      { path: 'usuarios', component: UsuariosComponent},
      { path: 'inventario', component: Inventario},
      { path: 'reportes', component: Reportes},
      { path: 'mi-perfil', component: MiPerfil},
    ],
  },
  {
    path: 'personal',
    component: InterfazPersonalTopico,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'atencion', component: Atencion},
      { path: 'historial', component: HistorialComponent},
      { path: 'incidencia', component: Incidencia},
      { path: 'entrada', component: Entrada},
      { path: 'reportes-user', component: ReportesUser},
      { path: 'perfil-user', component: PerfilUser},
    ],
  },
];
