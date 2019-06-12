import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {NamespaceService} from "./namespace";
import {Observable} from "rxjs";

// @ts-ignore
export abstract class ResourceBase<T> {
  protected constructor(protected readonly http_: HttpClient) {
  }
}

@Injectable()
export class NamespacedResourceService<T> extends ResourceBase<T> {
  constructor(
    http: HttpClient,
    private readonly namespaceService_: NamespaceService
  ) {
    super(http);
  }

  private getNamespace_(): string {
    const currentNamespace = this.namespaceService_.current();
    return this.namespaceService_.isMultiNamespace(currentNamespace)
      ? ''
      : currentNamespace;
  }

  get(
    endpoint: string,
    name?: string,
    namespace?: string,
    params?: HttpParams
  ): Observable<T> {
    if (namespace) {
      endpoint = endpoint.replace(':namespace', namespace);
    } else {
      endpoint = endpoint.replace(':namespace', this.getNamespace_());
    }

    if (name) {
      endpoint = endpoint.replace(':name', name);
    }
    return this.http_.get<T>(endpoint, {params});
  }
}
