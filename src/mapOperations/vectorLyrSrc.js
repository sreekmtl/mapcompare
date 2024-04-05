import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';
import {getDistance} from 'ol/sphere';
import { euclideanDistance } from "../utils";
import { buffer, point } from "turf";
import { transform } from "ol/proj";


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

    if (data.name==='lines'){ //using douglas peuker algorithm to simplify line features

      snapLineToLine(data);
        let ft=[];
        vectorSource.forEachFeature((f)=>{
        let gm1= f.getGeometry().simplify(3); 
        let feature= new Feature({
            geometry:gm1,
        });
        ft.push(feature);
        });

        let simplifiedVectorSource= new VectorSource({
        features:ft,
        });

        vectorLayer.setSource(simplifiedVectorSource);
        featureCount=ft.length;

    }else { //if it is not line, dont simplify

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

let firstLastArray=[];
function snapLineToLine(data){
  console.log(data, 'rawdata');
  //Go through each line segment
  //Check whether the last of this particular is near to first of other segments
  //if yes, add the other to this

  let featureLength= data.features.length;

  for (let i=0; i<data.features.length; i++){

    let id= data.features[i].id;
    let len= data.features[i].geometry.coordinates.length;
    let coord= data.features[i].geometry.coordinates;

    firstLastArray.push({
      'id':id,
      'coords': [coord[0], coord[len-1]],
    });

  }


  let fc= firstLastArray[0]['coords'][0];
  let lc= firstLastArray[0]['coords'][1];
  

  let idRm= firstLastArray[0]['id'];

  for (let i=0; i<firstLastArray.length; i++){

    if (euclideanDistance(lc, firstLastArray[i]['coords'][0])<10){

      console.log(firstLastArray[i]['id']);
    }
  }
  
  
}



export function snapLineToPoint(jn, lyr){

  //Used to combine lines and junctions

  const pointSource= jn.getSource();
  const lineSource= lyr.getSource();



  let ftr_list= [];
  lineSource.forEachFeature((f)=>{
    
    let geom= f.getGeometry();
    let coords= geom.getCoordinates();
    let len= coords.length;

    let fp= coords[0];
    let lp= coords[len-1];

    let pnt= point(transform(fp, 'EPSG:3857', 'EPSG:4326'));
    let bfr= buffer(pnt, 0.02, 'kilometers');
    
    

  });
 
  let buffVctrSrc= new VectorSource({
    features: ftr_list,
  })
  
  let vl= new  VectorLayer();
  vl.setSource(buffVctrSrc);

  return vl;

}


