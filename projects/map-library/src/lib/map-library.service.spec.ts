import { TestBed } from '@angular/core/testing';

import { MapLibraryService } from './map-library.service';

describe('MapLibraryService', () => {
  let service: MapLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
