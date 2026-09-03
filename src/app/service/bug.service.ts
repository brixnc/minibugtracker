import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Bug, BugPayload } from '../data/bug';

/**
 * CRUD-Service für die Ressource `/api/bugs`.
 *
 * | Methode | HTTP                     | Backend-Berechtigung |
 * |---------|--------------------------|----------------------|
 * | getList | GET    /api/bugs         | USER oder ADMIN      |
 * | getOne  | GET    /api/bugs/{id}    | USER oder ADMIN      |
 * | create  | POST   /api/bugs         | USER oder ADMIN      |
 * | update  | PUT    /api/bugs/{id}    | ADMIN                |
 * | delete  | DELETE /api/bugs/{id}    | ADMIN                |
 *
 * Den Bearer-Token hängt der `resourceServer` von angular-oauth2-oidc an
 * (konfiguriert in `app.config.ts`) - hier ist davon nichts zu sehen.
 */
@Injectable({ providedIn: 'root' })
export class BugService {
  private static readonly backendUrl = 'bugs';

  private readonly http = inject(HttpClient);

  /** Liest alle Bugs. */
  public getList(): Observable<Bug[]> {
    const url = environment.backendBaseUrl + BugService.backendUrl;
    return this.http.get<Bug[]>(url);
  }

  /** Liest einen einzelnen Bug. */
  public getOne(id: number): Observable<Bug> {
    const url = `${environment.backendBaseUrl}${BugService.backendUrl}/${id}`;
    return this.http.get<Bug>(url);
  }

  /** Erfasst einen neuen Bug. */
  public create(bug: BugPayload): Observable<Bug> {
    const url = environment.backendBaseUrl + BugService.backendUrl;
    return this.http.post<Bug>(url, bug);
  }

  /** Aktualisiert einen bestehenden Bug (nur ADMIN). */
  public update(id: number, bug: BugPayload): Observable<Bug> {
    const url = `${environment.backendBaseUrl}${BugService.backendUrl}/${id}`;
    return this.http.put<Bug>(url, bug);
  }

  /** Löscht einen Bug (nur ADMIN). */
  public delete(id: number): Observable<void> {
    const url = `${environment.backendBaseUrl}${BugService.backendUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
