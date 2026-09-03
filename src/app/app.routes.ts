import { Routes } from '@angular/router';

import { appCanActivate } from './guard/app.guard';
import { appHomeRedirect } from './guard/app.home.guard';
import { AppRoles } from './app.roles';

/**
 * Routing der Anwendung.
 *
 * Aufbau wie im Demoprojekt des ÜK:
 *  - ein einziger Guard `appCanActivate` prüft Anmeldung **und** Rollen,
 *  - die erlaubten Realm-Rollen stehen an der Route unter `data.roles`,
 *  - wer die Rolle nicht hat, landet auf der Auffangseite `/noaccess`.
 *
 * Die Berechtigungen entsprechen genau den `@PreAuthorize`-Regeln des
 * Spring-Boot-Backends. Wo im Backend nur ADMIN schreiben darf, steht hier
 * `AppRoles.Admin`.
 *
 * Alle Seiten werden über `loadComponent` nachgeladen (Lazy Loading, wie im
 * Kapitel «Routing» des ÜK gezeigt). Der erste Seitenaufruf lädt dadurch
 * nur die Startseite statt der gesamten Anwendung.
 *
 * Die Eigenschaft `title` ist Angulars eigene: Sie schreibt den Text in den
 * Browser-Tab. Das Demoprojekt legt stattdessen `data.pagetitle` an und
 * zeigt den Wert selbst an - hier bewusst nicht doppelt geführt.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'MiniBugTracker',
    // Öffentliche Startseite: bewusst ohne `appCanActivate`, damit nicht
    // angemeldete Besucher überhaupt eine Anmeldemöglichkeit sehen und das
    // Abmelden hier landen kann. `appHomeRedirect` schickt angemeldete
    // Benutzer weiter auf das Dashboard, die eigentliche Hauptseite.
    canActivate: [appHomeRedirect],
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'dashboard',
    title: 'Dashboard | MiniBugTracker',
    canActivate: [appCanActivate],
    // Keine `roles`-Angabe: angemeldet sein genügt.
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },

  // --- Bugs --------------------------------------------------------------
  {
    path: 'bugs',
    title: 'Bugs | MiniBugTracker',
    canActivate: [appCanActivate],
    loadComponent: () =>
      import('./pages/bug-list/bug-list.component').then((m) => m.BugListComponent),
  },
  {
    path: 'bugs/neu',
    title: 'Neuer Bug | MiniBugTracker',
    canActivate: [appCanActivate],
    // POST /api/bugs steht USER und ADMIN offen.
    data: { roles: [AppRoles.User, AppRoles.Admin] },
    loadComponent: () =>
      import('./pages/bug-form/bug-form.component').then((m) => m.BugFormComponent),
  },
  {
    path: 'bugs/:id/bearbeiten',
    title: 'Bug bearbeiten | MiniBugTracker',
    canActivate: [appCanActivate],
    // PUT /api/bugs/{id} ist ADMIN vorbehalten.
    data: { roles: [AppRoles.Admin] },
    loadComponent: () =>
      import('./pages/bug-form/bug-form.component').then((m) => m.BugFormComponent),
  },
  {
    // Muss nach 'bugs/neu' stehen, sonst würde ':id' das Wort "neu" schlucken.
    path: 'bugs/:id',
    title: 'Bug-Details | MiniBugTracker',
    canActivate: [appCanActivate],
    loadComponent: () =>
      import('./pages/bug-detail/bug-detail.component').then((m) => m.BugDetailComponent),
  },

  // --- Projekte ----------------------------------------------------------
  {
    path: 'projekte',
    title: 'Projekte | MiniBugTracker',
    canActivate: [appCanActivate],
    loadComponent: () =>
      import('./pages/project-list/project-list.component').then((m) => m.ProjectListComponent),
  },
  {
    path: 'projekte/neu',
    title: 'Neues Projekt | MiniBugTracker',
    canActivate: [appCanActivate],
    // POST /api/projects ist ADMIN vorbehalten.
    data: { roles: [AppRoles.Admin] },
    loadComponent: () =>
      import('./pages/project-form/project-form.component').then((m) => m.ProjectFormComponent),
  },
  {
    path: 'projekte/:id/bearbeiten',
    title: 'Projekt bearbeiten | MiniBugTracker',
    canActivate: [appCanActivate],
    data: { roles: [AppRoles.Admin] },
    loadComponent: () =>
      import('./pages/project-form/project-form.component').then((m) => m.ProjectFormComponent),
  },

  // --- Benutzer ----------------------------------------------------------
  {
    path: 'profil',
    title: 'Mein Profil | MiniBugTracker',
    canActivate: [appCanActivate],
    loadComponent: () =>
      import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
  },

  // --- Fehlerseiten ------------------------------------------------------
  {
    // Pfadname wie im Demoprojekt, damit der Guard-Fallback wiedererkennbar
    // bleibt. Ohne Guard - sonst käme man bei fehlender Rolle nie an.
    path: 'noaccess',
    title: 'Kein Zugriff | MiniBugTracker',
    loadComponent: () =>
      import('./pages/no-access/no-access.component').then((m) => m.NoAccessComponent),
  },
  {
    path: '**',
    title: 'Seite nicht gefunden | MiniBugTracker',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
