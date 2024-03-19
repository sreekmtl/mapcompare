import {XYZ,OSM,TileArcGISRest,BingMaps,} from 'ol/source';
import Keys from './keys';

const basemapId = "arcgis/streets";
const EsriLayers={
  'World_Basemap_v2':'World_Basemap_v2',
  'World_Topo_Map':'World_Topo_Map',
  'World_Street_Map':'World_Street_Map',
  'World_Hillshade':'Elevation/World_Hillshade',
  'World_Ocean_Base': 'Ocean/World_Ocean_Base',
  'World_Imagery': 'World_Imagery'
  };


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
          url: 'https://services.arcgisonline.com/arcgis/rest/services/'+EsriLayers['World_Topo_Map']+'/MapServer/MapServer/tile/{z}/{y}/{x}',

        });
        
    }

  
}

export default Sources;