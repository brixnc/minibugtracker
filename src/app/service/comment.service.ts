import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Comment, CommentPayload } from '../data/comment';

/**
 * CRUD-Service für die Ressource `/api/comments`.
 *
 * `getListByBug()` bildet die Beziehung Bug -> Kommentare ab. Im
 * Demoprojekt entspricht das den zusätzlichen Services für die Relationen
 * (`genre.service.ts`, `platform.service.ts`) - hier reicht eine Methode,
 * weil das Backend den passenden Endpunkt bereits anbietet.
 *
 * | Methode        | HTTP                             | Backend-Berechtigung |
 * |----------------|----------------------------------|----------------------|
 * | getList        | GET    /api/comments             | USER oder ADMIN      |
 * | getListByBug   | GET    /api/comments/bug/{bugId} | USER oder ADMIN      |
 * | getOne         | GET    /api/comments/{id}        | USER oder ADMIN      |
 * | create         | POST   /api/comments             | USER oder ADMIN      |
 * | update         | PUT    /api/comments/{id}        | ADMIN                |
 * | delete         | DELETE /api/comments/{id}        | ADMIN                |
 */
@Injectable({ providedIn: 'root' })
export class CommentService {
  private static readonly backendUrl = 'comments';

  private readonly http = inject(HttpClient);

  /** Liest alle Kommentare. */
  public getList(): Observable<Comment[]> {
    const url = environment.backendBaseUrl + CommentService.backendUrl;
    return this.http.get<Comment[]>(url);
  }

  /** Liest alle Kommentare zu einem Bug (Relation Bug -> Kommentare). */
  public getListByBug(bugId: number): Observable<Comment[]> {
    const url = `${environment.backendBaseUrl}${CommentService.backendUrl}/bug/${bugId}`;
    return this.http.get<Comment[]>(url);
  }

  /** Liest einen einzelnen Kommentar. */
  public getOne(id: number): Observable<Comment> {
    const url = `${environment.backendBaseUrl}${CommentService.backendUrl}/${id}`;
    return this.http.get<Comment>(url);
  }

  /** Erfasst einen neuen Kommentar. */
  public create(comment: CommentPayload): Observable<Comment> {
    const url = environment.backendBaseUrl + CommentService.backendUrl;
    return this.http.post<Comment>(url, comment);
  }

  /** Aktualisiert einen Kommentar (nur ADMIN). */
  public update(id: number, comment: CommentPayload): Observable<Comment> {
    const url = `${environment.backendBaseUrl}${CommentService.backendUrl}/${id}`;
    return this.http.put<Comment>(url, comment);
  }

  /** Löscht einen Kommentar (nur ADMIN). */
  public delete(id: number): Observable<void> {
    const url = `${environment.backendBaseUrl}${CommentService.backendUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
