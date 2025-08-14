import { ILiteEvent, LiteEvent } from '../../LiteEvent';
import EsriCircle from 'esri/geometry/Circle';
import Graphic from 'esri/Graphic';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import EsriPoint from 'esri/geometry/Point';
import { Point } from './point';

export class Circle {
    private readonly onRemoveFromGraphicsLayer = new LiteEvent<Circle>();

    private circle: EsriCircle;
    private graphic: Graphic;
    private graphicsLayer: GraphicsLayer;
    private symbol: SimpleFillSymbol;
    private _locked;
    private radius: any;

    constructor(graphicsLayer: GraphicsLayer, symbol: SimpleFillSymbol, radius) {
        this.symbol = symbol;
        this.graphicsLayer = graphicsLayer;
        this.radius = radius;
        this._locked = false;
    }

    get RemovedFromGraphicsLayer(): ILiteEvent<Circle> {
        return this.onRemoveFromGraphicsLayer.expose();
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

    addCircle(point: Point): void {
        if (this._locked) {
            console.error('Circle is locked, no more circles can be added', this);
            return;
        }

        this.circle = new EsriCircle({
            radius: this.radius,
            center: point.MapPoint
        });

        point.addToGraphicsLayer();
        this.addToGraphicsLayer();
    }

    addToGraphicsLayer(): void {
        this.circle.hasZ = false;
        this.graphic = new Graphic({
            geometry: this.circle,
            symbol: this.symbol
        });
        this.graphicsLayer.add(this.graphic);
    }

    get isLocked(): boolean {
        return this._locked;
    }

    get EsriCircle(): EsriCircle {
        return this.circle;
    }

    lock(): void {
        this._locked = true;
    }
}