import { ILiteEvent, LiteEvent } from '../../LiteEvent';
import EsriPolygon from 'esri/geometry/Polygon';
import Graphic from 'esri/Graphic';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import { Point } from './point';
import EsriPoint from 'esri/geometry/Point';

export class Polygon {
    private readonly onRemoveFromGraphicsLayer = new LiteEvent<Polygon>();

    private polygon: EsriPolygon;
    private graphic: Graphic;
    private graphicsLayer: GraphicsLayer;
    private symbol: SimpleFillSymbol;
    private _locked = false;
    private firstPoint: Point;

    constructor(graphicsLayer: GraphicsLayer, symbol: SimpleFillSymbol) {
        this.symbol = symbol;
        this.graphicsLayer = graphicsLayer;
        this.initializePolygon();
    }

    addPoint(point: Point, addToGraphicsLayer: boolean): void {
        if (this._locked) {
            console.error('Polygon is locked, no more points can be added', this);
            return;
        }
        if (this.polygon.rings[0].length === 0) {
            this.firstPoint = point;
        }
        this.polygon.insertPoint(0, this.polygon.rings[0].length, point.MapPoint);

        if (addToGraphicsLayer)
            point.addToGraphicsLayer();

        this.redrawPolygon();
    }

    get isLocked(): boolean {
        return this._locked;
    }

    get EsriPolygon(): EsriPolygon {
        return this.polygon;
    }

    lock(): void {
        this._locked = true;
    }

    get RemovedFromGraphicsLayer(): ILiteEvent<Polygon> {
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

    addToGraphicsLayer(): void {

        this.polygon.hasZ = false;
        this.graphic = new Graphic({
            geometry: this.polygon,
            symbol: this.symbol
        });
        this.graphicsLayer.add(this.graphic);
    }

    private initializePolygon(): void {
        const ring: number[][] = [];
        this.polygon = new EsriPolygon({ spatialReference: { wkid: 102100 } });
        this.polygon.addRing(ring);
    }

    private redrawPolygon(): void {
        this.copyFirstPointToLast();
        this.graphicsLayer.remove(this.graphic);
        this.addToGraphicsLayer();
        this.removeLastPointFromPolygon();
    }

    private copyFirstPointToLast(): void {
        this.polygon.insertPoint(0, this.polygon.rings[0].length, this.firstPoint.MapPoint);
    }

    private removeLastPointFromPolygon(): void {
        this.polygon.removePoint(0, this.polygon.rings[0].length - 1);
    }

    //private clockwiseSort(input: any[], basic: number, center: any): any[] {

    //    const base = Math.atan2(input[basic][1], input[basic][0]);

    //    return input.sort((a, b) => {
    //        return Math.atan2(b[1] - center[1], b[0] - center[0]) - Math.atan2(a[1] - center[1], a[0] - center[0])
    //            + (Math.atan2(b[1] - center[1], b[0] - center[0]) > base ? - Math.PI * 2 : 0) + (Math.atan2(a[1] - center[1],
    //                a[0] - center[0]) > base ? Math.PI * 2 : 0);
    //    });
    //}

    private getCenter(arr: any[]): any[] {
        let minX: number;
        let maxX: number;
        let minY: number;
        let maxY: number;

        for (const item of arr) {
            minX = (item[0] < minX || minX == null) ? item[0] : minX;
            maxX = (item[0] > maxX || maxX == null) ? item[0] : maxX;
            minY = (item[1] < minY || minY == null) ? item[1] : minY;
            maxY = (item[1] > maxY || maxY == null) ? item[1] : maxY;
        }

        return [(minX + maxX) / 2, (minY + maxY) / 2];
    }
}