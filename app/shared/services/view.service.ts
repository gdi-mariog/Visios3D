import { Injectable } from '@angular/core';
import Color from 'esri/Color';
import EsriPoint from 'esri/geometry/Point';
import SceneView from 'esri/views/SceneView';
import Home from 'esri/widgets/Home';
import Slice from 'esri/widgets/Slice';
import BuildingExplorer from 'esri/widgets/BuildingExplorer';
import LineOfSight from 'esri/widgets/LineOfSight';
import ElevationProfile from 'esri/widgets/ElevationProfile';
import ElevationProfileLineGround from 'esri/widgets/ElevationProfile/ElevationProfileLineGround';
import ElevationProfileLineView from 'esri/widgets/ElevationProfile/ElevationProfileLineView';
import Extent from 'esri/geometry/Extent';
import Camera from 'esri/Camera';
import SpatialReference from 'esri/geometry/SpatialReference';
import { AppConfigService } from './appconfig.service';
import { MapService } from './map.service';
import { UrlHandlerService } from './urlhandler.service';
import Query from 'esri/tasks/support/Query';
import { forEach } from '@angular/router/src/utils/collection';


@Injectable()
export class ViewService {
    onViewInitialized: () => void;

    private _view: SceneView;
    sliceWidget = null;
    buildingExplorerWidget = null;
    lineOfSightWidget = null;
    elevationProfileWidget = null;
    url = window.location.href;
    private viewInitialized: boolean;
    constructor(private appCfg: AppConfigService,
        private mapService: MapService,
        private urlHandler: UrlHandlerService) { }

    urlParam(): Camera {

        let x1 = this.urlHandler.getQueryParam("x");
        let y1 = this.urlHandler.getQueryParam("y");
        let z1 = this.urlHandler.getQueryParam("z");
        let h1 = this.urlHandler.getQueryParam("heading");
        let t1 = this.urlHandler.getQueryParam("tilt");
        let f1 = this.urlHandler.getQueryParam("fov");

        const camera = new Camera({
            position: new EsriPoint({
                x: Number(x1),
                y: Number(y1),
                z: Number(z1),
                hasZ: true,
                spatialReference: new SpatialReference({ wkid: 102100 })
            }),

            heading: Number(h1),
            tilt: Number(t1),
            fov: Number(f1)
        });

        return camera;
    }

    load(): IPromise<any> {
        this._view = new SceneView({
            environment: {
                lighting: {
                    date: this.appCfg.InitialDateTime,
                    waterReflectionEnabled: this.appCfg.WaterReflection,
                    directShadowsEnabled: this.appCfg.ShadowsEnabled,
                    ambientOcclusionEnabled: this.appCfg.AmbientOcclusionEnabled,
                    cameraTrackingEnabled: true
                },

                atmosphereEnabled: this.appCfg.AtmosphereEnabled,
                starsEnabled: this.appCfg.StarsEnabled,
                atmosphere: {
                    quality: this.appCfg.AtmosphereQuality
                }
            },

            map: this.mapService.Map,

            qualityProfile: this.appCfg.ViewQualityProfile,

            highlightOptions: {
                color: new Color(this.appCfg.ViewHighlightColor),
                fillOpacity: this.appCfg.ViewHighlightFillOpacity,
                haloOpacity: this.appCfg.ViewHighlightHaloOpacity
            },

            ui: {
                components: ['attribution', 'navigation-toggle', 'compass', 'zoom'],
                padding: 0
            },

            padding: {
                left: 15,
                right: 15,
                top: 15,
                bottom: 0
            },
            popup: {
                dockOptions: {
                    position: this.appCfg.PopupLockPosition
                }
            }
        });// this.url.includes("?")

        if (this.urlHandler.getQueryParam("x") != null) {
            this._view.camera = this.urlParam();
        } else {
            this._view.camera = new Camera({
                position: new EsriPoint({
                    x: this.appCfg.ViewLonLatElevation[0],
                    y: this.appCfg.ViewLonLatElevation[1],
                    z: this.appCfg.ViewLonLatElevation[2],
                    hasZ: true
                }),

                heading: this.appCfg.ViewHeadingTiltFov[0],
                tilt: this.appCfg.ViewHeadingTiltFov[1],
                fov: this.appCfg.ViewHeadingTiltFov[2]
            });

        };

        // Add home widget
        this._view.ui.add(new Home({
            view: this._view
        }), 'top-left');

        this.viewInitialized = true;
        this.mapService.loadLayers();
        this.zoomToQueryObject();
        return this._view.when();
    }

    zoomToQueryObject(): any {
        //const mapServiceUrl = this.urlHandler.getQueryParam("queryService");
        const viewServiceUrl = this.urlHandler.getQueryParam("viewService");
        if (viewServiceUrl != null) {
            const key = this.urlHandler.getQueryParam("key");
            const value = this.urlHandler.getQueryParam("value");
            //let querytask = new QueryTask({
            //    url: mapServiceUrl
            //});
            //let query = new Query();
            //query.outFields = ["*"];
            //query.returnGeometry = true;
            //query.where = `${key}=${value}`;
            //querytask.executeForExtent(query).then((results) => {
            //    const extent = results.extent.clone();
            //    this.View.goTo(extent.expand(2.5));
            //    debugger;
            //    if (viewServiceUrl != null) {
            //        var layer = this.mapService.getLayerByUrl(viewServiceUrl);
            //        this.View.whenLayerView(layer).then((lyrView) => {
            //            debugger;
            //            console.log(lyrView);
            //            var highlight = (lyrView as any).highlight(Number(value));
            //            this.View.focus();
            //            this.View.on("blur", () => (highlight as any).remove());
            //        });
            //    };
            //});
            var layer = this.mapService.getLayerByUrl(viewServiceUrl);
            let query = new Query();
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.where = `${key}=${value}`;
            (layer as any).queryExtent(query).then((results) => {
                const extent = results.extent.clone();
                this.View.goTo(extent.expand(1.5));
            }).catch(err => {
                console.warn(err);
            });
            this.View.whenLayerView(layer).then((lyrView) => {
                console.log(lyrView);
                var highlight = (lyrView as any).highlight(Number(value));
                this.View.focus();
                this.View.on("blur", () => (highlight as any).remove());
            }).catch(err => {
                console.warn(err);
            });
        } else {
            console.error('...');
        }
    }

    get Month(): number {
        return this._view.environment.lighting.date.getMonth();
    }

    set Month(value: number) {
        const temp = this._view.environment.lighting.date;
        temp.setMonth(value);
        this._view.environment.lighting.date = temp;
    }

    get Hour(): number {
        return this._view.environment.lighting.date.getHours();
    }

    set Hour(value: number) {
        const temp = this._view.environment.lighting.date;
        temp.setHours(value);
        this._view.environment.lighting.date = temp;
    }

    get View(): SceneView {
        return this._view;
    }

    get DirectShadows(): boolean {
        return this._view.environment.lighting.directShadowsEnabled;
    }

    set DirectShadows(value: boolean) {
        this._view.environment.lighting.directShadowsEnabled = value;
    }

    goToPoint(long: number, lat: number) {
        let center = this._view.center.clone();
        center.latitude = lat;
        center.longitude = long;
        this._view.goTo(center);
    }

    goToPolyline(extent: Extent) {
        this._view.goTo({
            target: extent.clone().expand(1.5)
        });
    }

    addSliceWidget(): any {

        this.sliceWidget = new Slice({ view: this._view });
        this._view.ui.add(this.sliceWidget, 'top-left');
    }

    destroySliceWidget(): any {
        this.sliceWidget.destroy();
    }

    addBuildingExplorerWidget(): any {
        var buildingLayers = [];
        this.mapService.Map.allLayers.forEach(layer => {
            if (layer.type == "building-scene") {
                buildingLayers.push(layer);
            }
        });
        this.buildingExplorerWidget = new BuildingExplorer({ view: this._view, layers: buildingLayers });
        this._view.ui.add(this.buildingExplorerWidget, 'top-left');
    }

    destroyBuildingExplorerWidget(): any {
        this.buildingExplorerWidget.destroy();
    }

    addLineOfSightWidget(): any {

        this.lineOfSightWidget = new LineOfSight({ view: this._view });
        this._view.ui.add(this.lineOfSightWidget, 'top-left');
    }

    destroyLineOfSightWidget(): any {
        this.lineOfSightWidget.destroy();
    }

    addElevationProfileWidget(): any {

        this.elevationProfileWidget = new ElevationProfile({
            view: this._view,
            profiles: [
                 new ElevationProfileLineGround() // first profile line samples the ground elevation
            , 
                new ElevationProfileLineView() // second profile line samples the view and shows building profiles
            ],
            // hide the select button
            // this button can be displayed when there are polylines in the
            // scene to select and display the elevation profile for
            visibleElements: {
                selectButton: false
            }
        });
        this._view.ui.add(this.elevationProfileWidget, 'top-left');
    }

    destroyElevationProfileWidget(): any {
        this.elevationProfileWidget.destroy();
    }

    goToBookmark(bookmark: any) {
        const camera = new Camera({
            position: new EsriPoint({
                x: bookmark.viewLonLatElevation[0],
                y: bookmark.viewLonLatElevation[1],
                z: bookmark.viewLonLatElevation[2],
                hasZ: true
            }),

            heading: bookmark.viewHeadingTiltFOV[0],
            tilt: bookmark.viewHeadingTiltFOV[1],
            fov: bookmark.viewHeadingTiltFOV[2]
        });

        this.View.goTo(camera);
    }

    refresh(): any {
        var newCam = this.View.camera.clone();
        newCam.position.z = this.View.camera.position.z + 0.00001;
        this.View.camera = newCam;
    }
}
