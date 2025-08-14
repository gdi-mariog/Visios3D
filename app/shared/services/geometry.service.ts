import { Injectable } from '@angular/core';
import EsriGeometryService from 'esri/tasks/GeometryService';
import { AppConfigService } from './appconfig.service';
import SpatialReference from 'esri/geometry/SpatialReference';
import EsriPoint from 'esri/geometry/Point';
import Geometry from 'esri/geometry/Geometry';
import ProjectParameters from 'esri/tasks/support/ProjectParameters';
import { exception } from 'console';

@Injectable()
export class GeometryService {

    private geoService: EsriGeometryService;
    private projectionSpatialReference: SpatialReference;

    private _enabled: boolean;

    constructor(private appCfg: AppConfigService) {

        if (appCfg.GeometryServiceUrl != null && appCfg.ProjectionSpatialReference != null) {

            this.geoService = new EsriGeometryService({
                url: appCfg.GeometryServiceUrl
            });

            this._enabled = true;

        } else {
            console.warn('No geometry service url  or projectionSpatialReferenceWkid specified.');
            this._enabled = false;
        }

        this.projectionSpatialReference = appCfg.ProjectionSpatialReference;
    }

    get Enabled(): boolean {
        return this._enabled;
    }

    triggered: boolean = false;

    projectPoint(point: EsriPoint): IPromise<EsriPoint> {
        if (this.Enabled == false) {
            console.error("Geometry service url not set in config.json, can't project point.");
            return null;
        } else {
            return this.geoService.project(
                new ProjectParameters({
                    geometries: [point as any],
                    outSpatialReference: this.projectionSpatialReference,
                }))
                .then(r => {
                    return r[0] as EsriPoint;
                }).catch(e => {
                    console.error(e);

                    return null;
                });
        }
    }
}
