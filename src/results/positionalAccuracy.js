import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { buffer, polygon, lineString, intersect, featureCollection} from 'turf';
import dissolve from '@turf/dissolve';
import lineOverlap from '@turf/line-overlap';
import lineIntersect from '@turf/line-intersect';
import booleanIntersects from '@turf/boolean-intersects'
import lineSplit from '@turf/line-split';
import booleanWithin from '@turf/boolean-within';
import { lineCompleteness, vectorToGeom } from './completeness';



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
        featureArray1.push(f);
    })
    src2.forEachFeature((f)=>{
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

    console.log(dissolvedFeatures[0].geometry.coordinates, lineFeatures[0].geometry.coordinates);

    let overlappedFeatures=[];
    let splittedArray=[];
    let intersectedArray=[];

    for (let i=0; i<dissolvedFeatures.length;i++){
        let dis_coords= dissolvedFeatures[i].geometry.coordinates;
        let dis_poly= polygon(dis_coords);
        
        for (let j=0; j<lineFeatures.length;j++){
            let lin_coords= lineFeatures[j].geometry.coordinates;
            let lin_ls= lineString(lin_coords);

            if (booleanWithin(lin_ls,dis_poly)){ //if line is completely within buffer, just add
                overlappedFeatures.push(lin_ls);
            }
            
            if (booleanIntersects(lin_ls,dis_poly)){ //if line is not completely within buffer, Hmmm... we have to do few things
                
                //First, split the lines if it intersects the buffer. So splittedLines contains lineString which lies inside buffer as well as outside
                let splittedLines= lineSplit(lin_ls,dis_poly);
                splittedArray.push(splittedLines);

                //Secondly we have to remove linestring from splittedLines which dont falls inside buffer
                //So for that again checking booleanwithin for splitted lines. Splitted part that completely falls within buffer, adddd bakki leave it

                splittedLines.features.forEach((f)=>{
                    if (booleanWithin(f,dis_poly)){
                        intersectedArray.push(f);
                        overlappedFeatures.push(f);
                    }
                });
                
            }
           
           
            
        }
    }
    console.log(splittedArray.length,'splittedlines');
    console.log(intersectedArray.length,'intersectedarray')

    console.log(overlappedFeatures,'ovlftr');

    let fc= featureCollection(overlappedFeatures);

    const returnSrc= new VectorSource({
        features:new GeoJSON({dataProjection:'EPSG:4326', featureProjection:'EPSG:4326'}).readFeatures(dissolved),
    });

   // returnSrc.forEachFeature((f)=>{
       // f.getGeometry().transform('EPSG:4326','EPSG:3857');
    //});



    const returnLayer= new VectorLayer();
    returnLayer.setSource(returnSrc);

    const intersectedSrc= new VectorSource({
        features:new GeoJSON({dataProjection:'EPSG:4326', featureProjection:'EPSG:4326'}).readFeatures(fc),
    });

    //console.log('Line within buffer: ', lineCompleteness())

    //intersectedSrc.forEachFeature((f)=>{
        //f.getGeometry().transform('EPSG:4326','EPSG:3857');
    //});

    const intersectedLayer= new VectorLayer();
    intersectedLayer.setSource(intersectedSrc);

    let len_line_in_bfr= vectorToGeom(intersectedLayer,'LineString');
    let original_len= vectorToGeom(vectorLayer2,'LineString');

    console.log('Length of line within buffer: ', len_line_in_bfr);
    console.log('Percentage of line within buffer: ', (len_line_in_bfr/original_len)*100, '%');

    return [returnLayer, intersectedLayer];

    

}