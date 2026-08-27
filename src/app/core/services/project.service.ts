import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Project, ProjectPayload } from '../models/project.model';

/**
 * CRUD-Service für die Ressource `/api/projects`.
 *
 * | Methode | HTTP                        | Backend-Berechtigung |
 * |---------|-----------------------------|----------------------|
 * | getAll  | GET    /api/projects        | USER oder ADMIN      |
 * | getById | GET    /api/projects/{id}   | USER oder ADMIN      |
 * | create  | POST   /api/projects        | ADMIN                |
 * | update  | PUT    /api/projects/{id}   | ADMIN                |
 * | remove  | DELETE /api/projects/{id}   | ADMIN                |
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  /** Liest alle Projekte. */
  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  /** Liest ein einzelnes Projekt. */
  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  /** Erfasst ein neues Projekt (nur ADMIN). */
  create(project: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  /** Aktualisiert ein bestehendes Projekt (nur ADMIN). */
  update(id: number, project: ProjectPayload): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, project);
  }

  /** Löscht ein Projekt (nur ADMIN). */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
