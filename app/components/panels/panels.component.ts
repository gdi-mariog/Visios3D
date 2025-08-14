import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-panels',
  template: '<ng-content></ng-content>',
  styleUrls: ['./panels.component.css']
})
export class PanelsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

}
