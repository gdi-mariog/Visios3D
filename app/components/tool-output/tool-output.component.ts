import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-tool-output',
  template: '<ng-content></ng-content>',
  styleUrls: ['./tool-output.component.css']
})
export class ToolOutputComponent implements OnInit {

  constructor() { }

  ngOnInit(): void { }

}
