import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import SpatialReference from 'esri/geometry/SpatialReference';

import { Symbols } from '../tools/helpers/symbols';
import LineSymbol3D from 'esri/symbols/LineSymbol3D';
import PointSymbol3D from 'esri/symbols/PointSymbol3D';
import SimpleFillSymbol from 'esri/symbols/SimpleFillSymbol';
import { Edges } from '../tools/helpers/edge';
import { HttpClientService } from './httpclient.service';

@Injectable()
export class AppConfigService {

    private config: Object;
    private readonly configPath: string = 'configuration/config.json';

    constructor(private http: HttpClientService) {

    }

    getConfig(key: string): any {

        return this.config[key];
    }

    getProxyUrl(): string {

        return this.config['proxyUrl'] as string;
    }

    getUrlPrefixes(): string[] {

        return this.config['urlPrefix'] as string[];
    }

    getSupportedLayerTypes(): Object {
        return this.config['supportedLayerTypes'].split(',');
    }

    getLayers(): any[] {
        return this.config['layers'];
    }

    getBuildingSceneLayers(): any[] {
        return this.config['buildingSceneLayers'];
    }

    getBookmarks(): Object {
        return this.config['bookmarks'];
    }

    getWelcomeModalActive(): boolean {
        return this.config['showWelcomeModal'] == true ? true : false;
    }

    getShowBookmarksPanel(): boolean {
        return this.config['showBookmarksPanel'] == true ? true : false;
    }

    getShowSliceWidget(): boolean {
        return this.config['showSliceWidget'] == true ? true : false;
    }

    getshowBuildingExplorerWidget(): boolean {
        return this.config['showBuildingExplorerWidget'] == true ? true : false;
    }

    getshowLineOfSightWidget(): boolean {
        return this.config['showLineOfSightWidget'] == true ? true : false;
    }

    getshowElevationProfileWidget(): boolean {
        return this.config['showElevationProfileWidget'] == true ? true : false;
    }

    getshowTableOfContent(): boolean {
        return this.config['tocPanelActive'] == true ? true : false;
    }

    getElevationLayerUrls(): string[] {
        return this.config['elevationLayerUrls'] as string[];
    }

    load(): Promise<{}> {
        return new Promise((resolve, reject) => {

            let request: any;
            request = this.http.Get(this.configPath);
            request
                .map((res: any) => res.json())
                .catch((error: any) => {
                    resolve(error);

                    return Observable.throw(error.json().error || 'Server error');
                })
                .subscribe((responseData: any) => {
                    this.config = responseData;
                    resolve(true);
                });

        });

    }

    get PopupLockPosition(): string {
        return this.config['popupPosition'] as string;
    }

    // TODO: Deprecated, should be totally removed from the app
    get BgClass(): string {
        return 'theme-bg';
    }

    get TxtClass(): string {
        return 'theme-text';
    }

    get AppVersion(): string {
        return this.getConfig('appVersion');
    }

    // --- UI Content Configuration ---
    private title: string = "";
    get Title(): string {
        let propertyName = 'title';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.title == "") {
            this.title = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);
        }

        return this.title;
    }

    private subtitle: string = "";
    get Subtitle(): string {
        let propertyName = 'subtitle';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.subtitle == "") {
            this.subtitle = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);
        }

        return this.subtitle;
    }

    private tenantLogoUri: string = "";
    get TenantLogoUri(): string {
        let propertyName = 'tenantLogoUri';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.tenantLogoUri == "")
            this.tenantLogoUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.tenantLogoUri;
    }

    private gdiLogoUri: string = "";
    get GdiLogoUri(): string {
        let propertyName = 'gdiLogoUri';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.gdiLogoUri == "")
            this.gdiLogoUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.gdiLogoUri;
    }

    private modalFooterLeftDestination: string = "";
    get ModalFooterLeftDestination(): string {
        let propertyName = 'modalFooterLeftDestination';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.modalFooterLeftDestination == "")
            this.modalFooterLeftDestination = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.modalFooterLeftDestination;
    }

    private modalFooterLeftText = "";
    get ModalFooterLeftText(): string {
        let propertyName = 'modalFooterLeftText';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.modalFooterLeftText == "")
            this.modalFooterLeftText = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.modalFooterLeftText;
    }

    private modalFooterRightLogoUri: string = "";
    get ModalFooterRightLogoUri(): string {
        let propertyName = 'modalFooterRightLogoUri';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.modalFooterRightLogoUri == "")
            this.modalFooterRightLogoUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.modalFooterRightLogoUri;
    }

    private modalFooterRightDestination: string = "";
    get ModalFooterRightDestination(): string {
        let propertyName = 'modalFooterRightDestination';
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.modalFooterRightDestination == "")
            this.modalFooterRightDestination = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        return this.modalFooterRightDestination;
    }

    private helpModalContent: string = null; // Cache
    private helpModalContentUri: string = "";

    get HelpModalContent(): string {
        let propertyName = "helpModalContentUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.helpModalContentUri == "")
            this.helpModalContentUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.helpModalContent == null && this.helpModalContentUri != null) {
            let request = this.http.Get(this.helpModalContentUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading help modal content');
                })
                .subscribe((responseData: any) => {
                    this.helpModalContent = responseData;
                });
        }

        return this.helpModalContent;
    }

    private welcomeModalContent: string = null; // Cache
    private welcomeModalContentUri: string = "";

    get WelcomeModalContent(): string {
        let propertyName = "welcomeModalContentUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.welcomeModalContentUri == "")
            this.welcomeModalContentUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.welcomeModalContent == null && this.welcomeModalContentUri != null) {
            let request = this.http.Get(this.welcomeModalContentUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading welcome modal content');
                })
                .subscribe((responseData: any) => {
                    this.welcomeModalContent = responseData;
                });
        }

        return this.welcomeModalContent;
    }

    private aboutModalContent: string = null; // Cache
    private aboutModalContentUri: string = "";

    get AboutModalContent(): string {
        let propertyName = "aboutModalContentUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.aboutModalContentUri == "")
            this.aboutModalContentUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.aboutModalContent == null && this.aboutModalContentUri != null) {
            let request = this.http.Get(this.aboutModalContentUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.aboutModalContent = responseData;
                });
        }

        return this.aboutModalContent;
    }

    private releaseNotesModalContent: string = null; // Cache
    private releaseNotesModalContentUri: string = "";

    get ReleaseNotesModalContent(): string {
        let propertyName = "releaseNotesModalContentUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.releaseNotesModalContentUri == "")
            this.releaseNotesModalContentUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.releaseNotesModalContent == null && this.releaseNotesModalContentUri != null) {
            let request = this.http.Get(this.releaseNotesModalContentUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.releaseNotesModalContent = responseData;
                });
        }

        return this.releaseNotesModalContent;
    }

    private circleContent: string = null; // Cache
    private circleUri: string = "";

    get CircleContent(): string {
        let propertyName = "circleUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.circleUri == "")
            this.circleUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.circleContent == null && this.circleUri != null) {
            let request = this.http.Get(this.circleUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.circleContent = responseData;
                });
        }

        return this.circleContent;
    }

    private lineContent: string = null; // Cache
    private lineUri: string = "";

    get LineContent(): string {
        let propertyName = "lineUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.lineUri == "")
            this.lineUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.lineContent == null && this.lineUri != null) {
            let request = this.http.Get(this.lineUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.lineContent = responseData;
                });
        }

        return this.lineContent;
    }

    private multipleContent: string = null; // Cache
    private multipleUri: string = "";

    get MultipleContent(): string {
        let propertyName = "multipleUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.multipleUri == "")
            this.multipleUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.circleContent == null && this.multipleUri != null) {
            let request = this.http.Get(this.multipleUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.multipleContent = responseData;
                });
        }

        return this.multipleContent;
    }

    private pointContent: string = null; // Cache
    private pointUri: string = "";

    get PointContent(): string {
        let propertyName = "pointUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.pointUri == "")
            this.pointUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.circleContent == null && this.pointUri != null) {
            let request = this.http.Get(this.pointUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.pointContent = responseData;
                });
        }

        return this.pointContent;
    }

    private polygonContent: string = null; // Cache
    private polygonUri: string = "";

    get PolygonContent(): string {
        let propertyName = "polygonUri";
        let value = this.getConfig(propertyName) as string;
        let defaultValue = null;

        if (this.polygonUri == "")
            this.polygonUri = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue);

        if (this.circleContent == null && this.polygonUri != null) {
            let request = this.http.Get(this.polygonUri);

            request.map(res => res.text())
                .catch((error: any) => {
                    return Observable.throw(error.json().error || 'Server error loading about modal content');
                })
                .subscribe((responseData: any) => {
                    this.polygonContent = responseData;
                });
        }

        return this.polygonContent;
    }

    // --- View Configuration --- 
    private basemap: string = null;
    get Basemap(): string {

        if (this.basemap == null) {
            let propertyName = 'basemap';
            let value = this.getConfig(propertyName) as string;
            let validValues = ['streets', 'satellite', 'hybrid', 'topo', 'gray', 'dark-gray', 'oceans', 'national-geographic', 'terrain', 'osm', 'dark-gray-vector', 'gray-vector', 'streets-vector', 'topo-vector', 'streets-night-vector', 'streets-relief-vector', 'streets-navigation-vector'];
            let defaultValue = validValues[5];
            this.basemap = this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue, validValues);
        }

        return this.basemap;
    }

    get ViewLonLatElevation(): number[] {
        let val = this.getConfig('viewLonLatElevation') as number[];

        if (val != null)
            return val;
        else
            return [0, 0, 0];
    }

    get ViewHeadingTiltFov(): number[] {
        let val = this.getConfig('viewHeadingTiltFOV') as number[];

        if (val != null)
            return val;
        else
            return [0, 0, 55];
    }

    get ViewHighlightHaloOpacity(): number {
        let opacity = this.getConfig('viewHighlightHaloOpacity') as number;
        if (opacity == null)
            opacity = 0.4;

        return opacity;
    }

    get ViewHighlightFillOpacity(): number {
        let opacity = this.getConfig('viewHighlightFillOpacity') as number;

        if (opacity == null)
            opacity = 0.4;

        return opacity;
    }

    get ViewHighlightColor(): string {
        let color = this.getConfig('viewHighlightColor') as string;

        if (color == null)
            color = '#501236';

        return color;
    }

    // View graphics configuration
    get ViewQualityProfile(): "low" | "high" | "medium" {
        let propertyName = 'viewQualityProfile';
        let validValues = ["low", "high", "medium"];
        let defaultValue = validValues[1];
        let value = this.getConfig(propertyName) as string;

        return this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue, validValues) as "low" | "high" | "medium";
    }

    get AtmosphereEnabled(): boolean {
        let propertyName = "atmosphereEnabled";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    get AtmosphereQuality(): "low" | "high" {
        let propertyName = 'atmosphereQuality';
        let validValues = ["low", "high"];
        let defaultValue = validValues[1];
        let value = this.getConfig(propertyName) as string;

        return this.stringValidateAndReturnDefaultOrSpecified(propertyName, value, defaultValue, validValues) as "low" | "high";
    }

    get StarsEnabled(): boolean {
        let propertyName = "starsEnabled";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    get ShadowsEnabled(): boolean {
        let propertyName = "shadowsEnabled";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    get WaterReflection(): boolean {
        let propertyName = "waterReflection";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    get AmbientOcclusionEnabled(): boolean {
        let propertyName = "ambientOcclusionEnabled";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    get InitialDateTime(): Date {
        let dateTime = this.getConfig('initialDateTime');

        if (dateTime != null)
            return new Date(dateTime);
        else
            return new Date("October 16, 2017 13:00:00");
    }

    // --- Widgets ---
    get LayerListGoToFullExtentButtonsEnabled(): boolean {
        let propertyName = "layerListGoToFullExtentButtonsEnabled";
        let defaultValue = true;
        let setValue = this.getConfig(propertyName);

        return this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
    }

    // --- Geometry Service ---
    get GeometryServiceUrl(): string {
        return this.getConfig('geometryServiceUrl') as string;
    }

    private _projectionSpatialReference = null; // Cache
    get ProjectionSpatialReference(): SpatialReference {

        let wkId = this.getConfig('projectionSpatialReferenceWkid') as number;

        if (this._projectionSpatialReference == null) {
            this._projectionSpatialReference = new SpatialReference({
                wkid: wkId == null ? 4326 : wkId
            });
        }

        return this._projectionSpatialReference;
    }


    // --- Tools Enabled ---
    private measureToolEnabled: boolean = null;
    get MeasureToolEnabled(): boolean {
        let propertyName = "measureToolEnabled";
        let defaultValue = false;
        let setValue = this.getConfig(propertyName);

        if (this.measureToolEnabled == null) {
            this.measureToolEnabled = this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
        }

        return this.measureToolEnabled;
    }

    private drawToolEnabled: boolean = null;
    get DrawToolEnabled(): boolean {
        let propertyName = "drawToolEnabled";
        let defaultValue = false;
        let setValue = this.getConfig(propertyName);

        if (this.drawToolEnabled == null) {
            this.drawToolEnabled = this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
        }

        return this.drawToolEnabled;
    }

    private selectToolEnabled: boolean = null;
    get SelectToolEnabled(): boolean {
        let propertyName = "selectToolEnabled";
        let defaultValue = false;
        let setValue = this.getConfig(propertyName);

        if (this.selectToolEnabled == null) {
            this.selectToolEnabled = this.boolValidateAndReturnDefaultOrSpecified(propertyName, setValue, defaultValue);
        }

        return this.selectToolEnabled;
    }


    // --- Select Tool ---
    get SelectToolOutFields(): string[][] {
        let outFields = this.getConfig('selectToolOutFields');

        if (outFields == null) {
            outFields = ['*'];
        }

        return outFields;
    }

    get SelectToolAnalysisOperations(): string[] {
        let operations = this.getConfig('selectToolAnalysisOperations');
        if (operations != null)
            return operations;
        else
            return ['SUM'];
    }

    get SelectToolAnalysisOperationalLabels(): string[] {
        let fields = this.getConfig('selectToolAnalysisOperationalLabels');

        if (fields != null)
            return fields;
        else // when null is returned, selectTool won't filter with values from cfg
            return [];
    }

    get InitialCircleRadius(): any {
        return Number(this.config['initialCircleRadius']);
    }

    get MaxCircleRadius(): any {
        return Number(this.config['maxCircleRadius']);
    }

    get MinCircleRadius(): any {
        return Number(this.config['minCircleRadius']);
    }

    // --- Measure Tool ---
    get MeasureToolOutFields(): string[] {
        let outFields = this.getConfig('measureToolOutFields');

        if (outFields == null) {
            outFields = [];
        }

        return outFields;
    }


    // --- Tool Symbols ---
    // Measure tool
    get MeasureToolPointSymbol(): PointSymbol3D {
        let props = this.getConfig("measureToolPointSymbol");

        if (props != null) {
            let symbol = new PointSymbol3D(props);
            return symbol;
        } else {
            console.info("No measure tool point symbol set in cfg, returning default value", Symbols.measureToolPoint);
            return Symbols.measureToolPoint;
        }
    }
    get MeasureToolLineSymbol(): LineSymbol3D {
        let props = this.getConfig("measureToolLineSymbol");

        if (props != null) {
            let symbol = new LineSymbol3D(props);
            return symbol;
        } else {
            console.info("No measure tool line symbol set in cfg, returning default value", Symbols.measureToolLine);
            return Symbols.measureToolLine;
        }
    }
    // Draw tool
    get DrawToolPointSymbol(): PointSymbol3D {
        let props = this.getConfig("drawToolPointSymbol");

        if (props != null) {
            let symbol = new PointSymbol3D(props);
            return symbol;
        } else {
            console.info("No draw tool point symbol set in cfg, returning default value", Symbols.drawToolPoint);
            return Symbols.drawToolPoint;
        }
    }
    get DrawToolLineSymbol(): LineSymbol3D {
        let props = this.getConfig("drawToolLineSymbol");

        if (props != null) {
            let symbol = new LineSymbol3D(props);
            return symbol;
        } else {
            console.info("No draw tool line symbol set in cfg, returning default value", Symbols.drawToolLine);
            return Symbols.drawToolLine;
        }
    }
    get DrawToolPolygonSymbol(): SimpleFillSymbol {
        let props = this.getConfig("drawToolPolygonSymbol");

        if (props != null) {
            let symbol = new SimpleFillSymbol(props);
            return symbol;
        } else {
            console.info("No draw tool polygon symbol set in cfg, returning default value", Symbols.drawToolPolygon);
            return Symbols.drawToolPolygon;
        }
    }
    // Select tool
    get SelectToolPolygonSymbol(): SimpleFillSymbol {
        let props = this.getConfig("selectToolPolygonSymbol");

        if (props != null) {
            let symbol = new SimpleFillSymbol(props);
            return symbol;
        } else {
            console.info("No select tool polygon symbol set in cfg, returning default value", Symbols.selectToolPolygon);
            return Symbols.selectToolPolygon;
        }
    }
    get SelectToolPointSymbol(): PointSymbol3D {
        let props = this.getConfig("selectToolPointSymbol");

        if (props != null) {
            let symbol = new PointSymbol3D(props);
            return symbol;
        } else {
            console.info("No select tool point symbol set in cfg, returning default value", Symbols.selectToolPoint);
            return Symbols.selectToolPoint;
        }
    }
    get SelectToolCircleSymbol(): SimpleFillSymbol {
        let props = this.getConfig("selectToolCircleSymbol");

        if (props != null) {
            let symbol = new SimpleFillSymbol(props);
            return symbol;
        } else {
            console.info("No select tool circle symbol set in cfg, returning default value", Symbols.selectToolCircle);
            return Symbols.selectToolCircle;
        }
    }

    // --- Egdes ---
    get solidEdge(): Object {
        let props = this.getConfig("solidEdge");

        if (props != null) {
            let edge = props;
            return edge;
        } else {
            console.info("No solid edge set in cfg, returning default value", Edges.solidEdge);
            return Edges.solidEdge;
        }
    }
    get sketchEdge(): Object {
        let props = this.getConfig("sketchEdge");

        if (props != null) {
            let edge = props;
            return edge;
        } else {
            console.info("No sketch edge set in cfg, returning default value", Edges.sketchEdge);
            return Edges.sketchEdge;
        }
    }

    // --- Helpers ---
    private boolValidateAndReturnDefaultOrSpecified(propertyName: string, value: boolean, defaultValue: boolean): boolean {
        if (value != null && this.isBool(value)) {
            return value;
        }
        else if (value != null && !this.isBool(value)) {
            console.error("Invalid config.json value set for " + propertyName + ", not a boolean, default value will be used: " + defaultValue, value);
            return defaultValue;
        }
        else {
            console.log(propertyName + " not set in config.json, default value will be used: " + defaultValue);
            return defaultValue;
        }
    }

    private stringValidateAndReturnDefaultOrSpecified(propertyName: string, value: string, defaultValue: string, validValues?: string[]): string {
        if (value != null) {
            if (validValues && !(validValues.indexOf(value) > -1)) {
                console.error("Invalid value set for " + propertyName + " in config.json, valid values are: " + validValues + "\n Default value will be used: " + defaultValue, value);
                return defaultValue;
            } else if (typeof value !== 'string') {
                console.error("Invalid type of value set for " + propertyName + "in config.json, not a string, default value will be used: " + defaultValue, value);
                return defaultValue;
            } else {
                return value;
            }
        } else {
            console.log(propertyName + " not set in config.json, default value will be used: " + defaultValue);
            return defaultValue;
        }
    }

    private numberValidateAndReturnDefaultOrSpecified(propertyName: string, value: number, defaultValue: number, validValues?: number[]): number {
        if (value != null) {
            if (validValues && !(validValues.indexOf(value) > -1)) {
                console.error("Invalid value set for " + propertyName + " in config.json, valid values are: " + validValues + "\n Default value will be used: " + defaultValue, value);
                return defaultValue;
            } else if (typeof value !== 'number') {
                console.error("Invalid type of value set for " + propertyName + "in config.json, not a number, default value will be used: " + defaultValue, value);
                return defaultValue;
            } else {
                return value;
            }
        } else {
            console.log(propertyName + " not set in config.json, default value will be used: " + defaultValue);
            return defaultValue;
        }
    }

    private isBool(obj: any): boolean {
        if (typeof obj === "boolean" && (obj === false || obj === true))
            return true;
        else
            return false;
    }
}
