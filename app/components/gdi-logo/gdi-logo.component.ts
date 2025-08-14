import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '../../shared/services/appconfig.service';

@Component({
  moduleId: module.id,  
  selector: 'gdi-logo',
  templateUrl: './gdi-logo.component.html',
  styleUrls: ['./gdi-logo.component.css']
})
export class GdiLogoComponent implements OnInit {

    constructor(public appCfg: AppConfigService) { }

  ngOnInit(): void {}

}
