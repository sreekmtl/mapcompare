import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector';
import {transform} from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import {polygon, featureCollection} from 'turf';


/**
 * THIS FILE CONTAINS FUNCTIONS TO CONVERT BETWEEN FOLLOWING VECTOR FILE FORMATS:
 * 
 * Openlayers vectorlayer to GeoJSON
 * Openlayers vectorlayer to turfJS
 * 
 * Openlayers vectorlayer (FROM CRS) to Openlayers vectorlayer (TO CRS)
 */


export function olVectorLayerToGeoJSON(vectorLayer){

    //Function for convert openlayers vectorLayer to GeoJSON

    let vectorSource= vectorLayer.getSource();
    let features=[];

    vectorSource.forEachFeature((f)=>{
        features.push(f);
    });

    let geojsonLayer= new GeoJSON().writeFeaturesObject(features);

    return geojsonLayer;
        
}


export function olVectorLayerToTurfLayer(vectorLayer, vectorType){

    //Function for convert openlayers vectorLayer to turfjs vector layer
    //since turfjs only uses WGS84, all projected crs have to converted to WGS-84

    //ONLY WORKS FOR FEATURE COLLECTION

    let vectorSource= vectorLayer.getSource();
    let features_ol=[]; 
    let features_turf=[];

    vectorSource.forEachFeature((f)=>{
        features_ol.push(f.getGeometry().getCoordinates());
    })

    for (let i=0; i<features_ol.length; i++){
        let temp=[];
        for (let j=0; j<features_ol[i][0].length; j++){
            temp.push(transform(features_ol[i][0][j], 'EPSG:3857', 'EPSG:4326'));
        }
        features_turf.push(temp);
    }
    
    let turf_ftrCol_array=[];

    if (vectorType==='polygon'){

        features_turf.forEach((el)=>{
            let turf_poly= polygon([el]);
            turf_ftrCol_array.push(turf_poly);
        });

        let turf_featureColection= featureCollection(turf_ftrCol_array);

        return turf_featureColection;

    }else if (vectorType==='linestring'){

    }else if (vectorType==='point'){

    }

}

export function transformOlLayer(vectorLayer, crs_from, crs_to){

    let vectorSource= vectorLayer.getSource();
    let returnVectorLayer= new VectorLayer();
    let transformedArray=[];

    vectorSource.forEachFeature((feature)=>{
        
        let f= feature.clone();
        f.getGeometry().transform(crs_from,crs_to);
        transformedArray.push(f);

    });

    let returnVectorSource= new VectorSource({
        features:transformedArray,
    });

    returnVectorLayer.setSource(returnVectorSource);

    return returnVectorLayer;
}