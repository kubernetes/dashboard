import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {LoginStatus} from '@api/backendapi';
import {Observable} from 'rxjs';
import {first, switchMap} from 'rxjs/operators';
import {AuthService} from '../global/authentication';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService_: AuthService, private readonly router_: Router) {}

  canActivate(): Observable<boolean|UrlTree> {
    return this.authService_.getLoginStatus()
        .pipe(first())
        .pipe(switchMap<LoginStatus, boolean>((loginStatus: LoginStatus) => {
          if (!this.authService_.isAuthenticated(loginStatus)) {
            return this.router_.navigate(['login']);
          }
          return Observable.of(true);
        }))
        .catch(() => {
          return this.router_.navigate(['login']);
        });
  }
}