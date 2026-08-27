import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { AppRole } from './core/models/user.model';

/**
 * Routing der Anwendung.
 *
 * Jede geschützte Route läuft über den `authGuard` (Anmeldung nötig).
 * Routen, die zusätzlich eine bestimmte Realm-Rolle verlangen, ergänzen
 * den `roleGuard` und deklarieren die erlaubten Rollen unter `data.roles`.
 * Die Berechtigungen entsprechen genau den `@PreAuthorize`-Regeln des
 * Spring-Boot-Backends.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'MiniBugTracker',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    title: 'Dashboard | MiniBugTracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },

  // --- Bugs --------------------------------------------------------------
  {
    path: 'bugs',
    title: 'Bugs | MiniBugTracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bugs/bug-list/bug-list.component').then((m) => m.BugListComponent),
  },
  {
    path: 'bugs/neu',
    title: 'Neuer Bug | MiniBugTracker',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.USER, AppRole.ADMIN] },
    loadComponent: () =>
      import('./features/bugs/bug-form/bug-form.component').then((m) => m.BugFormComponent),
  },
  {
    path: 'bugs/:id/bearbeiten',
    title: 'Bug bearbeiten | MiniBugTracker',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.ADMIN] },
    loadComponent: () =>
      import('./features/bugs/bug-form/bug-form.component').then((m) => m.BugFormComponent),
  },
  {
    path: 'bugs/:id',
    title: 'Bug-Details | MiniBugTracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/bugs/bug-detail/bug-detail.component').then((m) => m.BugDetailComponent),
  },

  // --- Projekte ----------------------------------------------------------
  {
    path: 'projekte',
    title: 'Projekte | MiniBugTracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component').then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: 'projekte/neu',
    title: 'Neues Projekt | MiniBugTracker',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.ADMIN] },
    loadComponent: () =>
      import('./features/projects/project-form/project-form.component').then(
        (m) => m.ProjectFormComponent,
      ),
  },
  {
    path: 'projekte/:id/bearbeiten',
    title: 'Projekt bearbeiten | MiniBugTracker',
    canActivate: [authGuard, roleGuard],
    data: { roles: [AppRole.ADMIN] },
    loadComponent: () =>
      import('./features/projects/project-form/project-form.component').then(
        (m) => m.ProjectFormComponent,
      ),
  },

  // --- Benutzer ----------------------------------------------------------
  {
    path: 'profil',
    title: 'Mein Profil | MiniBugTracker',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
  },

  // --- Fehlerseiten ------------------------------------------------------
  {
    path: 'kein-zugriff',
    title: 'Kein Zugriff | MiniBugTracker',
    loadComponent: () =>
      import('./pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '**',
    title: 'Seite nicht gefunden | MiniBugTracker',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
