import {getArea} from 'ol/sphere';
import {getLength} from 'ol/sphere';

function areaOfPolygon(geom){

    return getArea(geom);
}

function lengthOfLine(geom){

    return getLength(geom);
}

export function polygonCompleteness(geom_comp, geom_ref){

    let area_comp= areaOfPolygon(geom_comp);
    let area_ref= areaOfPolygon(geom_ref);

    let completeness_percent= (area_comp/area_ref)*100;

    return completeness_percent;

}

export function lineCompleteness(geom_comp, geom_ref){
    
}

export function jaccardIndex(feature1, feature2){

    /**
     * Calculated jaccard index between two sets of polygon
     * Takes two features
     */

    
    
}