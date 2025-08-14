// import rollup      from 'rollup';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify';
//import angular     from 'rollup-plugin-angular';

export default {
    entry: 'wwwroot/app/main.aot.js',
    external: [
        //declare all of the esri modules included as external references. Should have this array declared once and shared between load.ts and this file.
        // TODO: Some of these things are probably unused, remove them, also, organize them logically
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
        'esri/tasks/support/Query',
        'esri/tasks/QueryTask',
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
        'esri/symbols/PolygonSymbol3D',
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
    sourceMap: false,
    format: 'amd',
    plugins: [
        nodeResolve(
            {
                jsnext: true,
                module: true
            }),
        commonjs({
            include: 'node_modules/rxjs/**'
        }),
        uglify()
    ]
};