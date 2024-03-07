

function contourToPolygon(contourData, width, height, extent){

    /**
     * JS file for converting contours to GIS vector files
     * 
     * Takes contour image and color map of contour
     * Then identifies each contour with its color map
     * pixels are extracted from the identified contours
     * pixel positions are converted to geographical positions
     * geographical positions has to be sorted in order to convert it to polygon
     * sorted positions are used to create polygon in geojson file
 */

    let contours= contourData.contour;
    let colors= contourData.color;
    let featurePixel= {}; //Object for storing array of pixel's position where each inner array contain pixel position of a single polygon
    let pixelWidth= (extent[2]-extent[0])/width;
    let pixelHeight= (extent[3]-extent[1])/height;

    for (let i=0; i<contours.length; i+=3){  //Alpha channel is not considered here

        let r= contours[i];
        let g= contours[i+1];
        let b= contours[i+2];

        let rgbMap= [r,g,b];

        if (!((r===0) && (g===0) && (b===0))){

            if (rgbMap.toString() in featurePixel){
                featurePixel[rgbMap.toString()].push(i/3);

            }else {

                featurePixel[rgbMap.toString()]=[i/3];
            }

        }

    }

    console.log(featurePixel, 'featurePixel');
    console.log(colors);

    //featurepixel object has key which represent each color and each key holds array of pixel positions
    //now converting the pixel positions to geographic coordinates and storing in geojson

    let geoJSON= {

        "type":"FeatureCollection",
        "features": [
            
        ]
    }

   

    for (const pixPos in featurePixel){
        let tempArr= [];

        for (let j=0; j<featurePixel[pixPos].length; j++){

            //converting contour positions to x-y based from UInt8Array
            let x= (featurePixel[pixPos][j]%width);
            let y= Math.floor((featurePixel[pixPos][j]/width));

            //converting x-y based pixel positions into Easting and Northing (EPSG:3857)
            let x1= extent[0]+ (x*pixelWidth);  
            let y1= extent[1]+ (y*pixelHeight); 

            tempArr.push([x, y]);

        }

        console.log(tempArr, 'temparr');
        console.log(sortContourPixels(tempArr), 'sortedarr');

    }

    geoJSON["features"].push(
        {
            "type":"Feature",
            "geometry":{
                "type":"Polygon",
                "coordinates":[

                ]
            },
            "proprties":{
                "prop":'',
            }
        },
    )
   
}

function sortContourPixels(positionArray){

    /**
     * Sort points in location array such that
     * arrange point in an order in order to create a polygon out of these points
     * Here I am implementing it in clock-wise order
     * FOR THAT :
     * 
     */

    let simplifiedArray=[];

    for (let i=0; i<positionArray.length;i++){

        let x,y;

        if (simplifiedArray.length===0){
            simplifiedArray.push(positionArray[i])
            x=positionArray[i][0];
            y= positionArray[i][1];
        }else{
            if (x===simplifiedArray.slice(-1)[0][0] | y===simplifiedArray.slice(-1)[0][1]){
                 continue;
            }else {

                simplifiedArray.push(positionArray[i]);
                x=positionArray[i][0];
                y=positionArray[i][1]; //or just calculate the bounding box, centroid for positional accuracy.... its fastttt
                
            }
            
        }
    }

    
    return simplifiedArray;

}

export {contourToPolygon};