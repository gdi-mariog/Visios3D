import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  moduleId: module.id,  
  selector: 'app-tool-description',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./tool-description.component.css']
})
export class ToolDescriptionComponent {


}