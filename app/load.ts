
//This file basically bootstraps the ESRI ArcGIS api to work using system.js.
//All ArcGIS modules required should be added to the deps array. 

declare var System: any;
declare var __moduleName: string; //this is so we can use relative paths to templates and styles within components. Only required if using SystemJS module.
declare var module: NodeModule; //this is so we can use relative paths to tempaltes and styles within components. Only required if using commonjs module.

declare var esriSystem: any; //ambient declaration for esriSystem.

//declare aliases for paths
let paths = {
    "lib:": "lib/"
}

let map = {

    app: 'app', // 'custom dist',
    // angular bundles
    '@angular/core': 'lib:@angular/core/bundles/core.umd.js',
    '@angular/common': 'lib:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'lib:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'lib:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'lib:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'lib:@angular/http/bundles/http.umd.js',
    '@angular/router': 'lib:@angular/router/bundles/router.umd.js',
    '@angular/forms': 'lib:@angular/forms/bundles/forms.umd.js',

    // other libraries
    'rxjs': 'lib:rxjs',
    'angular-in-memory-web-api': 'lib:angular-in-memory-web-api',

}

let packages = {
    app: {
        main: './main.js',
        defaultExtension: 'js'
    },
    rxjs: {
        defaultExtension: 'js'
    },
    'angular-in-memory-web-api': {
        main: './index.js',
        defaultExtension: 'js'
    }
}

// configure SystemJS
System.config({
    paths: paths,
    map: map,
    packages: packages
});


//use esri-system-js to load the esri modules, then kick off loading the app package defined in SystemJS.
esriSystem.register([
    'esri/Basemap',
    'esri/Color',
    'esri/Map',
    'esri/Ground',
    'esri/Graphic',
    'esri/Camera',
    'esri/geometry/Point',
    'esri/geometry/SpatialReference',
    'esri/views/SceneView',
    'esri/views/ui/DefaultUI',
    'esri/geometry/Polyline',
    'esri/layers/ElevationLayer',
    'esri/geometry/Polygon',
    'esri/geometry/Circle',
    'esri/widgets/LayerList',
    'esri/widgets/Legend',
    'esri/widgets/Slice',
    'esri/popup/FieldInfo',
    'esri/widgets/BuildingExplorer',
    'esri/widgets/LineOfSight',
    'esri/widgets/ElevationProfile',
    'esri/widgets/ElevationProfile/ElevationProfileLineGround',
    'esri/widgets/ElevationProfile/ElevationProfileLineView',
    'esri/widgets/Search',
    'esri/tasks/QueryTask',
    'esri/tasks/support/Query',
    // Renderers
    'esri/renderers/SimpleRenderer',
    'esri/renderers/UniqueValueRenderer',
    'esri/renderers/ClassBreaksRenderer',
    'esri/renderers/PointCloudRGBRenderer',
    // Symbols
    'esri/symbols/FillSymbol3DLayer',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/IconSymbol3DLayer',
    'esri/symbols/LineSymbol3DLayer',
    'esri/symbols/LineSymbol3D',
    'esri/symbols/WebStyleSymbol',
    'esri/symbols/TextSymbol3DLayer',
    'esri/symbols/PointSymbol3D',
    'esri/symbols/MeshSymbol3D',
    'esri/symbols/LabelSymbol3D',
    'esri/symbols/callouts/LineCallout3D',
    // Layers
    'esri/layers/GraphicsLayer',
    'esri/layers/MapImageLayer',
    'esri/layers/TileLayer',
    'esri/layers/VectorTileLayer',
    'esri/layers/ImageryTileLayer',
    'esri/layers/SceneLayer',
    'esri/layers/GroupLayer',
    'esri/layers/FeatureLayer',
    'esri/layers/WMSLayer',
    'esri/layers/WMTSLayer',
    'esri/layers/PointCloudLayer',
    'esri/layers/BuildingSceneLayer',
    'esri/layers/IntegratedMeshLayer',
    'esri/widgets/Home',
    'esri/PopupTemplate',
    'esri/tasks/support/Query',
    'esri/tasks/support/ProjectParameters',
    'esri/geometry/Extent',
    'esri/geometry/Geometry',
    'esri/geometry/geometryEngine',
    'esri/tasks/GeometryService',
    'esri/core/urlUtils',
    'esri/config'
],
    function () {
        // bootstrap the app
        System.import('app')
            .catch(function (err: any) {
                console.error('%O%', err);
            });
    }, {
        maintainModuleNames: true
    });

