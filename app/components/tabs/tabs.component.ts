
import { Component, ViewEncapsulation } from '@angular/core';
import { TabComponent } from './tab/tab.component';
@Component({
    moduleId: module.id,
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./tabs.component.css']
})
export class TabsComponent {

    private tabs: TabComponent[] = [];

    constructor() {

    }

    get Tabs(): TabComponent[] {
        return this.tabs;
    }

    addTab(tab: TabComponent): void {
        if (this.tabs.length === 0)
            tab.active = true;

        this.tabs.push(tab);
    }

    selectTab(tab: TabComponent) {
        this.tabs.forEach((tab) => {
            tab.active = false;
        });
        tab.active = true;
    }

}
