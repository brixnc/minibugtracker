import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { KeycloakService } from 'keycloak-angular';
import { of } from 'rxjs';

import { BugDetailComponent } from './bug-detail.component';
import { BugService } from '../../../core/services/bug.service';
import { CommentService } from '../../../core/services/comment.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { Bug, BugPriority, BugStatus } from '../../../core/models/bug.model';
import { Comment } from '../../../core/models/comment.model';

/**
 * Test der Detailansicht.
 *
 * Prüft insbesondere, dass die Komponente auf den Routenparameter reagiert
 * und Bug samt Kommentaren tatsächlich anzeigt, statt im Ladezustand zu
 * verharren.
 */
describe('BugDetailComponent', () => {
  const bug: Bug = {
    id: 1,
    title: 'Login schlägt bei Sonderzeichen fehl',
    description: 'Enthält das Passwort ein Semikolon, bricht der Login ab.',
    status: BugStatus.OPEN,
    priority: BugPriority.HIGH,
    createdAt: '2026-08-24T09:12:00',
  };

  const comments: Comment[] = [
    { id: 1, content: 'Kann ich reproduzieren.', author: 'testuser', bugId: 1, createdAt: '2026-08-24T10:02:00' },
    { id: 2, content: 'Ursache gefunden.', author: 'testadmin', bugId: 1, createdAt: '2026-08-25T08:44:00' },
  ];

  class KeycloakServiceStub {
    roles: string[] = ['USER'];
    isLoggedIn = () => true;
    getUsername = () => 'testuser';
    getUserRoles = () => this.roles;
    updateToken = () => Promise.resolve(true);
    getToken = () => Promise.resolve('test-token');
  }

  let fixture: ComponentFixture<BugDetailComponent>;
  let keycloak: KeycloakServiceStub;
  let auth: AuthService;
  let bugService: jasmine.SpyObj<BugService>;
  let commentService: jasmine.SpyObj<CommentService>;

  beforeEach(async () => {
    bugService = jasmine.createSpyObj<BugService>('BugService', ['getById', 'remove']);
    bugService.getById.and.returnValue(of(bug));
    bugService.remove.and.returnValue(of(void 0));

    commentService = jasmine.createSpyObj<CommentService>('CommentService', [
      'getByBugId',
      'create',
      'remove',
    ]);
    commentService.getByBugId.and.returnValue(of(comments));

    await TestBed.configureTestingModule({
      imports: [BugDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BugService, useValue: bugService },
        { provide: CommentService, useValue: commentService },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        {
          provide: NotificationService,
          useValue: { success: () => undefined, error: () => undefined, info: () => undefined },
        },
        { provide: KeycloakService, useClass: KeycloakServiceStub },
      ],
    }).compileComponents();

    keycloak = TestBed.inject(KeycloakService) as unknown as KeycloakServiceStub;
    auth = TestBed.inject(AuthService);
  });

  /** Erzeugt die Komponente mit gesetztem Routenparameter und Rollen. */
  function createComponent(roles: string[] = ['USER']): void {
    keycloak.roles = roles;
    auth.syncFromKeycloak();
    fixture = TestBed.createComponent(BugDetailComponent);
    fixture.componentRef.setInput('id', '1');

    // Erster Durchlauf: Der Routenparameter wird ausgewertet und die Daten
    // werden geladen. Zweiter Durchlauf: Das Template zeigt sie an.
    fixture.detectChanges();
    fixture.detectChanges();
  }

  it('lädt Bug und Kommentare zum Routenparameter', () => {
    createComponent();

    expect(bugService.getById).toHaveBeenCalledWith(1);
    expect(commentService.getByBugId).toHaveBeenCalledWith(1);
  });

  it('zeigt Titel und Beschreibung des Bugs an', () => {
    createComponent();

    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain('Login schlägt bei Sonderzeichen fehl');
    expect(text).toContain('Enthält das Passwort ein Semikolon');
    expect(fixture.nativeElement.querySelector('.detail__title')).toBeTruthy();
  });

  it('zeigt den Kommentarverlauf an', () => {
    createComponent();

    const items = fixture.nativeElement.querySelectorAll('.comment');
    expect(items.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Kann ich reproduzieren.');
  });

  it('blendet Bearbeiten und Löschen für die Rolle USER aus', () => {
    createComponent(['USER']);

    expect(fixture.nativeElement.querySelector('.detail__actions')?.textContent?.trim()).toBe('');
  });

  it('zeigt Bearbeiten und Löschen für die Rolle ADMIN', () => {
    createComponent(['ADMIN']);

    const actions: string = fixture.nativeElement.querySelector('.detail__actions').textContent;
    expect(actions).toContain('Bearbeiten');
    expect(actions).toContain('Löschen');
  });
});
