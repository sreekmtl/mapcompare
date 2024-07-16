import { getChannels } from "../utils";
import '../algorithms/kmeans';
import kmeans from "../algorithms/kmeans";
import { colorInRange, rgbToyiq } from "./yiqRange";
import pixelmatch from 'pixelmatch';
import { detectAntiAliasPixels } from "../algorithms/antialiasDetector";
import { findMode } from "../utils";


export default function mapToClass(mapImageData, options){

    let mergeAA= options.merge || false;
    let minimumThreshold= options.threshold || 10

    
    //Take first pixel->YIQ->Extract all-> Assign to class1->assign 0 to covered pixels
    //Take next non-0 pixel-> Do the same
    //Do till everything becomes zero
    //* Filter out anti-aliased pixels or else these pixels appear as seperate class

    //if two seperated classes are closer, then add them together

    console.log(mapImageData,'MapImageData');

    let imageData= detectAntiAlias(mapImageData, mapImageData.width, mapImageData.height);
    let aaremoved= new ImageData(imageData.data.slice(), mapImageData.width, mapImageData.height);
    
    let classes=[];
    
    let temp=[];
    let temp1=[];
    let temp2=[];
    let j=0;


    if (mergeAA){

        /**
         * If anti-aliasing merging is true, this will merge anti-aliased pixel with nearby class
         * A square kernel of size (3,5,7) is moved just though anti-aliased pixel by keeping anti-aliased pixel at the anchor point
         * Then checks for the dominant class and adds the pixel
         */

        for (let i=0; i<imageData.data.length;i+=4){
            if (imageData.data[i]===0 && imageData.data[i+1]===0 && imageData.data[i+2]===0 && imageData.data[i+3]===255){

                let x= (i%aaremoved.width)/4;
                let y= Math.floor((i/aaremoved.width))/4;

                let kernelSize= 5;
                let adjacentPoints= createKernel([x,y], kernelSize);
                let adjacentValues= [];

                for (let j=0; j<adjacentPoints.length; j++){
                    let pos= ((adjacentPoints[j][1]*aaremoved.width)+adjacentPoints[j][0])*4;
                    adjacentValues.push([imageData.data[pos], imageData.data[pos+1], imageData.data[pos+2], imageData.data[pos+3]]);

                }

                temp1.push(adjacentValues);
                let mode= findMode(adjacentValues);
                temp2.push(mode);
                imageData.data[i]=mode[0];
                imageData.data[i+1]=mode[1];
                imageData.data[i+2]=mode[2];
                imageData.data[i+3]=mode[3];

                   
            }
        }

        
    }



    for (let i=0; i<imageData.data.length; i+=4){

        if (imageData.data[i]===0 && imageData.data[i+1]===0 && imageData.data[i+2]===0 && imageData.data[i+3]===255){
            continue;
        }else {
            let selectedColor= [imageData.data[i],imageData.data[i+1],imageData.data[i+2]];
            let sc=[imageData.data[i],imageData.data[i+1],imageData.data[i+2], imageData.data[i+3]];
            //console.log(selectedColor,'selectedcolor');
            let cir= colorInRange(imageData, selectedColor, 0);
            let colorClass= cir[0];
            let classPixelCount= cir[1];
            if (classPixelCount>=100){ //Large classes
                j++;
                let key= sc.toString();
                let classObj={};
                classObj[key]= [colorClass.data, classPixelCount];
                classes.push(classObj);

            } else if (classPixelCount<minimumThreshold){
                continue;

            } else { //Small classes
                /**
                 * If the class is small, it wont get into intial filtering. So here we are going to use a trick....
                 * The trick is, the classes are represented by pure pixels and pure pixels will have alpha channel= 255
                 * So RGB color with alpha 255 is extracted. Then the whole pixels belonging to those classes are extracted
                 * 
                 * There will be still pixels left out and we have to add those based on nearest position in color space
                 */

                if (sc[3]===255){
                    let key= sc.toString();
                    let classObj={}
                    classObj[key]= [colorClass.data, classPixelCount];
                    classes.push(classObj);
                }else {
                    let key= sc.toString();
                    let classObj={}
                    classObj[key]= [colorClass.data, classPixelCount];
                    temp.push(classObj);
                }

            }
            

            for (let i=0; i<colorClass.data.length; i+=4){
                if (colorClass.data[i]===255 && colorClass.data[i+1]===0 && colorClass.data[i+2]===0 && colorClass.data[i+3]===255){
                    imageData.data[i]=0;
                    imageData.data[i+1]=0;
                    imageData.data[i+2]=0;
                    imageData.data[i+3]=255;
                }
           
            } 
            
        }  

    }

    
    console.log(classes, 'class');
    console.log(temp,'temp');
    console.log(temp1,'temp1');
    console.log(temp2,'temp2');
    return [classes,aaremoved];


}

function detectAntiAlias(imageData, width, height){

    let count=0;

    let opdat= detectAntiAliasPixels(imageData, width, height,{aaColor:[0,0,0,255], merge:false});
    console.log(opdat,'OPDAT');

  //assign these anti-aliased pixel to the nearest class using yiqrange
  //nearest class is found using: take all black pixels, find it original color, assign to other class based on distance.

  for (let i=0; i<imageData.data.length;i+=4){
    if ((opdat.data[i]===0 && opdat.data[i+1]===0 && opdat.data[i+2]===0 && opdat.data[i+3]===255)){ //position of anti-aliased pixel
        count++;
        
        imageData.data[i]=0; 
        imageData.data[i+1]=0; 
        imageData.data[i+2]=0; 
        imageData.data[i+3]=255; 
        
       
    }
  }
    console.log('no of anti-aliased pixels: ', count);
    return imageData;
}

let createKernel= (k, size)=>{

    let pad= Math.floor(size/2);

    let kernel = [];
    for (let i = k[0] - pad; i <= k[0] + pad; i++) {
        for (let j = k[1] - pad; j <= k[1] + pad; j++) {
            if((i>=0 && j>=0) && (!(i===k[0] && j===k[1]))){
                kernel.push([i, j]);
            }
            
        }
    }
    return kernel;

}

