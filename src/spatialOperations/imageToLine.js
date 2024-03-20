import { jDBSCAN } from "../algorithms/jDBScan";


export function junctionExtract(data, imgW, imgH, extent){

   
    let points=[];
    let roadPoints=[];
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

        let x= (i%imgW);
        let y= Math.floor((i/imgW));

        if (points[i]===255){
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

    for (let i=0; i<points.length;i++){
        let lineArray=[];
        if(points[i]===255){
            
            let x= i%imgW;
            let y= Math.floor(i/imgW);

            let ker= createKernel([x,y], 5);

            
        }
    }

    console.log(count);
    console.log(intersections);



    /**
     * Returning both generated junctions and line segments
     */

    let junctions= createJunctions(intersections,imgW,extent,pixelWidth,pixelHeight);

    return junctions;

}

function createLines(){

    let lines= { //geojson object for storing lines

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