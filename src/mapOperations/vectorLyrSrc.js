import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';

/**
 * Deals with all vector layers created during run time
 */

export function addGeoJSONLayer(data){

    const vectorSource= new VectorSource({
      features:new GeoJSON({dataProjection:'EPSG:3857'}).readFeatures(data),
    });

    let vectorLayer= new VectorLayer();

    if (data.name==='lines'){

        let ft=[];
        vectorSource.forEachFeature((f)=>{
        let gm= f.getGeometry();
        console.log(gm.getFlatCoordinates().length, 'bfor');
        let gm1= gm.simplify(3);
        console.log(gm1.getFlatCoordinates().length, 'after');

        let feature= new Feature({
            geometry:gm1,
        });
        ft.push(feature);
        });

        let simplifiedVectorSource= new VectorSource({
        features:ft,
        });

        vectorLayer.setSource(simplifiedVectorSource);


    }else {
        vectorLayer.setSource(vectorSource);
    }

  if (data.name==='junctions'){
    vectorLayer.setStyle(new Style({
      image: new Icon({
        src: 'https://maps.google.com/mapfiles/kml/paddle/red-blank.png',
        anchor: [0.5, 1],
        scale: 0.5
      })
    }));

  }

  return vectorLayer;
  
}