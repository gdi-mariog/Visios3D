import { Injectable } from '@angular/core';
import { Http } from '@angular/http';


@Injectable()
export class HttpClientService {
    url: any;

    constructor(private http: Http) {

       const x = window.location.origin + window.location.pathname;
       this.url = x.endsWith('/') ? x : x + '/';

    }

    Get(path): any {
        return this.http.get(this.url + path);
    }

}
