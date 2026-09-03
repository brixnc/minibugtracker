import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, of } from 'rxjs';

import { BugListComponent } from './bug-list.component';
import { BugService } from '../../service/bug.service';
import { AppAuthService } from '../../service/app.auth.service';
import { NotificationService } from '../../service/notification.service';
import { AppRoles } from '../../app.roles';
import { Bug, BugPriority, BugStatus } from '../../data/bug';
import { OAuthServiceStub, fakeAccessToken } from '../../service/oauth.stub';
import { describe, beforeEach, it, expect, vi } from 'vitest';

/**
 * Unit-Test einer Komponente (Bewertungspunkt «Unit Test Komponente»).
 *
 * `BugListComponent` ist die wichtigste Seite der Anwendung: Sie zeigt die
 * Material-Tabelle mit allen Bugs, filtert sie und blendet die Aktionen
 * rollenabhängig ein. Die Wegleitung verlangt, dass **alle** Methoden der
 * Komponente geprüft werden - abgedeckt sind daher load, onSearch,
 * onStatusFilter, onPriorityFilter, resetFilters, openDetail und remove.
 *
 * `BugService` und `OAuthService` sind durch Testdoubles ersetzt, damit
 * weder ein HTTP-Request noch eine Weiterleitung zu Keycloak stattfindet.
 */
describe('BugListComponent', () => {
  /**
   * Zugriff auf die `protected`-Mitglieder der Komponente.
   * `protected` schützt vor Zugriffen aus fremden Templates; im Test
   * müssen die Methoden aber aufrufbar sein.
   */
  interface BugListInternals {
    load: () => void;
    onSearch: (value: string) => void;
    onStatusFilter: (value: BugStatus | 'ALL') => void;
    onPriorityFilter: (value: BugPriority | 'ALL') => void;
    resetFilters: () => void;
    openDetail: (bug: Bug) => void;
    remove: (bug: Bug, event: Event) => void;
    resultCount: () => number;
    filteredToNothing: () => boolean;
  }

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

  let fixture: ComponentFixture<BugListComponent>;
  let component: BugListInternals;
  let oauth: OAuthServiceStub;
  let auth: AppAuthService;

  /** Zählt die Aufrufe, ohne dass ein echter Service nötig wäre. */
  let getListCalls: number;
  let deletedIds: number[];
  /** Antwort des Bestätigungsdialogs - je Test umschaltbar. */
  let dialogConfirms: boolean;

  const bugServiceStub: Pick<BugService, 'getList' | 'delete'> = {
    getList: (): Observable<Bug[]> => {
      getListCalls++;
      return of(bugs);
    },
    delete: (id: number): Observable<void> => {
      deletedIds.push(id);
      return of(void 0);
    },
  };

  beforeEach(async () => {
    getListCalls = 0;
    deletedIds = [];
    dialogConfirms = false;

    await TestBed.configureTestingModule({
      imports: [BugListComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BugService, useValue: bugServiceStub },
        { provide: OAuthService, useClass: OAuthServiceStub },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(dialogConfirms) }) },
        },
        {
          provide: NotificationService,
          useValue: { success: () => undefined, error: () => undefined, info: () => undefined },
        },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
    auth = TestBed.inject(AppAuthService);
  });

  /** Erzeugt die Komponente mit den angegebenen Realm-Rollen. */
  function createComponent(roles: string[] = [AppRoles.User]): void {
    oauth.signIn(fakeAccessToken('testuser', roles));
    auth.syncFromToken();
    fixture = TestBed.createComponent(BugListComponent);
    component = fixture.componentInstance as unknown as BugListInternals;
    fixture.detectChanges();
  }

  function rowCount(): number {
    return fixture.nativeElement.querySelectorAll('tr[mat-row]').length;
  }

  it('wird erzeugt und lädt die Bugs beim Start', () => {
    createComponent();

    expect(fixture.componentInstance).toBeTruthy();
    expect(getListCalls).toBe(1);
  });

  it('zeigt für jeden Bug eine Zeile in der Material-Tabelle', () => {
    createComponent();

    expect(rowCount()).toBe(2);
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Login schlägt fehl');
    expect(text).toContain('Export hängt');
  });

  it('load() lädt die Liste erneut vom Backend', () => {
    createComponent();
    component.load();
    fixture.detectChanges();

    expect(getListCalls).toBe(2);
    expect(rowCount()).toBe(2);
  });

  it('onSearch() filtert die Tabelle anhand des Suchbegriffs', () => {
    createComponent();

    component.onSearch('export');
    fixture.detectChanges();

    expect(component.resultCount()).toBe(1);
    expect(rowCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Export hängt');
  });

  it('onSearch() durchsucht auch die Beschreibung', () => {
    createComponent();

    component.onSearch('passwort');
    fixture.detectChanges();

    expect(component.resultCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Login schlägt fehl');
  });

  it('onStatusFilter() zeigt nur Bugs im gewählten Status', () => {
    createComponent();

    component.onStatusFilter(BugStatus.OPEN);
    fixture.detectChanges();

    expect(component.resultCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Login schlägt fehl');
  });

  it('onPriorityFilter() zeigt nur Bugs mit der gewählten Priorität', () => {
    createComponent();

    component.onPriorityFilter(BugPriority.LOW);
    fixture.detectChanges();

    expect(component.resultCount()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Export hängt');
  });

  it('resetFilters() stellt die vollständige Liste wieder her', () => {
    createComponent();

    component.onSearch('export');
    component.onStatusFilter(BugStatus.CLOSED);
    component.onPriorityFilter(BugPriority.LOW);
    fixture.detectChanges();
    expect(component.resultCount()).toBe(1);

    component.resetFilters();
    fixture.detectChanges();

    expect(component.resultCount()).toBe(2);
    expect(rowCount()).toBe(2);
  });

  it('zeigt einen Hinweis, wenn kein Bug zum Filter passt', () => {
    createComponent();

    component.onSearch('gibt-es-nicht');
    fixture.detectChanges();

    expect(component.filteredToNothing()).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Keine Treffer');
  });

  it('openDetail() wechselt auf die Detailseite des Bugs', () => {
    createComponent();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openDetail(bugs[0]);

    expect(navigate).toHaveBeenCalledWith(['/bugs', 1]);
  });

  it('remove() löscht erst nach Bestätigung im Dialog', () => {
    dialogConfirms = false;
    createComponent([AppRoles.Admin]);

    component.remove(bugs[0], new MouseEvent('click'));

    expect(deletedIds).toEqual([]);
  });

  it('remove() löscht den Bug und lädt die Liste neu', () => {
    dialogConfirms = true;
    createComponent([AppRoles.Admin]);

    component.remove(bugs[0], new MouseEvent('click'));

    expect(deletedIds).toEqual([1]);
    // Nach dem Löschen wird die Liste frisch geholt.
    expect(getListCalls).toBe(2);
  });

  it('zeigt die Löschen-Schaltfläche für die Rolle USER nicht an', () => {
    createComponent([AppRoles.User]);

    const deleteButtons = fixture.nativeElement.querySelectorAll(
      'button[aria-label="Bug löschen"]',
    );
    expect(deleteButtons.length).toBe(0);
  });

  it('zeigt die Löschen-Schaltfläche für die Rolle ADMIN an', () => {
    createComponent([AppRoles.Admin]);

    const deleteButtons = fixture.nativeElement.querySelectorAll(
      'button[aria-label="Bug löschen"]',
    );
    expect(deleteButtons.length).toBe(2);
  });
});
