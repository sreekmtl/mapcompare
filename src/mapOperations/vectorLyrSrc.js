import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import { euclideanDistance } from "../utils";
import { buffer, point, polygon, lineString} from "turf";
import { transform } from "ol/proj";
import { simplify } from "turf";
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { kinks } from "turf";
import unkinkPolygon from '@turf/unkink-polygon'
import cleanCoords from '@turf/clean-coords'
import { SimpleGeometry } from "ol/geom";




//let bufferBuilder= new BufferBuilder();

/**
 * Deals with all vector layers created during run time
 */

let featureCount=0; //Variable for storing feature count


export function createVectorLayer(data){

    
    const vectorSource= new VectorSource({
      features:new GeoJSON({dataProjection:'EPSG:3857'}).readFeatures(data),
    });

    let vectorLayer= new VectorLayer();

    if (data.name==='lines'){ 
      
      //using douglas peuker algorithm to simplify line features
        let ft=[];
        vectorSource.forEachFeature((f)=>{
        let gm1= f.getGeometry().simplify(3); 
        if (gm1.getCoordinates().length>=2){
          let feature= new Feature({
              geometry:gm1,
          });
          ft.push(feature);
        }
        });

        let simplifiedVectorSource= new VectorSource({
        features:ft,
        });

        simplifiedVectorSource.forEachFeature((f)=>{
          f.getGeometry().transform('EPSG:3857','EPSG:4326');
        })

        vectorLayer.setSource(simplifiedVectorSource);
        featureCount=ft.length;

    }else if(data.name==='polygonFeatures'){

      /**
       * Using douglas-pecker algorithm from turf.js to simplify polygon here
       * Because in openlayers, it does'nt uses douglas-pecker on polygons
       * Buffer of thickness 1 unit could be added, so to compensate alaised pixels in contours and simplification
       */

        let ft=[];
        vectorSource.forEachFeature((FTR)=>{
  
        let f= FTR.clone();
        f.getGeometry().transform('EPSG:3857','EPSG:4326'); //converting to wgs-84 for using turfjs
        let coords= f.getGeometry().getCoordinates()[0];
        let turfPoly;
        if(coords.length>=4){
          turfPoly= polygon([coords]);
        }
        let simplified= cleanCoords(simplify(turfPoly,0.000005,true));
        let kink= kinks(simplified);
        if(kink.features.length){
          let simplifiedpolys=unkinkPolygon(simplified);
          let ftrs= simplifiedpolys.features;
          ftrs.forEach((element) => {
            let gj= new GeoJSON({dataProjection:'EPSG:4326'}).readFeature(element);
            ft.push(gj);
          });
        }else{
          let gj= new GeoJSON({dataProjection:'EPSG:4326'}).readFeature(simplified);
          ft.push(gj);
        }
        
        });

        //Now we have to convert this back to epsg:3857 for adding it to map

        

        let simplifiedVectorSource= new VectorSource({
        features:ft,
        });

        //simplifiedVectorSource.forEachFeature((f)=>{
          //f.getGeometry().transform('EPSG:4326','EPSG:3857');
        //});

        

        vectorLayer.setSource(simplifiedVectorSource);
        featureCount=ft.length;

    }
    else { 

        featureCount= data['features'].length;
        vectorLayer.setSource(vectorSource);
    }

  if (data.name==='junctions'){ // use special icons for junctions
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




