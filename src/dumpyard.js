import { jDBSCAN } from "../algorithms/jDBScan";
import { next4Edges } from "../algorithms/regionGrowing";
import { getContours } from "../imageProcessing/cvOps";
import { sortContourPixels } from "./imageToPolygon";


export function junctionExtract(data, imgW, imgH, extent){

   
    let points=[];
    let roadSegs=[];
    let edges=[];
    let count=0;
    let intersections=[];
    let pixelWidth= (extent[2]-extent[0])/imgW;
    let pixelHeight= (extent[3]-extent[1])/imgH;


    for (let i=0; i<data.length; i+=4){
        
        points.push(data[i]);
        edges.push(data[i+1]);
        

    }


     /**
     * ______________________________________JUNCTION EXTRACTION_________________________________________________
     * 
     * Take canny edge filtered data + eroded data
     * Runs a kernel (depending on road size) over the image pixel by pixel
     * only the outer shell of the kernel is populated (with 1 and all others are 0)
     * multiply outer element with underlying image pixel element
     * if same image pixel element is returning, it means the image element is intersecting with kernel.
     * 
     * BASED ON INTERSECTIONS:
     * 
     * 4 intersection- Not a juntion
     * 6 intersection- Juntion of 3 roads
     * 8 intersections- junction of 4 roads
     * Like that....
     */

    loop1:
    for (let i=0; i<points.length; i++){

        

        if (points[i]===255){

            let x= (i%imgW);
            let y= Math.floor((i/imgW));
            
            count+=1;

            loop2:
            for (let j=25; j<=31; j+=2){

                let imgWindow=[];
                let kernelSize= j;
                let intersection=0;
                let kernel= createCicrcularKernel(j);

                for (let k=0-Math.floor((kernelSize/2)); k<=Math.floor(kernelSize/2); k++){
                    let p,q;
                    for (let l=0-Math.floor((kernelSize/2)); l<=Math.floor(kernelSize/2); l++){
        
                        p=x+k;
                        q=y+l;
                        let pos= (q*imgW+p);
                        imgWindow.push(edges[pos]);
                    }
                }

                for (let m=0; m<j; m++){
                    for (let n=0; n<j; n++){

                        if (kernel[m][n]*imgWindow[(m*j)+n]===255){
                            intersection+=1;
                        }
                        
                    }
                }

                if (intersection>=8){
                    intersections.push(i);
                    points[i]=0; //Remove intersected points from the eroded points now to keep only points representing roads in between
                    break loop2;
                }
  

            }

        }

    }

    /**
     * ________________________________________LINE EXTRACTION________________________________________________________________
     * 
     * Takes the eroded data (junction points are removed)
     * Takes a point>> Runs a window kernel to check adjacent pixel>> if present-appends to array
     * Once appended point is removed
     * Continues till all points are covered
     * Once it completes, all points are converted to coordinates
     * line geojson file is created
     */

    let line= { //geojson object for storing lines

        "type":"FeatureCollection",
        "name":"lines",
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


    let residualImageData= new Uint8ClampedArray(data.length);

    for (let i=0, j=0; i<residualImageData.length; i+=4,j++){

        residualImageData[i]=points[j];
        residualImageData[i+1]=0;
        residualImageData[i+2]=0;
        residualImageData[i+3]=255;
    }

    let residualImage= new ImageData(residualImageData, imgW, imgH);

    let contourData= getContours(residualImage);

    //let result=lineContourOperations(contourData,imgW,extent,pixelWidth,pixelHeight,line);
    let result=1;
    /**
     * Returning both generated junctions and line segments
     */

    let junctions= createJunctions(intersections,imgW,extent,pixelWidth,pixelHeight);

    return [junctions,result];

}

function lineContourOperations(contourData,imgW,extent,pixelWidth,pixelHeight,line){

    let contours= contourData.contour;
    let colors= contourData.color;
    let featurePixel= {}; //Object for storing array of pixel's position where each inner array contain pixel position of a single polygon

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

    console.log(Object.keys(featurePixel).length);

    for (const pixPos in featurePixel){
        let tempArr= [];

        for (let j=0; j<featurePixel[pixPos].length; j++){

            //converting contour positions to x-y based from UInt8Array
            let x= (featurePixel[pixPos][j]%imgW);
            let y= Math.floor((featurePixel[pixPos][j]/imgW));

            tempArr.push([x,y]);

        }

        if(tempArr.length<=4){ //if length of contours is less than 4, don't consider
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

        line["features"].push(
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
        


    }

    

    return line;
    

}

function createLine(lineParts, imgW, extent, pixelWidth, pixelHeight){

    let lineSegs= {    //geojson file for storing junction positions

        "type":"FeatureCollection",
        "name":"lines",
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



    //Take the line parts and apply dbscan (at pixel position level)
    for (let i=0; i<lineParts.length; i++){

        let point_data=[];

        for (let j=0; j<lineParts[i].length; j++){

            let x= lineParts[i][j][0];
            let y= lineParts[i][j][1];

            //let x1= extent[0]+ (x*pixelWidth);  
            //let y1= extent[3]- (y*pixelHeight); 

            point_data.push(
                {x:x, y:y}
            );

        }

        let dbScanner= jDBSCAN().eps(10).minPts(5).distance('EUCLIDEAN').data(point_data);
        let clusters= dbScanner();
        let clusterCenters= dbScanner.getClusters();
        console.log(clusterCenters);

        for (let k=0; k<clusterCenters.length; k++){

            let cc= clusterCenters[k];

            let x1= extent[0]+ (cc.x*pixelWidth);  
            let y1= extent[3]- (cc.y*pixelHeight); 

            let coordinates=[x1,y1];

            lineSegs["features"].push(
                {
                    "type":"Feature",
                    "geometry":{
                        "type":"Point",
                        "coordinates":coordinates
                    },
                    "proprties":{
                        "prop":'',
                    }
                },)

        }

        
    }



    return lineSegs;
}

function createJunctions(intersections, imgW, extent, pixelWidth, pixelHeight){

    let junctions= {    //geojson file for storing junction positions

        "type":"FeatureCollection",
        "name":"junctions",
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

    let point_data=new Array(intersections.length);

    for (let i in intersections){

        let x= intersections[i]%imgW;
        let y= Math.floor(intersections[i]/imgW);

        let x1= extent[0]+ (x*pixelWidth);  
        let y1= extent[3]- (y*pixelHeight); 

        point_data[i]={
            x:x1, y:y1
        }

    }

    let dbScanner= jDBSCAN().eps(10).minPts(1).distance('EUCLIDEAN').data(point_data);
    let clusters= dbScanner();
    let clusterCenters= dbScanner.getClusters();

    for (let i=0; i<clusterCenters.length; i++){

        let coordinates=[clusterCenters[i].x, clusterCenters[i].y]
        
        junctions["features"].push(
            {
                "type":"Feature",
                "geometry":{
                    "type":"Point",
                    "coordinates":coordinates
                },
                "proprties":{
                    "prop":'',
                }
            },)
    }

    return junctions;

}

function createKernel(k,size){

    let pad= Math.floor(size/2);

    let kernel = [];
    for (let i = k[0] - pad; i <= k[0] + pad; i++) {
        for (let j = k[1] - pad; j <= k[1] + pad; j++) {
            kernel.push([i, j]);
        }
    }
    return kernel;

}

function createSquareKernel(size){

    let kernel= new Array(size*size);
    for (let i=0; i<=kernel.length; i++){

        if (i===0){
            kernel[i]=1;
        }else if (i!=0 && i<kernel.length){
            if (i%size===0){
                kernel[i]=1;
                kernel[i-1]=1;
            }
        }else {
            kernel[kernel.length-1]=1;
        }      
            
    }
   return kernel; //This is a 1d array
}

function createCicrcularKernel(size){

    let radius= size/2;
    let kernel= [];
    let center= Math.floor(radius);

    for (let i=0; i<size; i++){
        let inner_array=[];
        for (let j=0; j<size; j++){
            inner_array.push(0);
        }
        kernel.push(inner_array);
    }

    for (let i=0; i<size; i++){
        for (let j=0; j<size; j++){

            let a= center-i;
            let b= center-j;
            let c= Math.sqrt(Math.pow(a,2)+Math.pow(b,2));

            let d= center-1;
            let e= Math.sqrt((Math.pow(d,2))+Math.pow(d,2));
            let jpos;

            if (c<=radius && (i===0 | i===size-1)){
                //if ((i===0 | j===0) | (i===size-1 | j===size-1)){
                kernel[i][j]=1;
                //}
            }else if(c<=radius){
                kernel[i][j]=1;
                jpos=j;
                kernel[i][size-1-jpos]=1;
                break;
                
            }
        }
    }

return kernel; //This is a 2d array

}