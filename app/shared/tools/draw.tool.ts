import { Injectable } from '@angular/core';
import EsriPoint from 'esri/geometry/Point';
import LineSymbol3D from 'esri/symbols/LineSymbol3D';
import PointSymbol3D from 'esri/symbols/PointSymbol3D';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import Polyline from 'esri/geometry/Polyline';
import Graphic from 'esri/Graphic';

import { MapService } from '../services/map.service';
import { AppConfigService } from '../services/appconfig.service';
import { Polygon } from './helpers/polygon';
import { Line } from './helpers/line';
import { Point } from './helpers/point';
import { Symbols } from './helpers/symbols';
import { ToolMode } from './helpers/tool-mode';
import { Tool } from './tool';
import { GeometryService } from '../services/geometry.service';

@Injectable()
export class DrawTool extends Tool {

    private pointSymbol: PointSymbol3D;
    private lineSymbol: LineSymbol3D;
    private polygonSymbol: SimpleFillSymbol;

    private _lineModeOutput: Line[] = [];
    private _polygonModeOutput: Polygon[] = [];

    constructor(private appCfg: AppConfigService, private geoService: GeometryService, private mapService: MapService) {
        super('Draw', [ToolMode.Point, ToolMode.Line, ToolMode.Polygon], mapService);

        this.pointSymbol = this.appCfg.DrawToolPointSymbol;
        this.lineSymbol = this.appCfg.DrawToolLineSymbol;
        this.polygonSymbol = this.appCfg.DrawToolPolygonSymbol;
    }

    onViewLeftClick(clickEvent: __esri.SceneViewClickEvent): void {

        // We don't want to do anything when tool's graphics layer is not visible
        if (!this.graphicsLayer.visible) {
            return;
        }

        const mapPoint = clickEvent.mapPoint;

        if (this.CurActiveMode === ToolMode.Point) {
            this.pointModeAddPoint(mapPoint);

        } else if (this.CurActiveMode === ToolMode.Line) {
            this.lineModeAddPoint(mapPoint);

        } else if (this.CurActiveMode === ToolMode.Polygon) {
            this.polygonModeAddPoint(mapPoint);
        }
    }

    onViewLeftDoubleClick(clickEvent: __esri.SceneViewDoubleClickEvent): void {

        // We don't want to do anything when tool's graphics layer is not visible
        if (!this.graphicsLayer.visible) {
            return;
        }

        if (this.CurActiveMode === ToolMode.Line) {
            if (!this.LastLine.isLocked) {
                this.LastLine.lock();
            }

        } else if (this.CurActiveMode === ToolMode.Polygon) {
            if (!this.LastPolygon.isLocked) {
                this.LastPolygon.lock();
            }
        }
    }

    clear(): void {
        this.graphicsLayer.removeAll();
        this._lineModeOutput = [];
        this._polygonModeOutput = [];
    }

    get CurActiveMode(): ToolMode {
        return this._curActiveMode;
    }

    set CurActiveMode(toolMode: ToolMode) {
        const validToolMode = super.isValidToolMode(toolMode);

        if (validToolMode) {

            this._curActiveMode = toolMode;
            if (this._curActiveMode === ToolMode.Line) {

            }
        } else {
            throw new RangeError('Invalid tool mode!');
        }
    }

    get Hidden(): boolean {
        return !this.graphicsLayer.visible;
    }

    set Hidden(value: boolean) {
        this.graphicsLayer.visible = !value;
    }

    private get LastLine(): Line {
        return this._lineModeOutput[this._lineModeOutput.length - 1];
    }

    private get LastPolygon(): Polygon {
        return this._polygonModeOutput[this._polygonModeOutput.length - 1];
    }

    private pointModeAddPoint(mapPoint: EsriPoint): void {

        let pt: Point;
        pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol);

        // Add point to layer
        pt.addToGraphicsLayer();
    }

    private lineModeAddPoint(mapPoint: EsriPoint): void {
        let line;

        // If we don't have a line yet we need to start drawing new one
        if (!this.LastLine) {
            line = new Line(this.graphicsLayer, this.lineSymbol);

            this._lineModeOutput.push(line);
        } else { // We're gonna add point to the last line
            line = this.LastLine;
        }

        const pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol);
        line.RemovedFromGraphicsLayer.on(() => pt.removeFromGraphicsLayer());
        line.addPoint(pt, true);
    }

    private polygonModeAddPoint(mapPoint: EsriPoint): void {
        let polygon;

        if (!this.LastPolygon) {
            polygon = new Polygon(this.graphicsLayer, this.polygonSymbol);

            this._polygonModeOutput.push(polygon);
        } else {
            polygon = this.LastPolygon;
        }

        const pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol);
        polygon.RemovedFromGraphicsLayer.on(() => pt.removeFromGraphicsLayer());
        polygon.addPoint(pt, true);
    }
}
