import { Component, EventEmitter, HostBinding, HostListener, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'button-toggle',
    template: '<ng-content></ng-content>',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./button-toggle.component.css']
})

export class ButtonToggleComponent {

    private _active = false;

    @Input()
    @HostBinding('attr.active')
    set active(value: boolean) {
        this._active = value;
    }

    get active(): boolean {
        return this._active;
    }

}
