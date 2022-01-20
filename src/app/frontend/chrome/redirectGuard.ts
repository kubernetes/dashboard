import {Injectable, Component} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';

@Injectable()
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (route.params['redirect'] === 'true') {
      
      var regex = new RegExp('https://grafana-projet.([bcwl][a-z]{2,10}).had.enedis.fr/');
      if(regex.test(route.params['externalUrl'])){
        window.open(route.params['externalUrl'], '_blank');
      }
      else{
        alert("WARNING: Tentative d'open redirect.")
      }
    } else {
      if(route.params['externalUrl'] === "https://hadock.enedis.fr"){
        //setTimeout(() => {
        //  window.location.reload();
        //}, 100);
  
        this.router.navigate(['externalPage'], {
          queryParams: {url: route.params['externalUrl'], namespace: 'default'},
        });
      }
    }

    return true;
  }
}
