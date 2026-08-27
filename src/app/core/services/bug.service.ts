import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Bug, BugPayload } from '../models/bug.model';

/**
 * CRUD-Service für die Ressource `/api/bugs`.
 *
 * | Methode | HTTP                     | Backend-Berechtigung |
 * |---------|--------------------------|----------------------|
 * | getAll  | GET    /api/bugs         | USER oder ADMIN      |
 * | getById | GET    /api/bugs/{id}    | USER oder ADMIN      |
 * | create  | POST   /api/bugs         | USER oder ADMIN      |
 * | update  | PUT    /api/bugs/{id}    | ADMIN                |
 * | remove  | DELETE /api/bugs/{id}    | ADMIN                |
 */
@Injectable({ providedIn: 'root' })
export class BugService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/bugs`;

  /** Liest alle Bugs. */
  getAll(): Observable<Bug[]> {
    return this.http.get<Bug[]>(this.baseUrl);
  }

  /** Liest einen einzelnen Bug. */
  getById(id: number): Observable<Bug> {
    return this.http.get<Bug>(`${this.baseUrl}/${id}`);
  }

  /** Erfasst einen neuen Bug. */
  create(bug: BugPayload): Observable<Bug> {
    return this.http.post<Bug>(this.baseUrl, bug);
  }

  /** Aktualisiert einen bestehenden Bug (nur ADMIN). */
  update(id: number, bug: BugPayload): Observable<Bug> {
    return this.http.put<Bug>(`${this.baseUrl}/${id}`, bug);
  }

  /** Löscht einen Bug (nur ADMIN). */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
