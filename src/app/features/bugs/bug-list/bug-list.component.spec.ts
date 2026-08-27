import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';

import { BugListComponent } from './bug-list.component';
import { BugService } from '../../../core/services/bug.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Bug, BugPriority, BugStatus } from '../../../core/models/bug.model';

/**
 * Unit-Test einer Komponente (Bewertungspunkt "Unit Test Komponente").
 *
 * Geprüft werden das Rendern der Material-Tabelle, die Filterlogik und die
 * rollenabhängige Anzeige der Aktionen (Bearbeiten/Löschen nur für ADMIN).
 * Der `BugService` und `KeycloakService` sind durch Testdoubles ersetzt,
 * damit kein echter HTTP- oder Keycloak-Zugriff stattfindet.
 */
describe('BugListComponent', () => {
  const bugs: Bug[] = [
    {
      id: 1,
      title: 'Login schlägt fehl',
      description: 'Sonderzeichen im Passwort',
      status: BugStatus.OPEN,
      priority: BugPriority.HIGH,
      createdAt: '2026-02-01T10:15:00',
    },
    {
      id: 2,
      title: 'Export hängt',
      description: 'CSV-Export bleibt stehen',
      status: BugStatus.CLOSED,
      priority: BugPriority.LOW,
      createdAt: '2026-02-02T08:00:00',
    },
  ];

  /** Minimaler Ersatz für den KeycloakService - die Rollen sind steuerbar. */
  class KeycloakServiceStub {
    roles: string[] = ['USER'];
    isLoggedIn = () => true;
    getUsername = () => 'testuser';
    getUserRoles = () => this.roles;
    updateToken = () => Promise.resolve(true);
    getToken = () => Promise.resolve('test-token');
  }

  let fixture: ComponentFixture<BugListComponent>;
  let keycloak: KeycloakServiceStub;
  let auth: AuthService;
  let bugService: jasmine.SpyObj<BugService>;

  beforeEach(async () => {
    bugService = jasmine.createSpyObj<BugService>('BugService', [
      'getAll',
      'getById',
      'create',
      'update',
      'remove',
    ]);
    bugService.getAll.and.returnValue(of(bugs));
    bugService.remove.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [BugListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BugService, useValue: bugService },
        { provide: KeycloakService, useClass: KeycloakServiceStub },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(false) }) },
        },
        {
          provide: NotificationService,
          useValue: { success: () => undefined, error: () => undefined, info: () => undefined },
        },
      ],
    }).compileComponents();

    keycloak = TestBed.inject(KeycloakService) as unknown as KeycloakServiceStub;
    auth = TestBed.inject(AuthService);
  });

  /** Erzeugt die Komponente mit den angegebenen Realm-Rollen. */
  function createComponent(roles: string[] = ['USER']): void {
    keycloak.roles = roles;
    auth.syncFromKeycloak();
    fixture = TestBed.createComponent(BugListComponent);
    fixture.detectChanges();
  }

  it('wird erzeugt und lädt die Bugs beim Start', () => {
    createComponent();

    expect(fixture.componentInstance).toBeTruthy();
    expect(bugService.getAll).toHaveBeenCalledTimes(1);
  });

  it('zeigt für jeden Bug eine Zeile in der Material-Tabelle', () => {
    createComponent();

    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(2);

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Login schlägt fehl');
    expect(text).toContain('Export hängt');
  });

  it('filtert die Tabelle anhand des Suchbegriffs', () => {
    createComponent();
    const component = fixture.componentInstance as unknown as {
      onSearch: (value: string) => void;
      resultCount: () => number;
    };

    component.onSearch('export');
    fixture.detectChanges();

    expect(component.resultCount()).toBe(1);
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');
    expect(rows.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Export hängt');
  });

  it('zeigt die Löschen-Schaltfläche für die Rolle USER nicht an', () => {
    createComponent(['USER']);

    const deleteButtons = fixture.nativeElement.querySelectorAll(
      'button[aria-label="Bug löschen"]',
    );
    expect(deleteButtons.length).toBe(0);
  });

  it('zeigt die Löschen-Schaltfläche für die Rolle ADMIN an', () => {
    createComponent(['ADMIN']);

    const deleteButtons = fixture.nativeElement.querySelectorAll(
      'button[aria-label="Bug löschen"]',
    );
    expect(deleteButtons.length).toBe(2);
  });

  it('zeigt einen Hinweis, wenn kein Bug zum Filter passt', () => {
    createComponent();
    const component = fixture.componentInstance as unknown as {
      onSearch: (value: string) => void;
    };

    component.onSearch('gibt-es-nicht');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Keine Treffer');
  });
});
