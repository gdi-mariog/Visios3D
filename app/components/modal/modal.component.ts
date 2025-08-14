import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { AppConfigService } from "../../shared/services/appconfig.service";

@Component({
  moduleId: module.id,  
  selector: 'modal',
  templateUrl: './modal.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  private _active: boolean;

  @Input()
  modalTitle: string;

  @Output()
  private activeChange = new EventEmitter();

  constructor(public appCfg: AppConfigService) { }

  ngOnInit(): void {
  }

  @Input()
  get active(): boolean {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
    this.activeChange.emit(this._active);
  }

  close(): void {
    this.active = false;
  }

}
