import {getArea} from 'ol/sphere';
import {getLength} from 'ol/sphere';

function areaOfPolygon(geom){

    return getArea(geom);
}

function lengthOfLine(geom){

    return getLength(geom);
}

function AInterB(imageData1, imageData2){

    /**
     * Calculates and returns area of intersection of
     * same features in two imageData object
     */


    let interArea=0;
    let data1= imageData1.data;
    let data2= imageData2. data;

    for (let i=0; i<data1.length; i+=4){

        if ((data1[i]===255 && data1[i+3]===255) && (data2[i]===255 && data2[i+3]===255)){

            interArea++;
        }
    }

    return interArea;

}

function A_area(imageData){

    let areaOfA=0;
    let data= imageData.data;
    for (let i=0; i<data.length; i+=4){
        if (data[i]===255 && data[i+3]===255){
            areaOfA++;
        }
    }

    return areaOfA;
}

function B_area(imageData){

    let areaOfB=0;
    let data= imageData.data;
    for (let i=0; i<data.length; i+=4){
        if (data[i]===255 && data[i+3]===255){
            areaOfB++;
        }
    }

    return areaOfB;
}

export function polygonCompleteness(geom_comp, geom_ref){

    let area_comp= areaOfPolygon(geom_comp);
    let area_ref= areaOfPolygon(geom_ref);

    let completeness_percent= (area_comp/area_ref)*100;

    return completeness_percent;

}

export function lineCompleteness(geom_comp, geom_ref){

    //Implement the percentage wise
    
}

export function pixelWiseJI(imageData1, imageData2){

    /**
     * Calculates pixel wise Jaccard Index
     * Takes two image data of selected features
     * Seleted features are represented by [255,0,0,255] in RGBA
     */

    let A= A_area(imageData1);
    let B= B_area(imageData2);
    let A_INTER_B= AInterB(imageData1, imageData2);

    let JI= A_INTER_B/(A+B-A_INTER_B);

    console.log(JI);
}

