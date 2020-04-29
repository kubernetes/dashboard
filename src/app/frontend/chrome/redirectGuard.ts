import {Injectable, Component} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (route.params['redirect'] === 'true') {
      window.location.href = route.params['externalUrl'];
    } else {
      setTimeout(() => {
        window.location.reload();
      }, 100);

      this.router.navigate(['externalPage'], {queryParams: {url: route.params['externalUrl']}});
    }

    return true;
  }
}
