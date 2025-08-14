import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ButtonToggleComponent } from './components/button-toggle/button-toggle.component';
import { GdiLogoComponent } from './components/gdi-logo/gdi-logo.component';
import { HeaderComponent } from './components/header/header.component';
import { ModalComponent } from './components/modal/modal.component';
import { ToolDescriptionComponent } from './components/tool-description/tool-description.component';
import { PanelComponent } from './components/panels/panel/panel.component';
import { PanelsComponent } from './components/panels/panels.component';
import { ToolOutputComponent } from './components/tool-output/tool-output.component';
import { UiComponent } from './components/ui/ui.component';
import { ViewComponent } from './components/view/view.component';
import { ToolManager } from './shared/managers/tool.manager';
import { UIManager } from './shared/managers/ui.manager';
import { AppConfigService } from './shared/services/appconfig.service';
import { MapService } from './shared/services/map.service';
import { ViewService } from './shared/services/view.service';
import { DrawTool } from './shared/tools/draw.tool';
import { MeasureTool } from './shared/tools/measure.tool';
import { SelectTool } from './shared/tools/select.tool';
import { TabsComponent } from './components/tabs/tabs.component';
import { TabComponent } from './components/tabs/tab/tab.component';
import { GeometryService } from './shared/services/geometry.service';
import { UrlHandlerService } from './shared/services/urlhandler.service';
import { HttpClientService } from './shared/services/httpclient.service';

export function initializeMap(config: AppConfigService, viewService: ViewService, mapService: MapService): () => Promise<void> {
    return () => config.load().then(() => { try { mapService.load(); viewService.load(); } catch (ex) { console.error(ex); } }).catch(err => { console.error(err); });
}

// TODO: Separate
@NgModule({
    bootstrap: [
        AppComponent
    ],
    declarations: [
        AppComponent,
        HeaderComponent,
        ViewComponent,
        UiComponent,
        PanelsComponent,
        PanelComponent,
        ToolOutputComponent,
        ButtonToggleComponent,
        ModalComponent,
        GdiLogoComponent,
        TabsComponent,
        TabComponent,
        ToolDescriptionComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        HttpModule,
        FormsModule
    ],
    providers: [
        UrlHandlerService,
        HttpClientService,
        ViewService,
        AppConfigService,
        MapService,
        {
            provide: APP_INITIALIZER, useFactory: initializeMap,
            deps: [AppConfigService, ViewService, MapService], multi: true
        },
        DrawTool,
        UIManager,
        ToolManager,
        MeasureTool,
        SelectTool,
        GeometryService
    ]
})

export class AppModule { }
