import { jDBSCAN } from "../algorithms/jDBScan";
import { euclideanDistance } from "../utils";
import { sortContourPixels } from "./imageToPolygon";

let lll=0; let jjj=0;

export function junctionExtract1(data, imgW, imgH, extent){

       /**
     * ______________________________________LINEAR FEATURE EXTRACTION_________________________________________________
     * 
     * Take canny edge filtered data + eroded data
     * Runs a kernel (depending on road size) over the image pixel by pixel
     * Kernel will follow the linear feature
     * only the outer shell of the kernel is populated (with 1 and all others are 0)
     * multiply outer element with underlying image pixel element
     * if same image pixel element is returning, it means the image element is intersecting with kernel.
     * If it is intersecting with more (threshold) numbers of points, which means it is a JUNCTION
     * 
     * Since no algorithms are perfect, there will be many junctions bcos a width of eroded road
     * So using DBSCAN algorithm, nearby junctions are clustered and replaced with one junction
     * 
     * So points which are not junctions are part of LINE SEGMENTS between these junctions
     * 
     *
     * 
     * 
     */

   

    let minSize= 25;
    let maxSize=31;
    let featureLeft=true;
    let points=[];
    let ip;
    
    let linePointArray=[]; //main array for storing all linear points
    let junctionArray=[]; //stores only points which qualifies as junctions from linearray
    let lineSegArray=[]; //stores only line segments from line array
    let linParts=[];

    let edges=[];
    let count=0;
    let pixelWidth= (extent[2]-extent[0])/imgW;
    let pixelHeight= (extent[3]-extent[1])/imgH;


    for (let i=0; i<data.length; i+=4){
        
        points.push(data[i]); //eroded part
        edges.push(data[i+1]); //canny edge part
        

    }
    
    for (let i=0; i<points.length;i++){ 
        if (points[i]===255){
            count+=1;
        }
    }


    function initializeSearch(){
        let pnt;
        for (let i=0; i<points.length; i++){
            if (points[i]===255){
                let x= (i%imgW);
                let y= Math.floor((i/imgW));
                pnt=[x,y];
                break;
            }
        }
        return pnt;

    }

    

    function isJunction(anchorPoint){
        let ij=false;

        let x= anchorPoint[0];
        let y= anchorPoint[1];

        for (let j=minSize; j<=maxSize; j+=2){

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
                ij=true;
               //Remove intersected points from the eroded points now to keep only points representing roads in between
                break;
            }
        }

        return ij;
        
    }


    function extractor(ip){

        if (lineSegArray.length!=0){
            linParts.push([...lineSegArray]);
            lineSegArray=[];
            linePointArray=[];
        }

        linePointArray.push(ip);

        for (let i=0; i<count; i++){

            if (linePointArray[i]===undefined){
                break;
            }
    
            let x= linePointArray[i][0];
            let y= linePointArray[i][1];
            let actualPos= (y*imgW)+x;
            let jf=false;

            //Check the point is junction or line segment. Then find next point adjacent to it and add to lineArray
    
            if(isJunction([x,y])===true){
    
                junctionArray.push([x,y]);
                points[actualPos]=0;
                jf=true;

                if ((lineSegArray.length!=0) && (lineSegArray.length>=30)){
                    linParts.push([...lineSegArray]);
                    lineSegArray=[];
                }
    
            }else{
                
                //Actually here if it is not junction then throw it to line, not even checking the connection. that is problem
                lineSegArray.push([x,y]);
                points[actualPos]=0;
                
                
            }
    
    
            let adjacentPoints= createKernel([x,y], 3); 
            let adjOK=[];
    
            for (let j=0; j<adjacentPoints.length;j++){
                let pos_1;
                let x_1= adjacentPoints[j][0];
                let y_1= adjacentPoints[j][1];
    
                if((x_1>=0) && (y_1>=0)){
                    pos_1= (y_1*imgW)+x_1;
                }
    
                if (points[pos_1]===255){
                    adjOK.push([x_1,y_1]); //adjacent points with 255

                    //so there will be multiple adjacent points. We add these to lineArray
                    //console.log(adjOK,'adjok');
                    for (let k=0; k<adjOK.length;k++){
    
                        let isThere=false;
            
                        for (let l=0; l<linePointArray.length; l++){
            
                            if ((adjOK[k][0]===linePointArray[l][0]) && (adjOK[k][1]===linePointArray[l][1])){
                                isThere=true;
                                break;
                            }else{
                                isThere=false;
                            }
                        }
            
                        if (isThere===false){
                            linePointArray.push(adjOK[k]);
                        }
            
                    } 
                }
    
            }
    
        }
      
    
    }

    //extractor();

    
    while (featureLeft){
        ip=initializeSearch();
        if (ip===undefined){
            featureLeft=false;

            if ((lineSegArray.length!=0) && (lineSegArray.length>=10)){
                linParts.push([...lineSegArray]);
                lineSegArray=[];
            }

            break;
        }
        extractor(ip);
    }
   
    let lineSegments= createLine(linParts, imgW, extent, pixelWidth, pixelHeight);
    let junction= createJunctions(junctionArray,imgW,extent,pixelWidth,pixelHeight);
    //console.log(junction,'junctions');
    console.log(linParts,'lineseg');

    return [junction,lineSegments];


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

        let x= intersections[i][0];
        let y= intersections[i][1];

        let x1= extent[0]+ (x*pixelWidth);  
        let y1= extent[3]- (y*pixelHeight); 

        point_data[i]={
            x:x1, y:y1
        }

    }

    //Taking the junction and applying dbscan (at coordinate level)

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

function splitArray(arr){
    
    //checks for neighbouring positions, if it is continous leave it, else split it
    let splittedArray= [];
    let tempArray;

    for (let k=0; k<arr.length; k++){
        let fp= arr[k];
        tempArray=[];
        if (fp!=0){

            if (tempArray.length===0){
                tempArray.push(fp);
                arr[k]=0;
            }
        for (let m=0; m<tempArray.length;m++){
            let nearby= createKernel(tempArray[tempArray.length-1],3);
            //console.log(nearby,'nearby');

            for (let i=0; i<nearby.length;i++){
                for (let j=0; j<arr.length;j++){
                    if(nearby[i][0]===arr[j][0] && nearby[i][1]===arr[j][1]){
                        tempArray.push(arr[j]);
                        arr[j]=0;
                    }
                }
            }
        }
        splittedArray.push(tempArray);
        }else {
            continue;
        }
    }

   //console.log(splittedArray,'splitarray');
   return splittedArray;
}
function mergeArray(ret_arr){
    let mergedArray=[];
    for (let i=0;i<ret_arr.length;i++){
        for (let j=1; j<ret_arr.length;j++){
            let last= ret_arr[i].length-1;

            if (ret_arr[i]!=0 && ret_arr[j]!=0){
            
            if(Math.abs(euclideanDistance(ret_arr[i][last],ret_arr[j][0]))<10){
                let temp= ret_arr[i].concat(ret_arr[j]);
                ret_arr[i]=0;
                ret_arr[j]=0;
                mergedArray.push(temp);
            }
        }
        }
    }

    return mergedArray;
}

function cleanLines(lp){

    let returnArray=[];

    for (let i=0; i<lp.length;i++){

        let arrays= splitArray(lp[i]);
        arrays.forEach(element => {
            returnArray.push(element);
        });
    }

    
    let merged= mergeArray(returnArray);
    console.log(returnArray, merged,'returnarray');
    return merged;
}

function createLine(lineParts, imgW, extent, pixelWidth, pixelHeight){

    let cleanLineParts= cleanLines(lineParts);
    

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

    
    let f_id=0;
    for (let i=0; i<cleanLineParts.length; i++){

        if(cleanLineParts[i].length<3){
            continue;
        }
        f_id++;

        let coordinateArray=[];

        for (let j=0; j<cleanLineParts[i].length; j++){

            let x= cleanLineParts[i][j][0];
            let y= cleanLineParts[i][j][1];

            let x1= extent[0]+ (x*pixelWidth);  
            let y1= extent[3]- (y*pixelHeight); 

            let coordinate= [x1,y1];
            coordinateArray.push(coordinate);

        }
        lineSegs["features"].push(
            {
                "type":"Feature",
                "geometry":{
                    "type":"LineString",
                    "coordinates":coordinateArray
                },
                "id":f_id,
            },)

        
    }

    return lineSegs;
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