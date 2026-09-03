import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CurrentUser } from '../data/user';

/**
 * Service für die Ressource `/api/users`.
 * Liefert die Identität, die das Backend aus dem JWT liest.
 *
 * Nur lesend - Benutzer werden in Keycloak verwaltet, nicht in dieser
 * Anwendung. Deshalb gibt es hier kein `create` / `update` / `delete`.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private static readonly backendUrl = 'users';

  private readonly http = inject(HttpClient);

  /** Profil des angemeldeten Benutzers. */
  public getCurrentUser(): Observable<CurrentUser> {
    const url = `${environment.backendBaseUrl}${UserService.backendUrl}/me`;
    return this.http.get<CurrentUser>(url);
  }

  /** Nur die Realm-Rollen des angemeldeten Benutzers. */
  public getCurrentUserRoles(): Observable<string[]> {
    const url = `${environment.backendBaseUrl}${UserService.backendUrl}/me/roles`;
    return this.http.get<string[]>(url);
  }

  /**
   * Admin-Endpunkt des Backends. Dient in der Oberfläche als Nachweis,
   * dass die Rollentrennung serverseitig tatsächlich greift und nicht nur
   * die Schaltflächen ausgeblendet werden.
   */
  public adminCheck(): Observable<{ message: string }> {
    const url = `${environment.backendBaseUrl}${UserService.backendUrl}/admin/check`;
    return this.http.get<{ message: string }>(url);
  }
}
