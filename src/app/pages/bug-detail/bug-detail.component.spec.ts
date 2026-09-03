import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, of } from 'rxjs';

import { BugDetailComponent } from './bug-detail.component';
import { BugService } from '../../service/bug.service';
import { CommentService } from '../../service/comment.service';
import { NotificationService } from '../../service/notification.service';
import { AppAuthService } from '../../service/app.auth.service';
import { AppRoles } from '../../app.roles';
import { Bug, BugPriority, BugStatus } from '../../data/bug';
import { Comment } from '../../data/comment';
import { OAuthServiceStub, fakeAccessToken } from '../../service/oauth.stub';
import { describe, beforeEach, it, expect } from 'vitest';

/**
 * Test der Detailansicht.
 *
 * Prüft insbesondere, dass die Komponente auf den Routenparameter reagiert
 * und Bug samt Kommentaren tatsächlich anzeigt, statt im Ladezustand zu
 * verharren - und dass Bearbeiten und Löschen nur für ADMIN erscheinen.
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
    {
      id: 1,
      content: 'Kann ich reproduzieren.',
      author: 'testuser',
      bugId: 1,
      createdAt: '2026-08-24T10:02:00',
    },
    {
      id: 2,
      content: 'Ursache gefunden.',
      author: 'testadmin',
      bugId: 1,
      createdAt: '2026-08-25T08:44:00',
    },
  ];

  let fixture: ComponentFixture<BugDetailComponent>;
  let oauth: OAuthServiceStub;
  let auth: AppAuthService;

  let requestedBugIds: number[];
  let requestedCommentBugIds: number[];

  const bugServiceStub: Pick<BugService, 'getOne' | 'delete'> = {
    getOne: (id: number): Observable<Bug> => {
      requestedBugIds.push(id);
      return of(bug);
    },
    delete: (): Observable<void> => of(void 0),
  };

  const commentServiceStub: Pick<CommentService, 'getListByBug' | 'delete'> = {
    getListByBug: (bugId: number): Observable<Comment[]> => {
      requestedCommentBugIds.push(bugId);
      return of(comments);
    },
    delete: (): Observable<void> => of(void 0),
  };

  beforeEach(async () => {
    requestedBugIds = [];
    requestedCommentBugIds = [];

    await TestBed.configureTestingModule({
      imports: [BugDetailComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: BugService, useValue: bugServiceStub },
        { provide: CommentService, useValue: commentServiceStub },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(false) }) } },
        {
          provide: NotificationService,
          useValue: { success: () => undefined, error: () => undefined, info: () => undefined },
        },
        { provide: OAuthService, useClass: OAuthServiceStub },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    oauth = TestBed.inject(OAuthService) as unknown as OAuthServiceStub;
    auth = TestBed.inject(AppAuthService);
  });

  /** Erzeugt die Komponente mit gesetztem Routenparameter und Rollen. */
  function createComponent(roles: string[] = [AppRoles.User]): void {
    oauth.signIn(fakeAccessToken('testuser', roles));
    auth.syncFromToken();
    fixture = TestBed.createComponent(BugDetailComponent);
    fixture.componentRef.setInput('id', '1');

    // Erster Durchlauf: Der Routenparameter wird ausgewertet und die Daten
    // werden geladen. Zweiter Durchlauf: Das Template zeigt sie an.
    fixture.detectChanges();
    fixture.detectChanges();
  }

  it('lädt Bug und Kommentare zum Routenparameter', () => {
    createComponent();

    expect(requestedBugIds).toEqual([1]);
    expect(requestedCommentBugIds).toEqual([1]);
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
    createComponent([AppRoles.User]);

    expect(fixture.nativeElement.querySelector('.detail__actions')?.textContent?.trim()).toBe('');
  });

  it('zeigt Bearbeiten und Löschen für die Rolle ADMIN', () => {
    createComponent([AppRoles.Admin]);

    const actions: string = fixture.nativeElement.querySelector('.detail__actions').textContent;
    expect(actions).toContain('Bearbeiten');
    expect(actions).toContain('Löschen');
  });
});
