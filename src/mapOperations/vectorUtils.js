import GeoJSON from 'ol/format/GeoJSON.js';
import {transform} from 'ol/proj';
import {polygon, featureCollection} from 'turf';

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