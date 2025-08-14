import { Injectable } from '@angular/core';

import Graphic from 'esri/Graphic';
import PointSymbol3D from 'esri/symbols/PointSymbol3D';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import Query from 'esri/tasks/support/Query';
import EsriPoint from 'esri/geometry/Point';
import SceneView from 'esri/views/SceneView';

import { AppConfigService } from '../services/appconfig.service';
import { MapService } from '../services/map.service';
import { ViewService } from '../services/view.service';
import { Polygon } from './helpers/polygon';
import { Circle } from './helpers/circle';
import { Tool } from './tool';
import { ToolMode } from './helpers/tool-mode';
import { AnalysisOperation } from './helpers/analysis-operation';
import { Point } from './helpers/point';
import { GeometryService } from '../services/geometry.service';

class OutFieldsWLabel {
    private fields: string[];
    private label: string;

    constructor(fields: string[], label: string) {
        this.fields = fields;
        this.label = label;
    }

    public addField(field: string): void {
        this.fields.push(field);
    }

    get Fields(): string[] {
        return this.fields;
    }

    get Label(): string {
        return this.label;
    }
}

class HighlightedGraphic {
    private graphic: Graphic;
    highlight: any;
    private id: number;
    private data: Map<string, string>; // Label - Value
    private dataArray: string[][];
    private layerView: any;

    constructor(id: number, graphic: Graphic, highlight: Object, data: Map<string, string>, layerView: any) {
        this.id = id;
        this.graphic = graphic;
        this.highlight = highlight;
        this.data = data;
        this.dataArray = Array.from(data);
        this.layerView = layerView;
    }

    get Graphic(): Graphic {
        return this.graphic;
    }

    get Id(): number {
        return this.id;
    }

    get Highlight(): any {
        return this.highlight;
    }

    get Data(): Map<string, string> {
        return this.data;
    }

    get DataArray(): string[][] {
        return this.dataArray;
    }

    get LayerView(): any {
        return this.layerView;
    }
}

@Injectable()
export class SelectTool extends Tool {

    // Tool output
    private _highlightedGraphics: HighlightedGraphic[] = [];

    // Analysis
    private _enabledAnalysisOperations: AnalysisOperation[] = []; // CFG
    private _activeAnalysisOperation: AnalysisOperation;
    private _operationalLabels: string[];
    private _activeOperationalLabel: string;
    private _analysisResult: number = 0;

    // Visuals
    private polygonSymbol: SimpleFillSymbol; // CFG
    private pointSymbol: PointSymbol3D; // CFG
    private circleSymbol: SimpleFillSymbol;
    private highlightFillOpacity: number; // CFG
    private higlightHaloOpacity: number; //CFG

    // Polygon used for selection
    private selectionPolygon: Polygon;

    // Circle used for selection
    private selectionCircle: Circle;
    circleRadius: Number;

    // OutFields
    private outFieldsWLabels: OutFieldsWLabel[];
    private outFields: string[]; // Microoptimization, so we don't have to remap outFieldsWLabels all the time when used in queries

    constructor(
        private mapService: MapService,
        private geoService: GeometryService,
        private viewService: ViewService,
        private appCfg: AppConfigService) {

        super('Select', [ToolMode.Multiple, ToolMode.Polygon, ToolMode.Circle], mapService);

        // Pull symbols from cfg
        this.polygonSymbol = this.appCfg.SelectToolPolygonSymbol;
        this.pointSymbol = this.appCfg.SelectToolPointSymbol;
        this.circleSymbol = this.appCfg.SelectToolCircleSymbol;
        // Pull highlight opacity from cfg (highlight color is pulled in viewService when initializing view)
        this.highlightFillOpacity = this.appCfg.ViewHighlightFillOpacity;
        this.higlightHaloOpacity = this.appCfg.ViewHighlightHaloOpacity;

        // Set enabled operations from cfg
        this.appCfg.SelectToolAnalysisOperations.forEach(operationStr => this._enabledAnalysisOperations.push(operationStr as AnalysisOperation));
        // Set active operation to the first one that's enabled
        this.ActiveAnalysisOperation = this.EnabledAnalysisOperations[0];

        // Fill outFieldsWLabels and outFields
        this.buildOutFields();

        this._operationalLabels = this.appCfg.SelectToolAnalysisOperationalLabels;
        this.ActiveOperationalLabel = this.OperationalLabels[0];

        this.circleRadius = this.appCfg.InitialCircleRadius;
    }

    // Group fields by label
    buildOutFields(): void {
        let cfgOutFields = this.appCfg.SelectToolOutFields;

        // Microoptimization
        this.outFields = cfgOutFields.map(fieldLabelPair => fieldLabelPair[0]);

        // Get labels and filter unique
        let labels = cfgOutFields.map(fieldLabelPair => {
            return fieldLabelPair[1] ? fieldLabelPair[1] : fieldLabelPair[0]; // No label was set so we're using field as label
        }).filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        });

        this.outFieldsWLabels = [];
        labels.forEach(label => {
            let outFieldsWithLabel = new OutFieldsWLabel([], label);

            cfgOutFields.forEach(fieldLabelPair => {
                if (fieldLabelPair[1] == label && fieldLabelPair[1] != null) {
                    outFieldsWithLabel.addField(fieldLabelPair[0]);
                } else if (fieldLabelPair[0] == label) { // No label was set so we're using field as label
                    outFieldsWithLabel.addField(fieldLabelPair[0]);
                }
            });

            this.outFieldsWLabels.push(outFieldsWithLabel);
        });
    }

    onViewLeftClick(clickEvent: __esri.SceneViewClickEvent): void {

        // We don't want to do anything when tool's graphics layer is not visible
        if (!this.graphicsLayer.visible) {
            return;
        }

        // When we're in multiple select mode, we want 
        if (this.CurActiveMode === ToolMode.Multiple) {
            this.hitTestForGraphic(clickEvent);
        } else if (this.CurActiveMode === ToolMode.Polygon) {
            this.polygonAddPoint(clickEvent.mapPoint);

        } else if (this.CurActiveMode === ToolMode.Circle) {
            if (this.selectionCircle != null) {
                return;
            }
            this.circleAddPoint(clickEvent.mapPoint);

            this.mapService.Map.layers.forEach(layer => {
                if (layer.visible) {
                    if ((layer as any).layers) {
                        // HACK: as any
                        (layer as any).layers.forEach(item => {
                            this.queryLayerForCircleGraphic(item);
                        });
                    } else {
                        this.queryLayerForCircleGraphic(layer);
                    }
                }
            });
        }
    }

    onViewLeftDoubleClick(clickEvent: __esri.SceneViewDoubleClickEvent): void {
        if (this.CurActiveMode === ToolMode.Polygon && !this.selectionPolygon.isLocked) {
            this.polygonAddPoint(clickEvent.mapPoint);
            this.selectionPolygon.lock();

            this.mapService.Map.layers.forEach(layer => {
                if (layer.visible) {
                    if ((layer as any).layers) {
                        // HACK: as any
                        (layer as any).layers.forEach(item => {
                            this.queryLayerForPolygonGraphic(item);
                        });
                    } else {
                        this.queryLayerForPolygonGraphic(layer);
                    }
                }
            });
        }
    }

    private queryLayer(layer: any, query): void {

        if (layer.type === 'scene' && layer.visible === true) {
            layer.queryFeatures(query).then(response => {

                if (response.features.length != 0) {

                    response.features.forEach(graphic => {

                        this.viewService.View.whenLayerView(graphic.layer).then(layerView => {

                            let graphicIdField = Object.keys(graphic.attributes)[0];
                            let graphicIdValue = graphic.attributes[graphicIdField];

                            let alreadyHighlighted = this.findIfAlreadyHiglighted(graphicIdValue);
                            if (alreadyHighlighted != null) {
                                this.removeHighlightedGraphic(alreadyHighlighted);
                                this.updateAnalysisResult();
                                return;
                            }

                            const responseData = graphic.attributes;

                            let data = new Map<string, string>();

                            this.outFieldsWLabels.forEach(outFieldsWLabel => {
                                outFieldsWLabel.Fields.forEach(field => {
                                    if (responseData[field] != null) {
                                        data.set(outFieldsWLabel.Label, responseData[field]);
                                        return;
                                    }
                                });
                            });

                            let highlightedGraphic = new HighlightedGraphic(graphicIdValue, graphic, (layerView as any).highlight(graphic), data, layerView);
                            this._highlightedGraphics.push(highlightedGraphic);
                            this.updateAnalysisResult();

                        }, error => { console.error(error) });
                    });
                }
            }).catch(err => { console.error(err) });
        }
    }

    private queryLayerForPolygonGraphic(layer: any): void {

        if (typeof layer.createQuery === 'function') {
            var query1 = layer.createQuery();
            query1.geometry = this.selectionPolygon.EsriPolygon;
            query1.outFields = ['*'];

            this.queryLayer(layer, query1);
        }
    }

    private queryLayerForCircleGraphic(layer: any): void {

        if (typeof layer.createQuery === 'function') {
            var query1 = layer.createQuery();
            query1.geometry = this.selectionCircle.EsriCircle;
            query1.outFields = ['*'];

            this.queryLayer(layer, query1);
        }
    }

    private polygonAddPoint(mapPoint: EsriPoint): void {
        let polygon: Polygon;

        if (this.selectionPolygon == null) {
            polygon = new Polygon(this.graphicsLayer, this.polygonSymbol);
            this.selectionPolygon = polygon;
        } else {
            polygon = this.selectionPolygon;
        }

        const pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol);
        polygon.RemovedFromGraphicsLayer.on(() => pt.removeFromGraphicsLayer());
        polygon.addPoint(pt, true);
    }

    private circleAddPoint(mapPoint: EsriPoint): void {

        let circle = new Circle(this.graphicsLayer, this.circleSymbol, this.circleRadius);
        this.selectionCircle = circle;

        const pt = new Point(this.geoService, this.graphicsLayer, mapPoint, this.pointSymbol);
        circle.RemovedFromGraphicsLayer.on(() => pt.removeFromGraphicsLayer());
        circle.addCircle(pt);
    }

    // Checks if click was on a graphic
    hitTestForGraphic(clickEvent: __esri.SceneViewClickEvent): void {

        this.View.hitTest(clickEvent).then(response => {

            if (response.results[0]) {
                let graphic = response.results[0].graphic;
                // We only want to highlight graphics in scene and feature layers
                // Can be done for Stream, CSV and Graphics layers too
                if (graphic.layer.type == "scene" || graphic.layer.type == "feature") {
                    this.highlightGraphic(graphic);
                } else {
                    return;
                }
            }

        }).catch(err => {
            console.error(err);
            return;
        });
    }

    highlightGraphic(graphic: Graphic): void {
        this.View.whenLayerView(graphic.layer).then(layerView => {

            let graphicIdField = Object.keys(graphic.attributes)[0];
            let graphicIdValue = graphic.attributes[graphicIdField];

            if (graphicIdValue == null) {
                console.warn('Graphic cannot be highlighted because id is null.');
                return;
            }

            // Stream layer doesnt have queryFeatures method
            if (graphic.layer.type === 'stream') {
                console.warn('Cannot get attributes from stream layer.');
                return;
            }

            let alreadyHighlighted = this.findIfAlreadyHiglighted(graphicIdValue);
            if (alreadyHighlighted != null) {
                this.removeHighlightedGraphic(alreadyHighlighted);
                this.updateAnalysisResult();
                return;
            }

            console.error(graphicIdValue);

            if (typeof (layerView as any).createQuery === 'function') {
                console.log((layerView as any).availableFields);
                var query1 = (layerView as any).createQuery();
                query1.objectIds = [graphicIdValue];
                query1.outFields = ['*'];


                (layerView as any).layer.queryFeatures(query1).then(response => {

                    // We always click on 1 feature
                    const responseData = response.features[0].attributes;

                    let data = new Map<string, string>();

                    this.outFieldsWLabels.forEach(outFieldsWLabel => {
                        outFieldsWLabel.Fields.forEach(field => {
                            if (responseData[field] != null) {
                                data.set(outFieldsWLabel.Label, responseData[field]);
                                return;
                            }
                        });
                    });

                    let highlightedGraphic = new HighlightedGraphic(graphicIdValue, graphic, (layerView as any).highlight(graphic), data, layerView);
                    this._highlightedGraphics.push(highlightedGraphic);
                    this.updateAnalysisResult();
                });
            }
        }, error => { console.error(error) }).catch(err => {
            console.error(err);
        });
    }

    findIfAlreadyHiglighted(graphicId: number): HighlightedGraphic {

        for (let i = 0; i < this._highlightedGraphics.length; i++) {
            if (this._highlightedGraphics[i].Id == graphicId) {
                return this._highlightedGraphics[i];
            }
        }

        return null;
    }

    removeHighlightedGraphic(highlighted: HighlightedGraphic): void {
        highlighted.Highlight.remove();
        const indexToRemove = this._highlightedGraphics.indexOf(highlighted);
        this._highlightedGraphics.splice(indexToRemove, 1);
    }

    updateAnalysisResult(): void {
        
        if (this.ActiveAnalysisOperation == AnalysisOperation.Sum) {
            this._analysisResult = 0;
            for (let i = 0; i < this._highlightedGraphics.length; i++) {
                const hG = this._highlightedGraphics[i];
                if (hG.Data.get(this._activeOperationalLabel)) {
                    this._analysisResult += +hG.Data.get(this._activeOperationalLabel);
                }
            }
        } else if (this.ActiveAnalysisOperation == AnalysisOperation.Avg) {
            this._analysisResult = 0;
            for (let i = 0; i < this._highlightedGraphics.length; i++) {
                const hG = this._highlightedGraphics[i];
                if (hG.Data.get(this._activeOperationalLabel)) {
                    this._analysisResult += +hG.Data.get(this._activeOperationalLabel);
                } 
            }
            this._analysisResult = this._analysisResult / this._highlightedGraphics.length;
        } else if (this.ActiveAnalysisOperation == AnalysisOperation.Min) {
            this._analysisResult = 0;
            const validGraphicsValues = this._highlightedGraphics
                .filter(x => x.Data.get(this._activeOperationalLabel) != null)
                .map(y => Number(y.Data.get(this._activeOperationalLabel)));

            this._analysisResult = Math.min(...validGraphicsValues);
        } else if (this.ActiveAnalysisOperation == AnalysisOperation.Max) {
            this._analysisResult = 0;
            const validGraphicsValues = this._highlightedGraphics
                .filter(x => x.Data.get(this._activeOperationalLabel) != null)
                .map(y => Number(y.Data.get(this._activeOperationalLabel)));

            this._analysisResult = Math.max(...validGraphicsValues);
        }
    }

    // Shortcut for this.viewService.View
    get View(): SceneView {
        return this.viewService.View;
    }

    // Analysis getters/setters
    get EnabledAnalysisOperations(): AnalysisOperation[] {
        return this._enabledAnalysisOperations;
    }

    get ActiveAnalysisOperation(): AnalysisOperation {
        return this._activeAnalysisOperation;
    }

    set ActiveAnalysisOperation(operation: AnalysisOperation) {
        this._activeAnalysisOperation = operation;
    }

    get AnalysisResult(): number {
        return this._analysisResult;
    }
    get OperationalLabels(): string[] {
        return this._operationalLabels;
    }

    get ActiveOperationalLabel(): string {
        return this._activeOperationalLabel;
    }

    set ActiveOperationalLabel(lbl: string) {
        this._activeOperationalLabel = lbl;
    }

    // UI Bindings
    get HighlightedGraphics(): HighlightedGraphic[] {
        return this._highlightedGraphics;
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

    clear(): void {
        this._analysisResult = 0;
        this.selectionPolygon = null;
        this.selectionCircle = null;
        this.graphicsLayer.removeAll();
        this.removeAllHighlights();
    }

    removeAllHighlights(): void {
        this.graphicsLayer.removeAll();
        this._highlightedGraphics.forEach(gr => gr.Highlight.remove());
        this._highlightedGraphics = [];
    }

    // Override Hidden setter because we also want to change highlight opacity
    set Hidden(value: boolean) {
        this.graphicsLayer.visible = !value;

        if (!this.graphicsLayer.visible) {
            this.viewService.View.highlightOptions.fillOpacity = 0;
            this.viewService.View.highlightOptions.haloOpacity = 0;
        } else {
            this.viewService.View.highlightOptions.fillOpacity = this.higlightHaloOpacity;
            this.viewService.View.highlightOptions.haloOpacity = this.higlightHaloOpacity;
        }
    }

    get Hidden(): boolean {
        return !this.graphicsLayer.visible;
    }
}
