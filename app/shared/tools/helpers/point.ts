import { ILiteEvent, LiteEvent } from '../../LiteEvent';
import EsriPoint from 'esri/geometry/Point';
import Graphic from 'esri/Graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import PointSymbol3D from 'esri/symbols/PointSymbol3D';
import { ViewService } from '../../services/view.service';
import TextSymbol3DLayer from 'esri/symbols/TextSymbol3DLayer';
import { GeometryService } from '../../services/geometry.service';

export class Point {

    private readonly onRemoveFromGraphicsLayer = new LiteEvent<Point>();

    private _mapPoint: EsriPoint;
    private _projectedMapPoint: IPromise<EsriPoint>;
    private _label: string;
    private _props: Map<string, string> = new Map<string, string>();
    private _propsArray: Array<Array<string>>;
    private _objectGraphic: Graphic;
    private _propsToShow: string[];

    private graphicsLayer: GraphicsLayer;
    private symbol: PointSymbol3D;

    private graphic: Graphic;

    constructor(private geoService: GeometryService, graphicsLayer: GraphicsLayer, mapPoint: EsriPoint,
        symbol?: PointSymbol3D, label?: string, objectGraphic?: Graphic, propsToShow?: string[]) {

        this.graphicsLayer = graphicsLayer;
        this._mapPoint = mapPoint;

        if (label && symbol) {
            this._label = label;
            // We got label, create unique symbol which will hold label text, use sent symbol as template
            this.createSymbolWithLabel(symbol);
        } else if (symbol) {
            this.symbol = symbol;
        }

        if (propsToShow) {
            this._propsToShow = propsToShow;
            this.initializeProperties(propsToShow, objectGraphic);
        }

        if (geoService.Enabled) {
            this._projectedMapPoint = this.geoService.projectPoint(this._mapPoint);
        }
    }

    // Subscribeable event
    get RemovedFromGraphicsLayer(): ILiteEvent<Point> {
        return this.onRemoveFromGraphicsLayer.expose();
    }

    get Props(): Map<string, string> {
        return this._props;
    }

    get PropsArray(): Array<Array<string>> {
            this._propsArray = Array.from(this._props);

        return this._propsArray;
    }

    get X(): number {
        return this._mapPoint.x;
    }

    get Y(): number {
        return this._mapPoint.y;
    }

    get Z(): number {
        return this._mapPoint.z;
    }

    get MapPoint(): EsriPoint {
        return this._mapPoint;
    }

    get ProjectedMapPoint(): IPromise<EsriPoint> {
        return this._projectedMapPoint
            .catch(err => {
                console.error(err); return null;
            });
    }

    get Label(): string {
        return this._label;
    }

    get Longitude(): number {
        return this._mapPoint.longitude;
    }

    get Latitude(): number {
        return this._mapPoint.latitude;
    }

    set ObjectGraphic(objGraphic: Graphic) {
        console.log("yolo2");
        if (this._propsToShow)
            this.initializeProperties(this._propsToShow, objGraphic);

    }

    addToGraphicsLayer(): void {
        if (this.symbol == null) {
            console.error('Point without symbol cant be added to graphics layer');
            return;
        }

        // Create new graphic if point doesn't have one already
        if (this.graphic == null) {
            this.graphic = new Graphic({
                geometry: this._mapPoint,
                symbol: this.symbol
            });
        }

        this.graphicsLayer.add(this.graphic);
    }

    removeFromGraphicsLayer(): void {
        if (this.graphic) {
            if (this.graphic.layer instanceof GraphicsLayer) {
                this.graphic.layer.remove(this.graphic);
                this.onRemoveFromGraphicsLayer.trigger(this);
            } else {
                console.error("Can't remove graphic from graphics layer if graphic is not added to layer", this);
            }
        } else
            console.error('No graphic to remove.', this);
    }

    private createSymbolWithLabel(symbolTemplate: PointSymbol3D): void {
        this.symbol = symbolTemplate.clone();
        // Symbol should have text layer to which we'll add label text
        const symbolTextLayer: TextSymbol3DLayer = this.symbol.symbolLayers.find(sLyr => sLyr.type === 'text') as TextSymbol3DLayer;
        if (symbolTextLayer) {
            symbolTextLayer.text = this._label;
        } else {
            console.error('Label cant be added to symbol without textLayer');
        }
    }

    private initializeProperties(propsToShow: string[], objectGraphic: Graphic): void {
        console.log("yolo");
        if (objectGraphic == null) {
            console.error('objectGraphic is null, cant initialize properties');
            return;
        }

        const attributes = objectGraphic.attributes;
        if (attributes == null) {
            console.error('objectGraphic has no attributes, cant initialize properties');
            return;
        }
        // Show all if *
        if (propsToShow[0] === "*") {
            for (var key in attributes) {
                this._props.set(key, attributes[key]);
            }
        } else {
            // OBJECTID is key
            propsToShow.forEach(key => {
                if (attributes[key]) {
                    this._props.set(key, attributes[key]);
                }
            });
        }
    }
}
