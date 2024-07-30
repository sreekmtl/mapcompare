import { Projection } from 'ol/proj';
import {getArea} from 'ol/sphere';
import {getLength} from 'ol/sphere';
import { intersect, multiPolygon, polygon, area } from 'turf';
import { olVectorLayerToGeoJSON } from '../mapOperations/vectorUtils';


function areaOfPolygon(geom){

    return getArea(geom,{projection:'EPSG:4326'});
}

function lengthOfLine(geom){

    return getLength(geom, {projection:'EPSG:4326'});
}

export function vectorToGeom(vectorLayer, type){
    let src= vectorLayer.getSource();
    let result=0;
    
    if (type==='LineString'){

        src.forEachFeature((f)=>{
            result+= lengthOfLine(f.getGeometry());
        });

    } else if (type==='Polygon'){
        src.forEachFeature((f)=>{
            result+= areaOfPolygon(f.getGeometry());
        });
    }

    return result;
}


function GeometryBased_AInterB(vectorLayer1, vectorLayer2){

    let src1= vectorLayer1.getSource();
    let src2= vectorLayer2.getSource();
    let multiPolygonArray1=[];
    let multiPolygonArray2=[];
    

    src1.forEachFeature((f)=>{

        let f1= f.clone()
        //f1.getGeometry().transform('EPSG:3857','EPSG:4326');
        let coords=f1.getGeometry().getCoordinates();
        multiPolygonArray1.push(coords);
    })

    src2.forEachFeature((f)=>{

        let f1= f.clone()
        //f1.getGeometry().transform('EPSG:3857','EPSG:4326');
        let coords=f1.getGeometry().getCoordinates();
        multiPolygonArray2.push(coords);
    })

    let multiPolygon1= multiPolygon(multiPolygonArray1);
    let multiPolygon2= multiPolygon(multiPolygonArray2);

    //console.log(multiPolygonArray1,multiPolygon1,'mpi');
    let intersection= intersect(multiPolygon1, multiPolygon2);
    let inter_area= area(intersection);

    return inter_area;

}

function vectorLayerArea(vectorLayer){

   let gj= olVectorLayerToGeoJSON(vectorLayer);
   let areaofLayer= area(gj);

    return areaofLayer;
}

function PixelBased_AInterB(imageData1, imageData2, areaPerPixel){

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

    return interArea*areaPerPixel;

}

function pixelArea(imageData, areaPerPixel){

    let area=0;
    let data= imageData.data;
    for (let i=0; i<data.length; i+=4){
        if (data[i]===255 && data[i+3]===255){
            area++;
        }
    }

    return area*areaPerPixel; //RIGHT NOW AREA PER PIXEL IS BASED ON ZOOM LVL 13, CHANGE THAT!!!
}

export function polygonCompleteness(vectorLayer1, vectorLayer2){

    let area_ref= vectorToGeom(vectorLayer1, 'Polygon');
    let area_comp= vectorToGeom(vectorLayer2, 'Polygon');

    let completeness_percent= (area_comp/area_ref)*100;
    //console.log('reference area: ', area_ref, 'm^2', '\n', 'comparison area: ', area_comp, 'm^2');

    return {
        'reference area': area_ref.toFixed(2).toString()+' m^2',
        'comparison area': area_comp.toFixed(2).toString()+' m^2',
        'completeness %':completeness_percent.toFixed(2)
    };

}

export function getPolygonCount(vectorLayer){

    let count=0;
    let src= vectorLayer.getSource();
    src.forEachFeature((f)=>{
        count++;
    });

    return count;

}

export function lineCompleteness(vectorLayer1, vectorLayer2){

    let len_ref= vectorToGeom(vectorLayer1, 'LineString');
    let len_comp= vectorToGeom(vectorLayer2, 'LineString');

    let completeness_percent= (len_comp/len_ref)*100;
    console.log('reference length: ', len_ref, 'm', '\n', 'comp length: ', len_comp, 'm');

    return {
        'reference length': len_ref.toFixed(2).toString()+' m',
        'comparison length': len_comp.toFixed(2).toString()+' m',
        'completeness %':completeness_percent.toFixed(2)
    };
    
}

export function geometryBasedJI(vectorLayer1, vectorLayer2){

    /**
     * Calculates Jaccard index based on the geometry
     * Takes two polygon feature collection
     */

    let A= vectorLayerArea(vectorLayer1);
    let B= vectorLayerArea(vectorLayer2);
    let A_INTER_B= GeometryBased_AInterB(vectorLayer1, vectorLayer2);

    let JI= A_INTER_B/(A+B-A_INTER_B);

    //console.log('A: ', A,'\n', 'B: ',B,'\n', 'A_INTER_B: ', A_INTER_B)
    return Math.abs(JI).toFixed(2);
}

export function pixelBasedJI(imageData1, imageData2, areaPerPixel){

    /**
     * Calculates pixel wise Jaccard Index
     * Takes two image data of selected features
     * Seleted features are represented by [255,0,0,255] in RGBA
     */

    
    let A= pixelArea(imageData1, areaPerPixel);
    let B= pixelArea(imageData2, areaPerPixel);
    let A_INTER_B= PixelBased_AInterB(imageData1, imageData2, areaPerPixel);

    let JI= A_INTER_B/(A+B-A_INTER_B);

    return JI.toFixed(2);
    
}


