

function contourToPolygon(contourData){

    /**
     * JS file for converting contours to GIS vector files
     * 
     * Takes contour image and color map of contour
     * Then identifies each contour with its color map
     * pixels are extracted from the identified contours
     * pixel positions are converted to geographical positions and geoJSON file is generated with that
 */

    let contours= contourData.contours;
    let colors= contourData.colors;
    let featurePixel= []; //Array for storing array of pixel's position where each inner array contain pixel position of a single polygon

    for (let i=0; i<contours.length; i+=3){  //Alpha channel is not considered here

        let r= contours[i];
        let g= contours[i+1];
        let b= contours[i+2];

        let rgbMap= [r,g,b];

        for (let j=0; j<colors.length; j++){

            if (rgbMap===colors[j]){


            }
        }

    }
}