import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './root/root.component';
import { AuthGuardGuard } from './guard/auth-guard.guard';
import { BComponent } from './b/b.component';
import { AComponent } from './a/a.component';

const routes: Routes = [
  {path: '', component: RootComponent, canActivate: [AuthGuardGuard]},
  {path: 'a', component: AComponent, canActivate: [AuthGuardGuard]},
  {path: 'b', component: BComponent, canActivate: [AuthGuardGuard]},
  {path: 'a/a', component: AComponent, canActivate: [AuthGuardGuard]},
  {path: 'b/b', component: BComponent, canActivate: [AuthGuardGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
