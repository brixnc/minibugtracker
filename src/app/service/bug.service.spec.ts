import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BugService } from './bug.service';
import { Bug, BugPayload, BugPriority, BugStatus } from '../data/bug';
import { environment } from '../../environments/environment';

/**
 * Unit-Test des Service-Layers (Bewertungspunkt «Unit Test Service»).
 *
 * `BugService` ist der wichtigste Service der Anwendung - Bugs sind das
 * Kernobjekt des MiniBugTrackers. Die Wegleitung verlangt, dass **alle**
 * Methoden geprüft werden; abgedeckt sind daher getList, getOne, create,
 * update und delete sowie das Verhalten im Fehlerfall.
 *
 * Aufbau wie `game.service.spec.ts` im Demoprojekt des ÜK: Der HTTP-Verkehr
 * wird mit dem `HttpTestingController` abgefangen, es geht also kein
 * echter Request hinaus. Geprüft wird, dass jede Methode die richtige URL
 * mit der richtigen HTTP-Methode aufruft und dass die JSON-Antwort korrekt
 * auf die Klasse `Bug` abgebildet wird.
 */
describe('BugService', () => {
  // Genau die URL, die der Service zusammensetzt: backendBaseUrl + 'bugs'.
  const baseUrl = `${environment.backendBaseUrl}bugs`;

  let service: BugService;
  let httpMock: HttpTestingController;

  const bug: Bug = {
    id: 1,
    title: 'Login schlägt fehl',
    description: 'Bei Sonderzeichen im Passwort bricht der Login ab.',
    status: BugStatus.OPEN,
    priority: BugPriority.HIGH,
    createdAt: '2026-02-01T10:15:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BugService, provideHttpClient(), provideHttpClientTesting()],
      teardown: { destroyAfterEach: true },
    });

    service = TestBed.inject(BugService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Stellt sicher, dass kein unerwarteter Request offen bleibt.
    httpMock.verify();
  });

  it('wird erzeugt', () => {
    expect(service).toBeTruthy();
  });

  it('getList() ruft GET /api/bugs auf und bildet die Antwort auf Bug[] ab', () => {
    let result: Bug[] | undefined;
    service.getList().subscribe((bugs) => (result = bugs));

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush([bug]);

    expect(result).toHaveLength(1);
    expect(result?.[0].title).toBe('Login schlägt fehl');
    expect(result?.[0].status).toBe(BugStatus.OPEN);
    expect(result?.[0].priority).toBe(BugPriority.HIGH);
  });

  it('getOne() ruft GET /api/bugs/{id} auf', () => {
    let result: Bug | undefined;
    service.getOne(1).subscribe((value) => (result = value));

    const request = httpMock.expectOne(`${baseUrl}/1`);
    expect(request.request.method).toBe('GET');
    request.flush(bug);

    expect(result?.id).toBe(1);
  });

  it('create() sendet den Datensatz per POST an /api/bugs', () => {
    const payload: BugPayload = {
      title: 'Neuer Bug',
      description: null,
      status: BugStatus.OPEN,
      priority: BugPriority.MEDIUM,
    };

    service.create(payload).subscribe();

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...bug, ...payload });
  });

  it('update() sendet den Datensatz per PUT an /api/bugs/{id}', () => {
    const payload: BugPayload = {
      title: 'Geänderter Titel',
      description: 'angepasst',
      status: BugStatus.IN_PROGRESS,
      priority: BugPriority.LOW,
    };

    service.update(7, payload).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ ...bug, id: 7, ...payload });
  });

  it('delete() ruft DELETE /api/bugs/{id} auf', () => {
    service.delete(3).subscribe();

    const request = httpMock.expectOne(`${baseUrl}/3`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });

  it('meldet Fehler des Backends an den Aufrufer weiter', () => {
    let status: number | undefined;
    service.getOne(99).subscribe({
      next: () => expect.fail('Es wurde ein Fehler erwartet.'),
      error: (error: { status: number }) => (status = error.status),
    });

    httpMock
      .expectOne(`${baseUrl}/99`)
      .flush({ message: 'Bug not found with id: 99' }, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });
});
