import {XYZ,OSM,TileArcGISRest,BingMaps,} from 'ol/source';
import Keys from './keys';

const basemapId = "arcgis/streets";


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
        
    }

  
}

export default Sources;