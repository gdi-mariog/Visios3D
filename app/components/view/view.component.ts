import { Component, ElementRef, OnInit } from '@angular/core';

import { ViewService } from '../../shared/services/view.service';
import { AppConfigService } from '../../shared/services/appconfig.service';

import { UIManager } from '../../shared/managers/ui.manager';

@Component({
  moduleId: module.id,
  selector: 'app-view',
  template: '',
  styles: [
    `:host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
    }`]
})

export class ViewComponent implements OnInit {

  constructor(private viewService: ViewService,
              private uiService: UIManager,
              private elementRef: ElementRef,
              private appCfg: AppConfigService) { }

  ngOnInit(): void {
      let view = this.viewService.View;
      view.container = this.elementRef.nativeElement;

      // Used for debugging information from view
      (window as any).view = view;
  }
}
