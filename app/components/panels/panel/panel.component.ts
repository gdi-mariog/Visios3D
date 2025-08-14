import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class PanelComponent implements OnInit {

  @HostBinding('attr.active')
  private _active: boolean;

  @Output()
  private activeChange = new EventEmitter();

  @Input()
  private panelTitle: string;
  @Input()
  private icon: string;

  constructor() { }

  ngOnInit(): void { }

  private closePressed(): void {
    this._active = false;
  }

  @Input()
  get active(): boolean {
    return this._active;
  }

  set active(val: boolean) {
    this._active = val;
    this.activeChange.emit(this._active);
  }
}
