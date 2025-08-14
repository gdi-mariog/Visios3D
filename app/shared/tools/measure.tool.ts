import { Injectable } from '@angular/core';
import EsriPoint from 'esri/geometry/Point';
import Graphic from 'esri/Graphic';
import LineSymbol3D from 'esri/symbols/LineSymbol3D';
import PointSymbol3D from 'esri/symbols/PointSymbol3D';
import Query from 'esri/tasks/support/Query';

import { AppConfigService } from '../services/appconfig.service';
import { MapService } from '../services/map.service';
import { ViewService } from '../services/view.service';

import { Line } from './helpers/line';
import { Point } from './helpers/point';
import { ToolMode } from './helpers/tool-mode';
import { Tool } from './tool';
import { Symbols } from './helpers/symbols';
import { GeometryService } from '../services/geometry.service';

@Injectable()
export class MeasureTool extends Tool {
    private pointSymbol: PointSymbol3D;
    private lineSymbol: LineSymbol3D;

    private _pointModeOutput: Point[] = [];
    private _pointModeOutputReverse: Point[] = [];
    private _lineModeOutput: Line[] = [];

    private numPoints = 0; // Used for generating labels

    constructor(private mapService: MapService,
        private geoService: GeometryService,
        private viewService: ViewService,
        private appCfg: AppConfigService) {
        super('Measure', [ToolMode.Point, ToolMode.Line], mapService);
        this.pointSymbol = this.appCfg.MeasureToolPointSymbol;
        this.lineSymbol = this.appCfg.MeasureToolLineSymbol;
    }

    onViewLeftClick(clickEvent: __esri.SceneViewClickEvent): void {
        // We don't want to do anything when tool's graphics layer is not visible
        if (!this.graphicsLayer.visible) {
            return;
        }

        let mapPoint = clickEvent.mapPoint;

        let objectGraphic: Graphic = null;

        this.viewService.View.hitTest(clickEvent, { exclude: [this.viewService.View.graphics] }).then(response => {

            if (response.results[0]) {
                mapPoint = response.results[0].mapPoint;

                objectGraphic = response.results[0].graphic;
                let objId = null;

                for (var prop in objectGraphic.attributes) {
                    objId = objectGraphic.attributes[prop];
                    break;
                }

                this.viewService.View.whenLayerView(objectGraphic.layer).then(lyrView => {

                    let pt: Point;
                    if (this.CurActiveMode === ToolMode.Point) {
                        pt = this.pointModeAddPoint(mapPoint, objectGraphic);
                    } else if (this.CurActiveMode === ToolMode.Line) {
                        this.lineModeAddPoint(mapPoint);
                    }

                    if (typeof (lyrView as any).createQuery === 'function') {
                        console.log((lyrView as any).availableFields);
                        var query1 = (lyrView as any).createQuery();
                        query1.objectIds = [objId];
                        query1.outFields = ['*'];
                        query1.returnGeometry = false;

                        (lyrView as any).layer.queryFeatures(query1).then(response => {

                            objectGraphic.attributes = response.features[0].attributes;
                            pt.ObjectGraphic = objectGraphic;

                        }).catch(err => { console.error(err);})
                    };
                }).catch(err => {
                    console.error(err);
                });

            } else {
                if (this.CurActiveMode === ToolMode.Point) {
                    this.pointModeAddPoint(mapPoint);
                } else if (this.CurActiveMode === ToolMode.Line) {
                    this.lineModeAddPoint(mapPoint);
                }
            }
        }).catch(err => {
            console.error(err);
        });
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
        }
    }

    clear(): void {
        this.graphicsLayer.removeAll();
        this._lineModeOutput = [];
        this._pointModeOutput = [];
        this._pointModeOutputReverse = [];
        this.numPoints = 0;
    }

    get PointModeOutput(): Point[] {
        return this._pointModeOutput;
    }
    get PointModeOutputReverse(): Point[] {
        return this._pointModeOutputReverse;
    }
    get LineModeOutput(): Line[] {
        return this._lineModeOutput;
    }

    get CurActiveMode(): ToolMode {
        return this._curActiveMode;
    }

    set CurActiveMode(toolMode: ToolMode) {
        const validToolMode = super.isValidToolMode(toolMode);

        if (validToolMode) {
            this._curActiveMode = toolMode;
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

    private pointModeAddPoint(mapPoint: EsriPoint, objectGraphic?: Graphic): Point {
        let pt: Point;

        if (objectGraphic) { // If we got objectGraphic, get props to show from config
            const propsToShow: string[] = this.appCfg.MeasureToolOutFields;
            pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol, this.getPointLabel(), objectGraphic, propsToShow);
        } else {
            pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol, this.getPointLabel());
        }

        // Add to output
        const output = this._pointModeOutput;
        output.push(pt);
        this.updatePointModeOutputReverse();
        // Add point to layer
        pt.addToGraphicsLayer();
        // When point is removed from graphics layer, we want to remove it from output too
        pt.RemovedFromGraphicsLayer.on(point => {
            this.removeFromOutput(point, output);
            this.updatePointModeOutputReverse();
        });

        this.numPoints++;

        return pt;
    }

    private updatePointModeOutputReverse(): void {
        this._pointModeOutputReverse = this._pointModeOutput.slice(0).reverse();
    }

    private get LastLine(): Line {
        return this._lineModeOutput[this._lineModeOutput.length - 1];
    }

    private lineModeAddPoint(mapPoint: EsriPoint): void {
        let line;

        // If we don't have a line yet we need to start drawing new one
        if (!this.LastLine) {
            line = new Line(this.graphicsLayer, this.lineSymbol);

            line.RemovedFromGraphicsLayer.on(lne => {
                this.removeFromOutput(lne, this._lineModeOutput);
            });

            this._lineModeOutput.push(line);
        } else { // We're gonna add point to the last line
            line = this.LastLine;
        }

        const pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol, this.getPointLabel());
        line.RemovedFromGraphicsLayer.on(() => pt.removeFromGraphicsLayer());
        line.addPoint(pt, true);
        this.numPoints++;
    }

    private getPointLabel(): string {
        // ASCII Magic
        const letter = String.fromCharCode(this.numPoints % 25 + 65);
        const suffixNo = Math.floor(this.numPoints / 25) === 0 ? '' : Math.floor(this.numPoints / 25);

        // Returns A-Z then A1-Z1 then A2-Z2, etc..
        return letter + suffixNo;
    }

    // TODO: Its 1:30am, waaaay too late to figure what this means, fuck tslint
    // tslint:disable-next-line:function-over-method
    private removeFromOutput(item: Point | Line, output: (Point | Line)[]): void {
        const index = output.indexOf(item);
        output.splice(index, 1);
    }
}
