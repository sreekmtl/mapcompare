import {XYZ,OSM,TileArcGISRest,BingMaps, WMTS, Google} from 'ol/source';
import Keys from './keys';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {getTopLeft, getWidth} from 'ol/extent.js';
import {get as getProjection} from 'ol/proj.js';
import {Control, defaults as defaultControls} from 'ol/control';

const projection = getProjection('EPSG:3857');
const projectionExtent = projection.getExtent();
//const matrixSet = Proj.CRS('EPSG:3857').getTileMatrixSet();
const size = getWidth(projectionExtent) / 256;
const resolutions = new Array(19);
const matrixIds = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = "EPSG:3857:"+z;
}

const basemapId = "arcgis/streets";
const EsriLayers={
  'World_Basemap_v2':'World_Basemap_v2',
  'World_Topo_Map':'World_Topo_Map',
  'World_Street_Map':'World_Street_Map',
  'World_Hillshade':'Elevation/World_Hillshade',
  'World_Ocean_Base': 'Ocean/World_Ocean_Base',
  'World_Imagery': 'World_Imagery'
  };

  const BingLayers={
    'RoadOnDemand':'RoadOnDemand',
    'Aerial':'Aerial',
    'AerialWithLabelsOnDemand':'AerialWithLabelsOnDemand',
    'CanvasDark':'CanvasDark',
    'OrdnanceSurvey':'OrdnanceSurvey',
    'Road':'Road',
  }


class Sources{
    
    constructor(){

        let key= new Keys();

        this.OSM_Standard= new OSM();
        this.Bing_RoadsOnDemand= new BingMaps({
            key:key.apikeys.BingMapKey,
            imagerySet:'RoadOnDemand'
        });
        this.ArcGIS_sample= new TileArcGISRest(
            {
                url:`https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/${basemapId}?token=${key.apikeys.ArcGISKey}`,
                crossOrigin: 'Anonymous',
            }
        );
        this.EsriXYZ= new XYZ({
            attributions:
              'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
              'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
            url:
              'https://server.arcgisonline.com/ArcGIS/rest/services/' +
              'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
            maxZoom:19,
            crossOrigin: 'Anonymous',
          });

        this.EsriMaps= new XYZ({
          url: 'https://services.arcgisonline.com/arcgis/rest/services/'+EsriLayers['World_Imagery']+'/MapServer/MapServer/tile/{z}/{y}/{x}',

        });

        this.googleMaps = new Google({
          key,
          scale: 'scaleFactor2x',
          highDpi: true,
        });

        this.ESA_WORLDCOVER2020= new WMTS({
          url: 'https://services.terrascope.be/wmts/v2',
          layer: 'WORLDCOVER_2020_MAP',
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          projection: projection,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          wrapX: true,
         //crossOrigin:'null',
        });

        this.ESA_WORLDCOVER2021= new WMTS({
          url: 'https://services.terrascope.be/wmts/v2',
          layer: 'WORLDCOVER_2021_MAP',
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          projection: projection,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent),
            resolutions: resolutions,
            matrixIds: matrixIds,
          }),
          wrapX: true,
          //crossOrigin:'null',
        });

        this.BhuvanLULC= new WMTS({
          url:'https://bhuvan-vec2.nrsc.gov.in/bhuvan/gwc/service/wmts/',
          version:'1.0.0',
          format:"image/png",
        })
        
    }

  
}

class GoogleLogoControl extends Control{

  constructor(){
    const element = document.createElement('img');
      element.style.pointerEvents = 'none';
      element.style.position = 'absolute';
      element.style.bottom = '5px';
      element.style.left = '5px';
      element.src =
        'https://developers.google.com/static/maps/documentation/images/google_on_white.png';
      super({
        element: element,
      });
  }
}

export default Sources;