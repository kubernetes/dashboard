import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ParamsService} from '../../common/services/global/params';
import {HttpClient} from '@angular/common/http';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'kd-extpage',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class ExtPageComponent implements OnInit {
  url: SafeResourceUrl;
  private query: string;
  resourceName: string;
  myTemplate: any = '';
  constructor(
    private readonly router_: Router,
    private readonly activatedRoute_: ActivatedRoute,
    private readonly paramsService_: ParamsService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {
    this.activatedRoute_.queryParams.subscribe(values => {
      this.query = values.url;
    });
  }

  ngOnInit(): void {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.query);
  }
}
