import { Component, ElementRef, HostBinding, AfterViewInit, ViewEncapsulation, ViewChild } from '@angular/core';

import { ToolManager } from '../../shared/managers/tool.manager';
import { UIManager } from '../../shared/managers/ui.manager';
import { AppConfigService } from '../../shared/services/appconfig.service';

@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    host: {
        class: 'theme-bg theme-text'
    }
})

export class HeaderComponent {

    @ViewChild('searchBarDiv') searchBarDivRef: ElementRef;

    constructor(public toolMgr: ToolManager, public uiMgr: UIManager, private elementRef: ElementRef, public appCfg: AppConfigService) { }

    ngAfterViewInit(): void {
        this.uiMgr.setHeaderPaddingToView(this.elementRef);
        this.uiMgr.initializeSearchBar(this.searchBarDivRef);
    }

    removeHtmlComments(html) {
        return html.replace(/<!--[\s\S]*?-->/g, '');
    }

    toggleBookmarksPanel(): void {
        this.uiMgr.toggleBookmarksPanel();
        this.toolMgr.clearActiveTool();
    }

    toggleTocPanel(): void {
        this.uiMgr.toggleTocPanel();
        this.toolMgr.clearActiveTool();
    }

    toggleBasemapPanel(): void {
        this.uiMgr.toggleBasemapPanel();
        this.toolMgr.clearActiveTool();
    }

    toggleMenuPanel(): void {
        this.uiMgr.toggleMenuPanel();
        this.toolMgr.clearActiveTool();
    }
}
