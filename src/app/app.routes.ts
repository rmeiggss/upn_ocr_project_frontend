import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { BandejaTicketsComponent } from './features/digitalizacion/pages/bandeja-tickets/bandeja-tickets.component';
import { RevisionSplitComponent } from './features/digitalizacion/pages/revision-split/revision-split.component';
import { BuscadorComponent } from './features/archivo-historico/pages/buscador/buscador.component';
import { DashboardReportesComponent } from './features/reportes/pages/dashboard-reportes/dashboard-reportes.component';
import { UsuariosListComponent } from './features/administracion/pages/usuarios-list/usuarios-list.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => {
          const authService = inject(AuthService);
          return authService.getHomeRouteForRole();
        }
      },
      {
        path: 'digitalizacion/tickets',
        component: BandejaTicketsComponent,
        canActivate: [roleGuard],
        data: { roles: ['Personal de archivo', 'Administrador'] }
      },
      {
        path: 'digitalizacion/revision/:id',
        component: RevisionSplitComponent,
        canActivate: [roleGuard],
        data: { roles: ['Contable', 'Administrador'] }
      },
      {
        path: 'digitalizacion/revision',
        redirectTo: 'digitalizacion/revision/1',
        pathMatch: 'full'
      },
      {
        path: 'archivo-historico',
        component: BuscadorComponent,
        canActivate: [roleGuard],
        data: { roles: ['Personal de archivo', 'Contable', 'SUNAT', 'Administrador'] }
      },
      {
        path: 'reportes',
        component: DashboardReportesComponent,
        canActivate: [roleGuard],
        data: { roles: ['SUNAT', 'Administrador'] }
      },
      {
        path: 'administracion',
        component: UsuariosListComponent,
        canActivate: [roleGuard],
        data: { roles: ['Administrador'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
