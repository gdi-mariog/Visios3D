
import { Component, Input, HostBinding, trigger, state, animate, style, transition } from '@angular/core';
import { TabsComponent } from '../tabs.component';

// TODO: import browseranimationsmodule for animations and this should animate, can add more animations afterwards
@Component({
    moduleId: module.id,
    selector: 'app-tab',
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [   // :enter is alias to 'void => *'
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 }))
            ]),
            transition(':leave', [   // :leave is alias to '* => void'
                animate('500ms', style({ opacity: 0 }))
            ])
        ])
    ],
    template: '<ng-content *ngIf="active" [@fadeInOut]></ng-content>',
    styleUrls: ['./tab.component.css']
})
export class TabComponent {

    @Input()
    private label: string;

    @HostBinding('attr.active')
    private _active = false;

    constructor(tabs: TabsComponent) {
        tabs.addTab(this);
    }misc

    @Input()
    get active(): boolean {
        return this._active
    }

    set active(value: boolean) {
        this._active = value;
    }
}
