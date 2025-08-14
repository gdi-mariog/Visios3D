import { group, Injectable } from '@angular/core';

import { AppConfigService } from './appconfig.service';

import Basemap from 'esri/Basemap';
import Ground from 'esri/Ground';
import FeatureLayer from 'esri/layers/FeatureLayer';
import GroupLayer from 'esri/layers/GroupLayer';
import Layer from 'esri/layers/Layer';
import PopupTemplate from 'esri/PopupTemplate';
import FieldInfo from 'esri/popup/FieldInfo';
import SceneLayer from 'esri/layers/SceneLayer';
import IntegratedMeshLayer from 'esri/layers/IntegratedMeshLayer';
import WMSLayer from 'esri/layers/WMSLayer';
import WMTSLayer from 'esri/layers/WMTSLayer';
import Map from 'esri/Map';
import ElevationLayer from 'esri/layers/ElevationLayer';
import MeshSymbol3D from 'esri/symbols/MeshSymbol3D';
import MapImageLayer from 'esri/layers/MapImageLayer';
import VectorTileLayer from 'esri/layers/VectorTileLayer';
import ImageryTileLayer from 'esri/layers/ImageryTileLayer';
import BuildingSceneLayer from 'esri/layers/BuildingSceneLayer';
import TileLayer from 'esri/layers/TileLayer';
import PointCloudLayer from 'esri/layers/PointCloudLayer';
import SimpleRenderer from 'esri/renderers/SimpleRenderer';
import UniqueValueRenderer from 'esri/renderers/UniqueValueRenderer';
import ClassBreaksRenderer from 'esri/renderers/ClassBreaksRenderer';
import PointCloudRGBRenderer from 'esri/renderers/PointCloudRGBRenderer';
import RasterColormapRenderer from 'esri/renderers/RasterColormapRenderer';
import RasterShadedReliefRenderer from 'esri/renderers/RasterShadedReliefRenderer';
import RasterStretchRenderer from 'esri/renderers/RasterStretchRenderer';
import Query from 'esri/tasks/support/Query';
import { UrlHandlerService } from './urlhandler.service';
import Camera from 'esri/Camera';
import EsriPoint from 'esri/geometry/Point';
import UrlUtils from 'esri/core/urlUtils';
import EsriConfig from 'esri/config';
import { forEach } from '@angular/router/src/utils/collection';
import { layer } from 'esri/views/3d/support/LayerPerformanceInfo';

export interface IPopupTemplateConfigItem {
    label: string;
    format: object;
}

export interface ILayerData {
    url: string;
    title?: string;
    type?: string;
    layers?: ILayerData[];
    visible?: boolean;
    legendEnabled?: boolean;
    outFields?: string[];
    pointSizes?: Object;
    pointDensity?: Object;
    meshSymbol3d?: MeshSymbol3D;
    defaultEdge?: string;
    availableEdges?: string[];
    opacity?: number;
    listMode?: "show" | "hide" | "hide-children";
    renderer?: SimpleRenderer | UniqueValueRenderer | ClassBreaksRenderer | RasterStretchRenderer | RasterShadedReliefRenderer | RasterColormapRenderer;
    popupEnabled?: boolean;
    elevationInfo?: "on-the-ground" | "relative-to-ground" | "absolute-height" | "relative-to-scene";
    visibilityMode?: "independent" | "inherited" | "exclusive";
    popupDisplayFields?: Record<string, IPopupTemplateConfigItem>;
    showZoomToFullExtentButton?: boolean;
    solidEdge?: Object;
    sketchEdge?: Object;
    castShadows?: boolean;
    sublayers?: any;
}

@Injectable()
export class MapService {

    private _map: Map;
    private _basemapId: string;

    constructor(private appCfg: AppConfigService, private urlHandler: UrlHandlerService) { }

    load(): void {

        this._basemapId = this.appCfg.getConfig('basemap');

        this._map = new Map({
            basemap: Basemap.fromId(this.appCfg.getConfig('basemap'))
            //ground: 'world-elevation' as any as Ground
        });
    }

    get Map(): Map {
        return this._map;
    }

    loadLayers(): void {

        var urlPrefixes = this.appCfg.getUrlPrefixes();
        var proxyUrl = this.appCfg.getProxyUrl();
        urlPrefixes.forEach(urlPrefix => {
            UrlUtils.addProxyRule({
                urlPrefix: urlPrefix,
                proxyUrl: proxyUrl
            });
        });

        const layersArray: any = this.appCfg.getLayers();
        const layersFromSession: any = JSON.parse(sessionStorage.getItem('sessionLayers'));

        if (layersFromSession != null) {
            layersFromSession.forEach((layerData: ILayerData) => {
                const layer = this.createLayer(layerData);

                if (layer != null) {
                    this._map.add(layer);
                } else {
                    console.warn('Couldnt read layer from session!', layer);
                }
            });
        }

        layersArray.forEach((layerData: ILayerData) => {
            if (!layerData.layers) {
                const layer = this.createLayer(layerData);
                if (layer != null) {
                    this._map.add(layer);

                } else {
                    console.warn('Couldnt read layer from config!', layer);
                }

            } else if (Array.isArray(layerData.layers)) {

                const groupLayer = this.createGroupLayer(layerData);

                if (groupLayer != null) {
                    this._map.add(groupLayer);
                } else {
                    console.warn('Couldnt read group layer from config!');
                }
            }

        });
        const elevationLayerUrls: string[] = this.appCfg.getElevationLayerUrls();

        if (elevationLayerUrls != null) {
            elevationLayerUrls.forEach((item: string) => {
                this._map.ground.layers.push(new ElevationLayer({
                    url: item
                }));
            });
        }


    }

    loadSceneLayersForPropertiesPanel(): any[] {
        const layersArray: any = this.appCfg.getLayers();
        let sceneLayers = [];

        layersArray.forEach((layerData: ILayerData) => {
            if (!layerData.layers) {
                if (layerData.type == "SceneLayer") {
                    if (layerData.availableEdges != null) {
                        sceneLayers.push(layerData);
                    }
                }
            } else if (Array.isArray(layerData.layers)) {
                layerData.layers.forEach(layer => {
                    if (layer.type == "SceneLayer") {
                        if (layer.availableEdges != null) {
                            sceneLayers.push(layer);
                        }
                    }
                });
            } else {
                console.warn('Couldnt read layer from config!');
            }
        });
        return sceneLayers;
    }

    loadPointCloudLayersForPropertiesPanel(): any[] {
        const layersArray: any = this.appCfg.getLayers();
        let pointCloudLayers = [];
        layersArray.forEach((layerData: ILayerData) => {
            if (!layerData.layers) {
                if (layerData.type == "PointCloudLayer" && layerData.pointSizes != null || layerData.pointDensity != null) {
                    (layerData as any).label = layerData.title;
                    pointCloudLayers.push(layerData);
                }
            } else if (Array.isArray(layerData.layers)) {
                if (layerData.layers[0].type == "PointCloudLayer" && layerData.layers[0].pointSizes != null || layerData.layers[0].pointDensity != null) {
                    (layerData.layers[0] as any).label = layerData.title;
                    pointCloudLayers.push(layerData.layers[0]);
                }

            } else {
                console.warn('Couldnt read layer from config!');
            }
        });
        return pointCloudLayers;
    }

    // TODO Rework group layer
    createGroupLayer(groupLayerData: ILayerData): Layer {

        let groupLayer = new GroupLayer({
            visibilityMode: groupLayerData.visibilityMode != null ? groupLayerData.visibilityMode : 'independent',
            listMode: groupLayerData.listMode != null ? groupLayerData.listMode : "hide-children"
        });

        this.setUniversalLayerConfiguration(groupLayerData, groupLayer);

        if (Array.isArray(groupLayerData.layers)) {
            groupLayerData.layers.forEach(sublayerData => {

                // Group layer doesn't have legendEnabled property
                // But when it's set in config we'll use the value for all the layers that don't have this property specified
                if (groupLayerData.legendEnabled != null && sublayerData.legendEnabled == null) {
                    sublayerData.legendEnabled = groupLayerData.legendEnabled;
                }

                const tempLyr = this.createLayer(sublayerData);

                if (tempLyr != null) {
                    groupLayer.add(tempLyr);
                } else {
                    if (Array.isArray(sublayerData.layers)) {
                        var gSubLayer = this.createGroupLayer(sublayerData);
                        groupLayer.add(gSubLayer);
                    }
                    else {
                        console.warn('Couldnt read sublayer of group layer from config!');
                    }
                }
            });

            return groupLayer;
        } else {
            return null;
        }

    }

    createLayer(layerData: ILayerData): Layer {
        if (layerData.type == 'SceneLayer') {

            const sceneLayer = this.createSceneLayer(layerData);

            return sceneLayer;

        } else if (layerData.type == 'PointCloudLayer') {

            const pointcloudLayer = this.createPointCloudLayer(layerData);

            return pointcloudLayer;

        } else if (layerData.type == 'FeatureLayer') {

            const featureLayer = this.createFeatureLayer(layerData);

            return featureLayer;

        } else if (layerData.type == 'WMSLayer') {

            const wmsLayer = this.createWMSLayer(layerData);

            return wmsLayer;

        } else if (layerData.type == 'WMTSLayer') {

            const wmtsLayer = this.createWMTSLayer(layerData);

            return wmtsLayer;

        } else if (layerData.type == 'TileLayer') {

            let tileLayer = new TileLayer({
                url: layerData.url,
            });

            this.setUniversalLayerConfiguration(layerData, tileLayer);

            this.setLegendEnabledToLayer(tileLayer, layerData.legendEnabled);

            return tileLayer;

        } else if (layerData.type == 'MapImageLayer') {

            const mapImageLayer = this.createMapImageLayer(layerData);

            return mapImageLayer;

        } else if (layerData.type == 'VectorTileLayer') {

            const mapVectorLayer = this.createVectorTileLayer(layerData);

            return mapVectorLayer;

        } else if (layerData.type == 'ImageryTileLayer') {

            const mapImageTileLayer = this.createImageryTileLayer(layerData);

            return mapImageTileLayer;

        } else if (layerData.type == 'IntegratedMeshLayer') {

            const imLayer = this.createIntegratedMeshLayer(layerData);

            return imLayer;

        } else if (layerData.type == 'BuildingSceneLayer') {

            const bsLayer = this.createBuildingSceneLayer(layerData);

            return bsLayer;
        }


        return null;
    }

    addLayerToMap(layerType, layerUrl, layerTitle): void {

        const newLayerData: ILayerData = {
            type: layerType,
            url: layerUrl,
            title: layerTitle
        };
        const layer = this.createLayer(newLayerData);

        layer.load().then(res => {

            if (layer.type == 'wms' && (layer as WMSLayer).featureInfoFormat == null && (layer as WMSLayer).featureInfoUrl == null) {
                alert('Sloj nije moguće dodati na kartu. Krivi url ili tip sloja!');
                console.warn('Sloj nije moguće dodati na kartu. Krivi url ili tip sloja! Tip je WMS, ali URL nije!');
                return;
            }

            this._map.add(layer);
            this.saveDataToSessionStorage(newLayerData);

        }).catch(err => {
            alert('Sloj nije moguće dodati na kartu. Krivi url ili tip sloja!');
            console.warn(err);
        });
    }

    saveDataToSessionStorage(data): void {
        let sessionStorageLayers;

        if (sessionStorage.getItem('sessionLayers') === null) {
            sessionStorageLayers = [];
        } else {
            sessionStorageLayers = JSON.parse(sessionStorage.getItem('sessionLayers'));
        }

        sessionStorageLayers.push(data);
        sessionStorage.setItem('sessionLayers', JSON.stringify(sessionStorageLayers));
    }

    setUniversalLayerConfiguration(layerData: ILayerData, layer: Layer): void {

        if (layerData.title != null) {
            layer.title = layerData.title;
        }

        if (layerData.visible != null) {
            layer.visible = layerData.visible;
        }

        if (layerData.opacity != null) {
            layer.opacity = layerData.opacity;
        }

        if (layerData.listMode != null) {
            layer.listMode = layerData.listMode;
        }

        this.setShowFullExtentButtonToLayer(layer, layerData.showZoomToFullExtentButton);
    }

    createWMSLayer(layerData: ILayerData): WMSLayer {

        let wmsLayer = new WMSLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, wmsLayer);

        return wmsLayer;
    }

    createWMTSLayer(layerData: ILayerData): WMTSLayer {

        let wmtsLayer = new WMTSLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, wmtsLayer);

        return wmtsLayer;
    }

    createIntegratedMeshLayer(layerData: ILayerData): IntegratedMeshLayer {

        let imLayer = new IntegratedMeshLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, imLayer);

        return imLayer;
    }

    createBuildingSceneLayer(layerData: ILayerData): BuildingSceneLayer {

        let bsLayer = new BuildingSceneLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, bsLayer);

        return bsLayer;
    }

    createSceneLayer(layerData: ILayerData): SceneLayer {

        let sceneLayer = new SceneLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, sceneLayer);

        if (layerData.meshSymbol3d) {
            sceneLayer.renderer = new SimpleRenderer({
                symbol: layerData.meshSymbol3d
            });
        }

        this.setLegendEnabledToLayer(sceneLayer, layerData.legendEnabled);
        this.setPopupEnabledToLayer(sceneLayer, layerData.popupEnabled);
        this.addRendererToLayer(sceneLayer, layerData.renderer);
        this.setPopupDisplayFieldsToLayer(sceneLayer, layerData.popupDisplayFields);
        this.addDefaultEdgeToLayer(sceneLayer, layerData);
        if (layerData.castShadows == false) {
            this.removeShadowFromLayer(sceneLayer);
        }

        return sceneLayer;
    }

    createPointCloudLayer(layerData: ILayerData): PointCloudLayer {

        let rend = new PointCloudRGBRenderer({
            pointSizeAlgorithm: {
                type: "fixed-size",
                size: 5
            },
            pointsPerInch: 25,
            field: "RGB"
        });

        let pointCloudLayer = new PointCloudLayer({
            url: layerData.url,
            renderer: rend
        });

        this.setUniversalLayerConfiguration(layerData, pointCloudLayer);
        //this.setLegendEnabledToLayer(pointCloudLayer, layerData.legendEnabled);

        return pointCloudLayer;

    }

    createFeatureLayer(layerData: ILayerData): FeatureLayer {

        let featureLayer = new FeatureLayer({
            url: layerData.url
        });

        this.setUniversalLayerConfiguration(layerData, featureLayer);

        if (layerData.elevationInfo) {
            featureLayer.elevationInfo = {
                mode: layerData.elevationInfo
            };
        }

        this.setLegendEnabledToLayer(featureLayer, layerData.legendEnabled);
        this.setPopupEnabledToLayer(featureLayer, layerData.popupEnabled);
        this.addRendererToLayer(featureLayer, layerData.renderer);
        this.setPopupDisplayFieldsToLayer(featureLayer, layerData.popupDisplayFields);
        this.setOutFieldsToLayer(featureLayer, layerData.outFields);

        return featureLayer;
    }

    createMapImageLayer(layerData: ILayerData): MapImageLayer {

        let mapImageLayer = new MapImageLayer({
            url: layerData.url

        });
        if (layerData.sublayers != null)
            mapImageLayer.sublayers = layerData.sublayers;

        this.setUniversalLayerConfiguration(layerData, mapImageLayer);

        return mapImageLayer;
    }

    createVectorTileLayer(layerData: ILayerData): VectorTileLayer {

        let mapVectorLayer = new VectorTileLayer({
            url: layerData.url

        });

        this.setUniversalLayerConfiguration(layerData, mapVectorLayer);

        return mapVectorLayer;
    }

    createImageryTileLayer(layerData: ILayerData): ImageryTileLayer {

        let mapImageryLayer = new ImageryTileLayer({
            url: layerData.url

        });

        this.setUniversalLayerConfiguration(layerData, mapImageryLayer);

        this.setLegendEnabledToLayer(mapImageryLayer, layerData.legendEnabled);
        this.setPopupEnabledToLayer(mapImageryLayer, layerData.popupEnabled);
        this.addRendererToLayer(mapImageryLayer, layerData.renderer);
        this.setPopupDisplayFieldsToLayer(mapImageryLayer, layerData.popupDisplayFields);

        return mapImageryLayer;
    }

    getLayerByUrl(url: string): Layer {
        const x = this.Map.layers
            .map(x => { if (x.type == 'group') return (x as any).layers.items; else return x; })
            .reduce(function (prev, next) {
                return Array.isArray(prev) ? prev.concat(next) : [prev].concat(next)
            });
        //console.log(x);
        return x.find(l => { return l.url == url });
    }

    changeEdgeOnSceneLayer(scenelayer: ILayerData, edgeType): void {
        const layer: any = this.Map.layers
            .map(x => { if (x.type == 'group') return (x as any).layers.items; else return x; })
            .reduce(function (prev, next) {
                return Array.isArray(prev) ? prev.concat(next) : [prev].concat(next)
            })
            .find(l => { return l.title === scenelayer.title });

        switch (edgeType) {
            case ("solid"): {
                let solidRenderer = layer.renderer.clone();
                if (solidRenderer.type == "simple") {
                    solidRenderer.symbol.symbolLayers.getItemAt(0).edges = scenelayer.solidEdge != null ? scenelayer.solidEdge : this.appCfg.solidEdge;
                } else if (solidRenderer.type == "unique-value") {
                    solidRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = scenelayer.solidEdge != null ? scenelayer.solidEdge : this.appCfg.solidEdge;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = solidRenderer;
                break;
            }
            case ("sketch"): {
                let sketchRenderer = layer.renderer.clone();
                if (sketchRenderer.type == "simple") {
                    sketchRenderer.symbol.symbolLayers.getItemAt(0).edges = scenelayer.sketchEdge != null ? scenelayer.sketchEdge : this.appCfg.sketchEdge;
                } else if (sketchRenderer.type == "unique-value") {
                    sketchRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = scenelayer.sketchEdge != null ? scenelayer.sketchEdge : this.appCfg.sketchEdge;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = sketchRenderer;
                break;
            }
            default: {
                let noEdgeRenderer = layer.renderer.clone();
                if (noEdgeRenderer.type == "simple") {
                    noEdgeRenderer.symbol.symbolLayers.getItemAt(0).edges = null;
                } else if (noEdgeRenderer.type == "unique-value") {
                    noEdgeRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = null;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = noEdgeRenderer;
                break;
            }
        }
    }

    changePointSizeOnPointCloudLayer(pointCloudLayer: ILayerData, value): void {
        this.Map.layers.forEach(layer => {
            if (layer.type == 'group' && (layer as any).layers != null) {
                var isFound = false;
                var layers = [];
                (layer as any).layers.forEach(childLayer => {
                    if (childLayer.type == 'group' && (childLayer as any).layers != null) {
                        if (childLayer.layers != null) {
                            childLayer.layers.forEach(childChildLayer => {
                                if (childChildLayer.title == pointCloudLayer.title) {
                                    isFound = true;
                                }
                                layers.push(childChildLayer);
                            });
                        }
                    }
                    else if (childLayer.title === pointCloudLayer.title) {
                        isFound = true;
                        layers.push(childLayer);
                    }
                    else {
                        layers.push(childLayer);
                    }
                });
                if (isFound) {
                    layers.forEach(foundLayer => {
                        let pclRenderer = (foundLayer as any).renderer.clone();
                        pclRenderer.pointSizeAlgorithm.size = value;
                        (foundLayer as any).renderer = pclRenderer;
                    });
                }
            }
            else {
                if (layer.title === pointCloudLayer.title) {

                    let pclRenderer = (layer as any).renderer.clone();
                    pclRenderer.pointSizeAlgorithm.size = value;
                    (layer as any).renderer = pclRenderer;
                }
            }
        });
    }

    changePointDensityOnPointCloudLayer(pointCloudLayer: ILayerData, value): void {
        this.Map.layers.forEach(layer => {
            if (layer.type == 'group' && (layer as any).layers != null) {
                var isFound = false;
                var layers = [];
                (layer as any).layers.forEach(childLayer => {
                    if (childLayer.type == 'group' && (childLayer as any).layers != null) {
                        if (childLayer.layers != null) {
                            childLayer.layers.forEach(childChildLayer => {
                                if (childChildLayer.title == pointCloudLayer.title) {
                                    isFound = true;
                                }
                                layers.push(childChildLayer);
                            });
                        }
                    }
                    else if (childLayer.title === pointCloudLayer.title) {
                        isFound = true;
                        layers.push(childLayer);
                    }
                    else {
                        layers.push(childLayer);
                    }
                });
                if (isFound) {
                    layers.forEach(foundLayer => {
                        let pclRenderer = (foundLayer as any).renderer.clone();
                        pclRenderer.pointsPerInch = value;
                        (foundLayer as any).renderer = pclRenderer;
                    });
                }
            }
            else {
                if (layer.title === pointCloudLayer.title) {

                    let pclRenderer = (layer as any).renderer.clone();
                    pclRenderer.pointsPerInch = value;
                    (layer as any).renderer = pclRenderer;
                }
            }
        });
    }

    // Removed PointCloudLayer because it threw an error that it doesnt have legendEnabled property
    addRendererToLayer(layer: FeatureLayer | SceneLayer | ImageryTileLayer, renderer: SimpleRenderer | UniqueValueRenderer | ClassBreaksRenderer | RasterStretchRenderer | RasterShadedReliefRenderer | RasterColormapRenderer): void {
        // TODO: Renderers can be added to MapImage, CSV and Stream layers too
        // TODO: Check if object sent is actually a instance of renderer
        if (renderer != null)
            layer.renderer = renderer;
    }

    addDefaultEdgeToLayer(layer: SceneLayer, layerData: ILayerData): SceneLayer {

        const edgeType = layerData.defaultEdge;

        if (layer.renderer == null) {
            layer.on('layerview-create', (layerView) => {
                switch (edgeType) {
                    case ("solid"): {
                        let solidRenderer = (layer.renderer as any).clone();
                        if (solidRenderer.type == "simple") {
                            solidRenderer.symbol.symbolLayers.getItemAt(0).edges = layerData.solidEdge != null ? layerData.solidEdge : this.appCfg.solidEdge;
                        } else if (solidRenderer.type == "unique-value") {
                            solidRenderer.uniqueValueInfos.forEach(uvi => {
                                uvi.symbol.symbolLayers.getItemAt(0).edges = layerData.solidEdge != null ? layerData.solidEdge : this.appCfg.solidEdge;
                            });
                        } else {
                            console.error("Renderer type not supported");
                        }
                        layer.renderer = solidRenderer;
                        break;
                    }
                    case ("sketch"): {
                        let sketchRenderer = (layer.renderer as any).clone();
                        if (sketchRenderer.type == "simple") {
                            sketchRenderer.symbol.symbolLayers.getItemAt(0).edges = layerData.sketchEdge != null ? layerData.sketchEdge : this.appCfg.sketchEdge;
                        } else if (sketchRenderer.type == "unique-value") {
                            sketchRenderer.uniqueValueInfos.forEach(uvi => {
                                uvi.symbol.symbolLayers.getItemAt(0).edges = layerData.sketchEdge != null ? layerData.sketchEdge : this.appCfg.sketchEdge;
                            });
                        } else {
                            console.error("Renderer type not supported");
                        }
                        layer.renderer = sketchRenderer;
                        break;
                    }
                    default: {
                        let noEdgeRenderer = (layer.renderer as any).clone();
                        if (noEdgeRenderer.type == "simple") {
                            noEdgeRenderer.symbol.symbolLayers.getItemAt(0).edges = null;
                        } else if (noEdgeRenderer.type == "unique-value") {
                            noEdgeRenderer.uniqueValueInfos.forEach(uvi => {
                                uvi.symbol.symbolLayers.getItemAt(0).edges = null;
                            });
                        } else {
                            console.error("Renderer type not supported");
                        }
                        layer.renderer = noEdgeRenderer;
                        break;
                    }
                }
            });
            return layer;
        }

        switch (edgeType) {
            case ("solid"): {
                let solidRenderer = (layer.renderer as any).clone();
                if (solidRenderer.type == "simple") {
                    solidRenderer.symbol.symbolLayers.getItemAt(0).edges = this.appCfg.solidEdge;
                } else if (solidRenderer.type == "unique-value") {
                    solidRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = this.appCfg.solidEdge;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = solidRenderer;
                break;
            }
            case ("sketch"): {
                let sketchRenderer = (layer.renderer as any).clone();
                if (sketchRenderer.type == "simple") {
                    sketchRenderer.symbol.symbolLayers.getItemAt(0).edges = this.appCfg.sketchEdge;
                } else if (sketchRenderer.type == "unique-value") {
                    sketchRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = this.appCfg.sketchEdge;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = sketchRenderer;
                break;
            }
            default: {
                let noEdgeRenderer = (layer.renderer as any).clone();
                if (noEdgeRenderer.type == "simple") {
                    noEdgeRenderer.symbol.symbolLayers.getItemAt(0).edges = null;
                } else if (noEdgeRenderer.type == "unique-value") {
                    noEdgeRenderer.uniqueValueInfos.forEach(uvi => {
                        uvi.symbol.symbolLayers.getItemAt(0).edges = null;
                    });
                } else {
                    console.error("Renderer type not supported");
                }
                layer.renderer = noEdgeRenderer;
                break;
            }
        }

        return layer;
    }

    removeShadowFromLayer(layer: SceneLayer): void {
        if (layer.renderer == null) {
            layer.on('layerview-create', (layerView) => {
                let renderer = (layer.renderer as any).clone();
                renderer.symbol.symbolLayers.getItemAt(0).castShadows = false;
                layer.renderer = renderer;
            });

            return;
        }
        let renderer = (layer.renderer as any).clone();
        renderer.symbol.symbolLayers.getItemAt(0).castShadows = false;
        layer.renderer = renderer;

    }

    setLegendEnabledToLayer(layer: FeatureLayer | SceneLayer | TileLayer | ImageryTileLayer, enabled: boolean): void {
        // TODO: CSV, Stream, Sublayer, WMS, WMSSublayer have legend enabled property too

        if (enabled != null) {
            if (enabled == true || enabled == false)
                layer.legendEnabled = enabled;
            else
                console.error("Invalid value set for legend enabled for layer", enabled, layer);
        }
    }

    setShowFullExtentButtonToLayer(layer: Layer, show: boolean) {
        if (show != null) {
            if (show == true || show == false) {

            }
            else
                console.error("Invalid value set for showFullExtentButton on layer", show, layer);
        }
    }

    setPopupEnabledToLayer(layer: FeatureLayer | SceneLayer | ImageryTileLayer, enabled: boolean): void {
        // TODO: CSV, Imagery, Stream, WMSSublayer have popup enabled property too

        if (enabled != null) {
            if (enabled == true || enabled == false)
                layer.popupEnabled = enabled;
            else
                console.error("Invalid value set for popup enabled for layer", enabled, layer);
        }
    }

    // If poput out fields not set in cfg, loads template from server
    // If popup out fields set as popupOutFields = [["*"]] in config builds template from all fields on the layer
    // If fieldName-label pairs are set they are displayed, if only fieldName is set but not label, label will inherit the value from the fieldName
    // Examples: popupOutFields = [["height","Visina drveta"], ["width"]] -- height field will display as "Visina drveta" while width field will display as "width"
    setPopupDisplayFieldsToLayer(layer: FeatureLayer | SceneLayer | ImageryTileLayer, popupDisplayFields: Record<string, IPopupTemplateConfigItem>): void {
        // TODO: CSVLayer, Graphic, ImageryLayer, StreamLayer, Sublayer
        if (popupDisplayFields != null) {
            // When popupOutFields=["*"] in config.json, we want to build custom template

            // We need to wait for layer to be loaded from service then we can read its fields
            layer.when(loadedLayer => {
                loadedLayer.popupEnabled = true;
                // Create new popup template on layer
                loadedLayer.popupTemplate = new PopupTemplate({
                    title: loadedLayer.title,
                    content: [{
                        type: 'fields'
                    }]
                });
                // Clear fields that may already be on layer
                loadedLayer.popupTemplate.fieldInfos = [];
                // Set each field on layer to template
                Object.keys(popupDisplayFields)
                    .forEach(key => {
                    const fieldInfo = new FieldInfo({
                        fieldName: key,
                        label: popupDisplayFields[key].label != null ? popupDisplayFields[key].label : key,
                        format: popupDisplayFields[key].format,
                        visible: true
                    });
                    loadedLayer.popupTemplate.fieldInfos.push(fieldInfo);
                });
            }); // -- layer.when

        }

    }

    setOutFieldsToLayer(layer: FeatureLayer, outFields: string[]): void {
        // TODO CSVLayer, StreamLayer
        if (outFields != null) {
            layer.outFields = outFields;
        }
    }

    set BasemapId(id: string) {
        const bMap = Basemap.fromId(id);
        if (bMap) {
            this._basemapId = id;
            this._map.basemap = id as any as Basemap;
        } else {
            throw new RangeError(`${id} can't be set as basemap as it's not valid BasemapID`);
        }
    }

    get BasemapId(): string {
        return this._basemapId;
    }

    get VisibleLayers(): Layer[] {
        const visibleLayers: Layer[] = [];
        this._map.layers.forEach(item => {
            if (item.visible && item.type !== 'graphics' && this.appCfg.getLayers().find(x => x.title == item.title).showInOpacityTab != false) {
                visibleLayers.push(item);
            }
        });

        return visibleLayers;
    }

}

