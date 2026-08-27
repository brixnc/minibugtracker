import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Comment, CommentPayload } from '../models/comment.model';

/**
 * CRUD-Service für die Ressource `/api/comments`.
 *
 * | Methode      | HTTP                             | Backend-Berechtigung |
 * |--------------|----------------------------------|----------------------|
 * | getAll       | GET    /api/comments             | USER oder ADMIN      |
 * | getByBugId   | GET    /api/comments/bug/{bugId} | USER oder ADMIN      |
 * | getById      | GET    /api/comments/{id}        | USER oder ADMIN      |
 * | create       | POST   /api/comments             | USER oder ADMIN      |
 * | update       | PUT    /api/comments/{id}        | ADMIN                |
 * | remove       | DELETE /api/comments/{id}        | ADMIN                |
 */
@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/comments`;

  /** Liest alle Kommentare. */
  getAll(): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.baseUrl);
  }

  /** Liest alle Kommentare zu einem Bug. */
  getByBugId(bugId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/bug/${bugId}`);
  }

  /** Liest einen einzelnen Kommentar. */
  getById(id: number): Observable<Comment> {
    return this.http.get<Comment>(`${this.baseUrl}/${id}`);
  }

  /** Erfasst einen neuen Kommentar. */
  create(comment: CommentPayload): Observable<Comment> {
    return this.http.post<Comment>(this.baseUrl, comment);
  }

  /** Aktualisiert einen Kommentar (nur ADMIN). */
  update(id: number, comment: CommentPayload): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/${id}`, comment);
  }

  /** Löscht einen Kommentar (nur ADMIN). */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
