import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

import { AppAuthService } from '../../service/app.auth.service';
import { UserService } from '../../service/user.service';
import { NotificationService } from '../../service/notification.service';
import { AppRoles } from '../../app.roles';
import { AppIsInRolesDirective } from '../../directives/app-is-in-role.dir';

/**
 * Zeigt die Identität, die das Backend aus dem Keycloak-Token liest.
 *
 * Die Schaltfläche "Adminzugriff prüfen" ruft `GET /api/users/admin/check`
 * auf. Sie ist nur für ADMIN sichtbar und belegt, dass die Rollentrennung
 * nicht nur in der Oberfläche, sondern auch serverseitig greift.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, AppIsInRolesDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly userService = inject(UserService);
  private readonly notifications = inject(NotificationService);
  protected readonly auth = inject(AppAuthService);

  protected readonly roles = AppRoles;
  protected readonly adminMessage = signal<string | null>(null);
  protected readonly checking = signal(false);

  constructor() {
    // Profil bei jedem Aufruf frisch vom Backend holen.
    this.auth.loadProfile().subscribe();
  }

  /** Ruft den ADMIN-geschützten Endpunkt des Backends auf. */
  protected checkAdminAccess(): void {
    this.checking.set(true);
    this.userService.adminCheck().subscribe({
      next: (response) => {
        this.checking.set(false);
        this.adminMessage.set(response.message);
        this.notifications.success('Adminzugriff vom Backend bestätigt.');
      },
      error: () => {
        this.checking.set(false);
        this.adminMessage.set(null);
      },
    });
  }

  /** Meldet den Benutzer ab. */
  protected logout(): void {
    this.auth.logout();
  }
}
