import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";

// @ts-ignore
export abstract class ResourceBase<T> {
  protected constructor(protected readonly http_: HttpClient) {
  }
}

@Injectable()
export abstract class NamespacedResourceService<T> extends ResourceBase<T> {
  abstract get(endpoint: string, name?: string, namespace?: string, params?: HttpParams): Observable<T>;
}
