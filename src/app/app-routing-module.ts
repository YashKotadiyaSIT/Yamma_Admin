import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Main } from './layout/main/main';
import { Login } from './pages/auth/login/login';

const routes: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: Main,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./layout/main/main-module').then((m) => m.MainModule)
      }
    ]
  },
  {
    path: '**',
    loadChildren: () =>
      import('./pages/page-not-found/page-not-found-module').then(
        (m) => m.PageNotFoundModule
      )
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
