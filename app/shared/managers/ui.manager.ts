import { ElementRef, Injectable } from '@angular/core';
import SceneView from 'esri/views/SceneView';
import EsriLayerList from 'esri/widgets/LayerList';
import Legend from 'esri/widgets/Legend';
import Search from 'esri/widgets/Search';
import Extent from 'esri/geometry/Extent';

import { ViewService } from '../services/view.service';
import { AppConfigService } from '../services/appconfig.service';

@Injectable()
export class UIManager {

    tocPanelActive: Boolean = false;
    basemapPanelActive: Boolean = false;
    settingsPanelActive: Boolean = false;
    infoModalActive: Boolean = false;
    helpModalActive: Boolean = false;
    newLayerPanelActive: Boolean = false;
    welcomeModalActive: Boolean = true;
    releaseNotesModalActive: Boolean = false;
    toolDescriptionActive: Boolean = true;
    bookmarksPanelActive: Boolean = true;
    menuPanelActive: Boolean = false;




    private layerList: EsriLayerList;
    private legend: Legend;
    private searchBar: Search;

    constructor(public readonly vSrvc: ViewService, private readonly appCfg: AppConfigService) {
        this.welcomeModalActive = this.appCfg.getWelcomeModalActive();
        this.bookmarksPanelActive = this.appCfg.getShowBookmarksPanel();
        this.tocPanelActive = this.appCfg.getshowTableOfContent();
    }

    setHeaderPaddingToView(headerRef: ElementRef): void {
        const padding = this.vSrvc.View.padding;

        if (headerRef)
            padding.top = headerRef.nativeElement.offsetHeight + 15;

        this.vSrvc.View.padding = padding;
    }

    toggleTocPanel(): void {
        this.tocPanelActive = !this.tocPanelActive;
        this.basemapPanelActive = false;
        this.settingsPanelActive = false;
        this.newLayerPanelActive = false;
        this.bookmarksPanelActive = false;
        this.menuPanelActive = false;
    }

    toggleMenuPanel(): void {
        this.menuPanelActive = !this.menuPanelActive;
        this.tocPanelActive = false;
        this.basemapPanelActive = false;
        this.settingsPanelActive = false;
        this.newLayerPanelActive = false;
        this.bookmarksPanelActive = false;
    }

    toggleBasemapPanel(): void {
        this.basemapPanelActive = !this.basemapPanelActive;
        this.tocPanelActive = false;
        this.settingsPanelActive = false;
        this.newLayerPanelActive = false;
        this.bookmarksPanelActive = false;
        this.menuPanelActive = false;
    }

    toggleSettingsPanel(): void {
        this.settingsPanelActive = !this.settingsPanelActive;
        this.tocPanelActive = false;
        this.basemapPanelActive = false;
        this.newLayerPanelActive = false;
        this.bookmarksPanelActive = false;
        this.menuPanelActive = false;
    }

    toggleNewLayerPanel(): void {
        this.newLayerPanelActive = !this.newLayerPanelActive;
        this.tocPanelActive = false;
        this.basemapPanelActive = false;
        this.settingsPanelActive = false;
        this.bookmarksPanelActive = false;
        this.menuPanelActive = false;
    }

    toggleBookmarksPanel(): void {
        this.bookmarksPanelActive = !this.bookmarksPanelActive;
        this.menuPanelActive = false;
        this.tocPanelActive = false;
        this.basemapPanelActive = false;
        this.settingsPanelActive = false;
        this.newLayerPanelActive = false;
    }

    closeAllPanels(): void {
        this.bookmarksPanelActive = false;
        this.menuPanelActive = false;
        this.tocPanelActive = false;
        this.basemapPanelActive = false;
        this.settingsPanelActive = false;
        this.newLayerPanelActive = false;
    }

    toggleInfoModal(): void {
        this.infoModalActive = !this.infoModalActive;
    }

    toggleHelpModal(): void {
        this.helpModalActive = !this.helpModalActive;
    }

    toggleReleaseNotesModal(): void {
        this.releaseNotesModalActive = !this.releaseNotesModalActive;
    }

    toggleToolDescription(): void {
        this.toolDescriptionActive = !this.toolDescriptionActive;
    }



    initializeSearchBar(searchBarDivRef: ElementRef): void {
        // Add the search widget
        this.searchBar = new Search({
            view: this.vSrvc.View,
            container: searchBarDivRef.nativeElement
        });
    }

    initializeTableOfContents(layerListDivRef: ElementRef, legendDivRef: ElementRef): void {
        this.layerList = new EsriLayerList({
            view: this.vSrvc.View,
            container: layerListDivRef.nativeElement
        });

        if (this.appCfg.LayerListGoToFullExtentButtonsEnabled) {
            this.layerList.listItemCreatedFunction = function(event) {
                var item = event.item;
                // if(item.layer.url == )
                item.actionsSections = [[{
                    title: "Go to full extent",
                    className: "esri-icon-zoom-out-fixed",
                    id: "full-extent"
                }]]
            }
        }

        this.layerList.on('trigger-action', (event) => {
            let id = event.action.id;
            let layer = event.item.layer;
            if (id === 'full-extent') {
                if ((layer as any).layers) {
                    let layers = (layer as any).layers;
                    let extent = null;

                    layers.forEach(layer => {
                        if (extent == null) {
                            extent = layer.fullExtent.clone();
                        } else {
                            extent.union(layer.fullExtent);
                        }
                    });

                    this.vSrvc.View.goTo(extent);
                } else {
                    this.vSrvc.View.goTo(layer.fullExtent);
                }
            }
        });
        this.legend = new Legend({
            view: this.vSrvc.View,
            container: legendDivRef.nativeElement
        });
    }

    get LayerList(): EsriLayerList {
        return this.layerList;
    }
}
