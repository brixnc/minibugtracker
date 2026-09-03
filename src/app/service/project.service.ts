import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Project, ProjectPayload } from '../data/project';

/**
 * CRUD-Service für die Ressource `/api/projects`.
 * Aufbau wie `BugService` und wie `game.service.ts` im Demoprojekt.
 *
 * | Methode | HTTP                        | Backend-Berechtigung |
 * |---------|-----------------------------|----------------------|
 * | getList | GET    /api/projects        | USER oder ADMIN      |
 * | getOne  | GET    /api/projects/{id}   | USER oder ADMIN      |
 * | create  | POST   /api/projects        | ADMIN                |
 * | update  | PUT    /api/projects/{id}   | ADMIN                |
 * | delete  | DELETE /api/projects/{id}   | ADMIN                |
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private static readonly backendUrl = 'projects';

  private readonly http = inject(HttpClient);

  /** Liest alle Projekte. */
  public getList(): Observable<Project[]> {
    const url = environment.backendBaseUrl + ProjectService.backendUrl;
    return this.http.get<Project[]>(url);
  }

  /** Liest ein einzelnes Projekt. */
  public getOne(id: number): Observable<Project> {
    const url = `${environment.backendBaseUrl}${ProjectService.backendUrl}/${id}`;
    return this.http.get<Project>(url);
  }

  /** Erfasst ein neues Projekt (nur ADMIN). */
  public create(project: ProjectPayload): Observable<Project> {
    const url = environment.backendBaseUrl + ProjectService.backendUrl;
    return this.http.post<Project>(url, project);
  }

  /** Aktualisiert ein bestehendes Projekt (nur ADMIN). */
  public update(id: number, project: ProjectPayload): Observable<Project> {
    const url = `${environment.backendBaseUrl}${ProjectService.backendUrl}/${id}`;
    return this.http.put<Project>(url, project);
  }

  /** Löscht ein Projekt (nur ADMIN). */
  public delete(id: number): Observable<void> {
    const url = `${environment.backendBaseUrl}${ProjectService.backendUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
