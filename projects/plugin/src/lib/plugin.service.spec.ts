import { TestBed } from '@angular/core/testing';

import { PluginService } from './plugin.service';

describe('PluginService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PluginService = TestBed.get(PluginService);
    expect(service).toBeTruthy();
  });
});
