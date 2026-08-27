import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CurrentUser } from '../models/user.model';

/**
 * Service für die Ressource `/api/users`.
 * Liefert die Identität, die das Backend aus dem JWT liest.
 */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  /** Profil des angemeldeten Benutzers. */
  getCurrentUser(): Observable<CurrentUser> {
    return this.http.get<CurrentUser>(`${this.baseUrl}/me`);
  }

  /** Nur die Realm-Rollen des angemeldeten Benutzers. */
  getCurrentUserRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/me/roles`);
  }

  /**
   * Admin-Endpunkt des Backends. Dient in der Oberfläche als Nachweis,
   * dass die Rollentrennung serverseitig tatsächlich greift.
   */
  adminCheck(): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.baseUrl}/admin/check`);
  }
}
