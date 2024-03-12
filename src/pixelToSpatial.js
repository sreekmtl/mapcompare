import { addGeoJSONLayer } from "./main";



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

    console.log(extent, pixelWidth, pixelHeight, 'extent');

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

    //featurepixel object has key which represent each color and each key holds array of pixel positions
    //now converting the pixel positions to geographic coordinates and storing in geojson

    let geoJSON= {

        "type":"FeatureCollection",
        "name":"selectedFeatures",
        "crs":{
            "type": "name",
            "properties": {
              "name": "EPSG:3857"
            }
          }
          ,
        "features": [
            
        ]
    }

   

    for (const pixPos in featurePixel){
        let tempArr= [];

        for (let j=0; j<featurePixel[pixPos].length; j++){

            //converting contour positions to x-y based from UInt8Array
            let x= (featurePixel[pixPos][j]%width);
            let y= Math.floor((featurePixel[pixPos][j]/width));

            tempArr.push([x,y]);

        }

        if(tempArr.length<=3){ //if length of contours is less than 4, don't consider
            continue;
        }
        
        let sortedContours= sortContourPixels(tempArr);
        let coordinates=[];

        for (let i=0; i<sortedContours.length;i++){
            let x1= sortedContours[i][0];
            let y1= sortedContours[i][1];

            //converting x-y based pixel positions into Easting and Northing (EPSG:3857)
            x1= extent[0]+ (x1*pixelWidth);  
            y1= extent[3]- (y1*pixelHeight); 

            coordinates.push([x1,y1]);


        }

        geoJSON["features"].push(
            {
                "type":"Feature",
                "geometry":{
                    "type":"Polygon",
                    "coordinates":[coordinates]
                },
                "proprties":{
                    "prop":'',
                }
            },)
        
        //addGeoJSONLayer(geoJSON);
       
        


    }

    

    return geoJSON;


   
}


function sortContourPixels(positionArray){

    /**
     * Sort points in location array such that
     * arrange point in an order in order to create a polygon out of these points
     * Here I am implementing it in clock-wise order
     * FOR THAT :
     * First take the first pixel
     * Then runs a 3*3 kernel over it where kernel elements are adjacent pixel positions
     * if the element in kernel matches with a real pixel position, it adds that position to next
     * like that it continue
     * if there is a dead end at a particular position, the kernel will go back and finds the route without gaps
     */

    let posArray= positionArray.slice();
    let sortedArray=[];
    let ip= posArray[0]; //initial point
    sortedArray.push(ip);
    posArray[0]=[NaN,NaN]; 
    //console.log(posArray, 'pos');
    let i_f=0;
    let sub_factor=posArray.length-1;
    let ii=0; //independent iterator

    function kernel(k){
        let kern= [[k[0]-1, k[1]-1],[k[0], k[1]-1],[k[0]+1, k[1]-1],
        [k[0]-1, k[1]],k,[k[0]+1, k[1]],
        [k[0]-1, k[1]+1],[k[0], k[1]+1],[k[0]+1, k[1]+1]];
    
        return kern; 
       
    }

    loop1:
    for (let k=0; k<=sortedArray.length; k++){
        ii++
        let il= sortedArray.length;
        let ker= kernel(sortedArray[k]);

        loop2:
        for (let j=0; j<ker.length; j++){  

            loop3:
            for (let i=1; i<posArray.length; i++){

                if (j===4){ //if kernel center, its same. So break
                    break loop3;
                }

                if (((ker[j][0]===posArray[i][0]) && (ker[j][1]===posArray[i][1])) && ((posArray[i][0]!=NaN && posArray[i][1]!=NaN))){ //checking current pos equals any element in kernel

                    
                    
                    sortedArray.push(positionArray[i]);
                    posArray[i]=[NaN,NaN];
                    sub_factor-=1;
                    break loop2;
        
                }
            }

        }

        let fl= sortedArray.length;
        //console.log([k, il,fl], 'ilfl');
        if (fl-il===0){
            //console.log(sortedArray[k]);
            let v=sortedArray.pop();
            //console.log(v, 'v');
            k=k-2;
            i_f+=1;
            //console.log(k);
        
        }

        let gap= sub_factor+i_f;

        

        if(ii===posArray.length-1){
            console.log('breaked');
            break;
        }

      

    }

    //console.log(sub_factor,'subf');
    //console.log(posArray);
    //console.log(i_f, 'if');
    //console.log(ii,'ii');


    return sortedArray;



}

export {contourToPolygon};