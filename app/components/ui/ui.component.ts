import { DistanceData } from '../../shared/tools/helpers/distance-data';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToolManager } from '../../shared/managers/tool.manager';
import { UIManager } from '../../shared/managers/ui.manager';
import { AppConfigService } from '../../shared/services/appconfig.service';
import { MapService, ILayerData } from '../../shared/services/map.service';
import { ViewService } from '../../shared/services/view.service';
import { ToolMode } from '../../shared/tools/helpers/tool-mode';
import { Point } from '../../shared/tools/helpers/point';
import { Title } from '@angular/platform-browser';
import { GeometryService } from '../../shared/services/geometry.service';

@Component({
    moduleId: module.id,
    selector: 'app-ui',
    templateUrl: './ui.component.html',
    styleUrls: ['./ui.component.css']
})

export class UiComponent implements OnInit {

    @ViewChild('layerListDiv') layerListDivRef: ElementRef;
    @ViewChild('legendDiv') legendDivRef: ElementRef;

    themeClasses = `${this.appCfg.BgClass} ${this.appCfg.TxtClass}`;

    private ToolMode = ToolMode;
    private maxRadius: Number;
    
    layerType: string;
    layerUrl: string;
    layerTitle: string;
    bookmarks: any;
    copyLink = false;
    slice = false;
    explorer = false;
    lineOfSight = false;
    elevationProfile = false;
    sceneLayers: any[];
    pointCloudLayers: any[];
    pointHelpHtml: string = null;
    lineHelpHtml: string = null;
    circleHelpHtml: string = null;
    polygonHelpHtml: string = null;
    multipleHelpHtml: string = null;
    showDiv: any;

    constructor(private titleSrvc: Title,
        private elRef: ElementRef,
        public geoService: GeometryService,
        public toolMgr: ToolManager,
        public appCfg: AppConfigService,
        public uiMgr: UIManager,
        public mapService: MapService,
        public viewService: ViewService) { }

    ngOnInit(): void {

        this.uiMgr.initializeTableOfContents(this.layerListDivRef, this.legendDivRef);
        if (this.appCfg.Title)
            this.titleSrvc.setTitle(this.appCfg.Title);
        this.maxRadius = this.appCfg.MaxCircleRadius;
        if (this.appCfg.getShowSliceWidget()) {
            this.viewService.View.ui.add("slice", "manual");
        }
        if (this.appCfg.getshowBuildingExplorerWidget()) {
            this.viewService.View.ui.add("explorer", "manual");
        }
        if (this.appCfg.getshowLineOfSightWidget()) {
            this.viewService.View.ui.add("LoS", "manual");
        }
        if (this.appCfg.getshowElevationProfileWidget()) {
            this.viewService.View.ui.add("Elevation", "manual");
        }
        this.viewService.View.ui.add("copy", "manual");
        this.viewService.View.ui.add("copy1", "top-left");
        this.bookmarks = this.appCfg.getBookmarks();
        this.sceneLayers = this.mapService.loadSceneLayersForPropertiesPanel();
        this.pointCloudLayers = this.mapService.loadPointCloudLayersForPropertiesPanel();
    }

    isPoint(item: Point | DistanceData): boolean {
        return item instanceof Point;
    }

    isSolidEdge(sceneLayer: ILayerData): boolean {
        if (sceneLayer.defaultEdge == "solid") {
            return true;
        }

        return false;
    }

    isSketchEdge(sceneLayer: ILayerData): boolean {
        if (sceneLayer.defaultEdge == "sketch") {
            return true;
        }

        return false;
    }

    isNoEdge(sceneLayer: ILayerData): boolean {
        if (sceneLayer.defaultEdge == "no-edge") {
            return true;
        }

        return false;
    }

    getDiv() {
        if (this.copyLink != false) {
            clearTimeout(this.showDiv);
            this.copyLink = false;
        }
        this.copyLink = true;
        this.showDiv = setTimeout(() => { this.copyLink = false; }, 1000);
    }

    getSliceWidget() {
        if (this.slice == false) {
            this.viewService.addSliceWidget();
            this.slice = true;
        } else {
            this.viewService.destroySliceWidget();
            this.slice = false;

        }
    }

    getBuildingExplorerWidget() {
        if (this.explorer == false) {
            this.viewService.addBuildingExplorerWidget();
            this.explorer = true;
        } else {
            this.viewService.destroyBuildingExplorerWidget();
            this.explorer = false;

        }
    }

    getLineOfSightWidget() {
        if (this.lineOfSight == false) {
            this.viewService.addLineOfSightWidget();
            this.lineOfSight = true;
        } else {
            this.viewService.destroyLineOfSightWidget();
            this.lineOfSight = false;

        }
    }

    getElevationProfileWidget() {
        if (this.elevationProfile == false) {
            this.viewService.addElevationProfileWidget();
            this.elevationProfile = true;
        } else {
            this.viewService.destroyElevationProfileWidget();
            this.elevationProfile = false;

        }
    }

    newLayer(): void {
        this.mapService.addLayerToMap(this.layerType, this.layerUrl, this.layerTitle);
    }

    removeHtmlComments(html) {
        return html.replace(/<!--[\s\S]*?-->/g, '');
    }

    focusOutFunction(event) {
        if ((this.toolMgr.ActiveTool as any).circleRadius > this.appCfg.MaxCircleRadius) {
            (this.toolMgr.ActiveTool as any).circleRadius = this.appCfg.MaxCircleRadius;
        }
        if ((this.toolMgr.ActiveTool as any).circleRadius < this.appCfg.MinCircleRadius) {
            (this.toolMgr.ActiveTool as any).circleRadius = this.appCfg.MinCircleRadius;
        }
    }

    removeHighlight(hGraphic: any): void {
        hGraphic.Highlight.remove();
    }

    addHighlight(hGraphic: any): void {
        hGraphic.highlight = hGraphic.LayerView.highlight(hGraphic.Graphic);
    }

    releaseNotesModal(): void {
        this.uiMgr.toggleHelpModal();
        this.uiMgr.toggleReleaseNotesModal();
    }

    getCircleContent(): any {
        if (this.circleHelpHtml == null) {
            this.circleHelpHtml = this.appCfg.CircleContent;
        }
        return this.circleHelpHtml;
    }

    getMultipleContent(): any {
        if (this.multipleHelpHtml == null) {
            this.multipleHelpHtml = this.appCfg.MultipleContent;
        }
        return this.multipleHelpHtml;
    }

    getPointContent(): any {
        if (this.pointHelpHtml == null) {
            this.pointHelpHtml = this.appCfg.PointContent;
        }
        return this.pointHelpHtml;
    }

    getPolygonContent(): any {
        if (this.polygonHelpHtml == null) {
            this.polygonHelpHtml = this.appCfg.PolygonContent;
        }
        return this.polygonHelpHtml;
    }

    getLineContent(): any {
        if (this.lineHelpHtml == null) {
            this.lineHelpHtml = this.appCfg.LineContent;
        }
        return this.lineHelpHtml;
    }

    addEdgeToLayer(scenelayer, edgeType) {
        this.mapService.changeEdgeOnSceneLayer(scenelayer, edgeType);
    }

    changePointCloudLayer(pointCloudLayer, value) {
        this.mapService.changePointSizeOnPointCloudLayer(pointCloudLayer, value);
    }

    changePointDensityCloudLayer(pointCloudLayer, value) {
        this.mapService.changePointDensityOnPointCloudLayer(pointCloudLayer, value);
    }

    goToBookmark(bookmark: any): void {
        (this.bookmarks as any).forEach(x => {
            if (x.name == bookmark.name) {
                x.selected = true;
            } else {
                x.selected = false;
            }
        });

        this.viewService.goToBookmark(bookmark);
    }

    getCamera(): any {
        const camera = this.viewService.View.camera.clone();

        if (window.location.href.includes("?")) {
            let url = window.location.href.split("?")[0] + '?x=' + camera.position.x + '&y=' + camera.position.y + '&z=' + camera.position.z + '&heading=' + camera.heading + '&tilt=' + camera.tilt + '&fov=' + camera.fov;
            this.copyToClipboard(url);
        } else {
            let url = window.location.href.split("#")[0] + '?x=' + camera.position.x + '&y=' + camera.position.y + '&z=' + camera.position.z + '&heading=' + camera.heading + '&tilt=' + camera.tilt + '&fov=' + camera.fov;
            this.copyToClipboard(url);
        };
        
    }

    copyToClipboard(record: any): void {
        var content = record;
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', content);
            e.preventDefault();
        });
        document.execCommand('copy');
        document.clear();
    }
}