


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
    let sub_factor=0;

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

            tempArr.push([x,y]);

        }

        //remove temparr with single pixels

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

    let posArray= positionArray.slice();
    let sortedArray=[];
    let ip= posArray[0]; //initial point
    sortedArray.push(ip);
    posArray[0]=[NaN,NaN]; 
    console.log(posArray, 'pos');
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

    console.log(sub_factor,'subf');
    //console.log(posArray);
    console.log(i_f, 'if');
    console.log(ii,'ii');


    return sortedArray;



}

export {contourToPolygon};