import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { BandejaTicketsComponent } from './features/digitalizacion/pages/bandeja-tickets/bandeja-tickets.component';
import { RevisionSplitComponent } from './features/digitalizacion/pages/revision-split/revision-split.component';
import { BuscadorComponent } from './features/archivo-historico/pages/buscador/buscador.component';
import { DashboardReportesComponent } from './features/reportes/pages/dashboard-reportes/dashboard-reportes.component';
import { UsuariosListComponent } from './features/administracion/pages/usuarios-list/usuarios-list.component';
import { authGuard } from './core/guards/auth.guard';

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
        redirectTo: 'digitalizacion/tickets',
        pathMatch: 'full'
      },
      {
        path: 'digitalizacion/tickets',
        component: BandejaTicketsComponent
      },
      {
        path: 'digitalizacion/revision/:id',
        component: RevisionSplitComponent
      },
      {
        path: 'digitalizacion/revision',
        redirectTo: 'digitalizacion/revision/1',
        pathMatch: 'full'
      },
      {
        path: 'archivo-historico',
        component: BuscadorComponent
      },
      {
        path: 'reportes',
        component: DashboardReportesComponent
      },
      {
        path: 'administracion',
        component: UsuariosListComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'digitalizacion/tickets'
  }
];
