import { Injectable } from '@angular/core';

@Injectable()
export class UrlHandlerService {

    private _params: string[];

    constructor() {
        this._params = [];
        window.location.search.substr(1).split("&").forEach((item) => { this._params[item.split("=")[0]] = item.split("=")[1] });
    }

    getQueryParam(val): string {
        return this._params[val];
    }
}
