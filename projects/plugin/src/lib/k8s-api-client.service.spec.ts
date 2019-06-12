import { TestBed } from '@angular/core/testing';

import { K8sApiClientService } from './k8s-api-client.service';

describe('K8sApiClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: K8sApiClientService = TestBed.get(K8sApiClientService);
    expect(service).toBeTruthy();
  });
});
