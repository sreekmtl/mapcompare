import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { buffer, polygon, lineString} from 'turf';
import dissolve from '@turf/dissolve';
import lineOverlap from '@turf/line-overlap';
import lineIntersect from '@turf/line-intersect';
import booleanIntersects from '@turf/boolean-intersects'


function polygonPositionAccuracy(vectorLayer1, vectorLayer2){

    //Minimum Bounding rectangle is calculated for two polygon features
    //Edges of polygon falling on MBR is identified
    //
}

export function linePositionalAccuracy(vectorLayer1, vectorLayer2){

    //Accepts two line vector features
    //Creates buffer around reference feature and checks the amount of % of second feature lying in it

    let src1= vectorLayer1.getSource();
    let src2= vectorLayer2.getSource();

    let featureArray1=[];
    let featureArray2=[];

    src1.forEachFeature((f)=>{
        f.getGeometry().transform('EPSG:3857', 'EPSG:4326');
        featureArray1.push(f);
    })
    src2.forEachFeature((f)=>{
        //f.getGeometry().transform('EPSG:3857', 'EPSG:4326');
        featureArray2.push(f);
    })

    let bufferedLine= new GeoJSON().writeFeaturesObject(featureArray1);
    let buffer1= buffer(bufferedLine, 0.005,'kilometers');

    let lineToCheck= new GeoJSON().writeFeaturesObject(featureArray2);

    //check whether line 2 is lying within buffer of line1 (lineToCheck is lying within bufferedLine) if it is then how many meters is inside

    let dissolved= dissolve(buffer1);
    
    //dissolved is feature collection of polygon and lineToCheck is feature collection of linestring

    let dissolvedFeatures= dissolved.features;
    let lineFeatures= lineToCheck.features;

    console.log(dissolved,lineToCheck);

    for (let i=0; i<dissolvedFeatures.length;i++){
        let dis_coords= dissolvedFeatures[i].geometry.coordinates[0];
        let dis_poly= polygon([dis_coords]);
        
        for (let j=0; j<lineFeatures.length;j++){
            let lin_coords= lineFeatures[j].geometry.coordinates;
            let lin_ls= lineString(lin_coords);
            

            let line_overlap= lineOverlap(lin_ls,dis_poly);
            console.log(line_overlap,'lo');
        }
    }

    const vecSrc1= new VectorSource({
        features:new GeoJSON({dataProjection:'EPSG:4326', featureProjection:'EPSG:4326'}).readFeatures(dissolved),
    });

    vecSrc1.forEachFeature((f)=>{
        f.getGeometry().transform('EPSG:4326','EPSG:3857');
    })

    const vecLyr1= new VectorLayer();
    vecLyr1.setSource(vecSrc1);

    return vecLyr1;

    

}