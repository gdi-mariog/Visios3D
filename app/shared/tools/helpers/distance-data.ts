import EsriPoint from 'esri/geometry/Point';
import geometryEngine from 'esri/geometry/geometryEngine';
import Polyline from 'esri/geometry/Polyline';

export class DistanceData {

    private _distance3d = 0;
    private _distance2d = 0;
    private _heightDiff = 0;

    // TODO: Use ESRI Distance methods
    static calculate2dDistance(a: EsriPoint, b: EsriPoint): number {
        let polyline = new Polyline(
            {
                spatialReference: { wkid: 102100 },
                paths: [[
                    [a.x, a.y],
                    [b.x, b.y]]
                ]
            });

        return geometryEngine.geodesicLength(polyline, 'meters');
    }

    static calculate3dDistance(a: EsriPoint, b: EsriPoint): number {
        return Math.sqrt(Math.pow(this.calculate2dDistance(a, b), 2) + Math.pow(this.calculateHeightDiff(a,b), 2));
    }

    static calculateHeightDiff(a: EsriPoint, b: EsriPoint): number {
        return b.z - a.z;
    }

    constructor(distance3d: number, distance2d: number, heightDiff: number) {
        this._distance3d = distance3d;
        this._distance2d = distance2d;
        this._heightDiff = heightDiff;
    }

    get Distance3d(): number {
        return this._distance3d;
    }
    get Distance2d(): number {
        return this._distance2d;
    }

    get HeightDiff(): number {
        return this._heightDiff;
    }

    incrementDistance2d(dist: number): void {
        this._distance2d += dist;
    }

    incrementDistance3d(dist: number): void {
        this._distance3d += dist;
    }

    incrementHeightDiff(diff: number): void {
        this._heightDiff += diff;
    }

}
