import { AppConfigService } from '../services/appconfig.service';
import { ViewService } from '../services/view.service';
import { Injectable } from '@angular/core';
import { UIManager } from './ui.manager';

import { DrawTool } from '../tools/draw.tool';
import { MeasureTool } from '../tools/measure.tool';
import { SelectTool } from '../tools/select.tool';
import { Tool } from '../tools/tool';

@Injectable()
export class ToolManager {

    private _activeTool: Tool = null;

    private _enabledTools: Tool[] = [];

    // TODO: measure tool shouldn't be public?
    constructor(private drawTool: DrawTool,
        private measureTool: MeasureTool,
        private selectTool: SelectTool,
        private uiMgr: UIManager,
        private viewService: ViewService,
        private appCfg: AppConfigService) {
        // TODO: IS THIS GHETTO?
        this.viewService.View.on('click', event => this.onViewLeftClick(event));
        this.viewService.View.on('double-click', event => this.onViewLeftDoubleClick(event));

        if (this.appCfg.DrawToolEnabled)
            this._enabledTools.push(this.drawTool);
        if (this.appCfg.MeasureToolEnabled)
            this._enabledTools.push(this.measureTool);
        if (this.appCfg.SelectToolEnabled)
            this._enabledTools.push(this.selectTool);
    }

    get ActiveTool(): Tool {
        return this._activeTool;
    }

    get Tools(): Tool[] {
        return this._enabledTools;
    }

    onViewLeftClick(event: __esri.SceneViewClickEvent): void {

        if (this._activeTool === this.drawTool) {
            event.stopPropagation();
            this.drawTool.onViewLeftClick(event);

        } else if (this._activeTool === this.measureTool) {
            event.stopPropagation();

            this.measureTool.onViewLeftClick(event);

        } else if (this._activeTool === this.selectTool) {
            event.stopPropagation();
            this.selectTool.onViewLeftClick(event);
        }
    }

    onViewLeftDoubleClick(clickEvent: __esri.SceneViewDoubleClickEvent): void {
        clickEvent.stopPropagation();

        if (this._activeTool === this.drawTool) {
            this.drawTool.onViewLeftDoubleClick(clickEvent);
        } else if (this._activeTool === this.measureTool) {
            this.measureTool.onViewLeftDoubleClick(clickEvent);
        } else if (this._activeTool === this.selectTool) {
            this.selectTool.onViewLeftDoubleClick(clickEvent);
        }
    }

    onToolButtonPressed(btnTool: Tool): void {
        this._activeTool = (btnTool === this._activeTool) ? null : btnTool;
        this.uiMgr.closeAllPanels();

        // Workaround for stopping popups if a tool is selected 
        if (this.ActiveTool == null) {
            this.viewService.View.map.layers.forEach((item: any) => {
                if (item.layers != null) {
                    item.layers.forEach(layer => {
                        if (layer.popupEnabled != null) {
                            layer.popupEnabled = true;
                        }
                    });
                } else if (item.popupEnabled != null) {
                    item.popupEnabled = true;
                }
            });
        } else {
            this.viewService.View.map.layers.forEach((item: any) => {
                if (item.layers != null) {
                    item.layers.forEach(layer => {
                        if (layer.popupEnabled != null) {
                            layer.popupEnabled = false;
                        }
                    });
                } else if (item.popupEnabled != null) {
                    item.popupEnabled = false;
                }
            });
        }
    }

    clearActiveTool(): void {
        this._activeTool = null;
    }

    get MeasureTool(): MeasureTool {
        return this.measureTool;
    }

    get SelectTool(): SelectTool {
        return this.selectTool;
    }

    get DrawTool(): DrawTool {
        return this.drawTool;
    }
}
