import {XYZ,OSM,TileArcGISRest, ImageArcGISRest,BingMaps, WMTS, Google, TileWMS} from 'ol/source';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import Keys from './keys';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {getTopLeft, getWidth} from 'ol/extent.js';
import {get as getProjection} from 'ol/proj.js';
import {Control, defaults as defaultControls} from 'ol/control';

const projection_3857 = getProjection('EPSG:3857');
const projectionExtent_3857 = projection_3857.getExtent();
//const matrixSet = Proj.CRS('EPSG:3857').getTileMatrixSet();
const size_3857 = getWidth(projectionExtent_3857) / 256;
const resolutions_3857 = new Array(19);
const matrixIds_3857 = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions_3857[z] = size_3857 / Math.pow(2, z);
  matrixIds_3857[z] = "EPSG:3857:"+z;
}

const projection_4326 = getProjection('EPSG:4326');
const projectionExtent_4326 = projection_4326.getExtent();
//const matrixSet = Proj.CRS('EPSG:3857').getTileMatrixSet();
const size_4326 = getWidth(projectionExtent_4326) / 256;
const resolutions_4326 = new Array(19);
const matrixIds_4326 = new Array(19);
for (let z = 0; z < 19; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions_4326[z] = size_4326 / Math.pow(2, z);
  matrixIds_4326[z] = "EPSG:4326:"+z;
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

  let bhuvanLayers={
    'Uttarakhand_LULC_2005-06':'lulc:UK_LULC50K_0506',
    'Uttarakhand_LULC_2011-12':'lulc:UK_LULC50K_1112',
    'Uttarakhand_LULC_2015-16': 'lulc:UK_LULC50K_1516',

  }


class Sources{
    
    constructor(){

        let key= new Keys();

        this.OSM_Standard= new TileLayer({source:new OSM()});

        this.Bing_RoadsOnDemand= new TileLayer({
          source:new BingMaps({
            key:key.apikeys.BingMapKey,
            imagerySet:'RoadOnDemand'
        })
        });

        this.googleMaps = new TileLayer({
          source:new Google({
            key:key.apikeys.GoogleMapKey,
            scale: 'scaleFactor2x',
            highDpi: true,
          })
        });

        this.BhuvanLULC1= new TileLayer({
          source:new TileWMS({
            url: 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/gwc/service/wms',
            params: {'LAYERS': bhuvanLayers['Uttarakhand_LULC_2005-06'], 
            'TILED': true,
            'VERSION':'1.1.1',
            'BBOX':'77.575,28.715,81.043,31.467',
            'SRS':'EPSG:3857',
            'WIDTH':256,
            'HEIGHT':256,
            'FORMAT':'image/png'
  
          },
            serverType: 'geoserver',
            crossOrigin: 'Anonymous',
        })
        });

        this.BhuvanLULC2= new TileLayer({
          source:new TileWMS({
            url: 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/gwc/service/wms',
            params: {'LAYERS': bhuvanLayers['Uttarakhand_LULC_2011-12'], 
            'TILED': true,
            'VERSION':'1.1.1',
            'BBOX':'77.575,28.715,81.043,31.467',
            'SRS':'EPSG:3857',
            'WIDTH':256,
            'HEIGHT':256,
            'FORMAT':'image/png'
  
          },
            serverType: 'geoserver',
            crossOrigin: 'Anonymous',
        })
        });

        this.ESALULC_2017= new ImageLayer({
          source: new ImageArcGISRest({
            url:'https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer',
            ratio:1,
            crossOrigin:'Anonymous',
            params:{
              time:'1483272000000', //1577880000000 (2020)
            }
          }),
        });

        this.ESALULC_2023= new ImageLayer({
          source: new ImageArcGISRest({
            url:'https://ic.imagery1.arcgis.com/arcgis/rest/services/Sentinel2_10m_LandCover/ImageServer',
            ratio:1,
            crossOrigin:'Anonymous',
            params:{
              time:'1704023999000',
            }
          }),
        });

        this.EsriWorldImagery= new TileLayer({
          source:new XYZ({
            url: 'https://services.arcgisonline.com/arcgis/rest/services/'+EsriLayers['World_Imagery']+'/MapServer/MapServer/tile/{z}/{y}/{x}',
            crossOrigin:'Anonymous',
          })
        });

        //NOT USING/NOT USEFUL--------------------------------------------------------------------------------

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

       

        

        

        this.ESA_WORLDCOVER2020= new WMTS({
          url: 'https://services.terrascope.be/wmts/v2',
          layer: 'WORLDCOVER_2020_MAP',
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          projection: projection_3857,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent_3857),
            resolutions: resolutions_3857,
            matrixIds: matrixIds_3857,
          }),
          wrapX: true,
         //crossOrigin:'*',
        });

        this.ESA_WORLDCOVER2021= new WMTS({
          url: 'https://services.terrascope.be/wmts/v2',
          layer: 'WORLDCOVER_2021_MAP',
          matrixSet: 'EPSG:3857',
          format: 'image/png',
          projection: projection_3857,
          tileGrid: new WMTSTileGrid({
            origin: getTopLeft(projectionExtent_3857),
            resolutions: resolutions_3857,
            matrixIds: matrixIds_3857,
          }),
          wrapX: true,
          //crossOrigin:'*',
        });

        
        
        
    }

  
}



export default Sources;