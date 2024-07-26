/**
 * JS code to detect antialiased pixels from an imageData
 * Based on the paper- Anti-aliased Pixel and Intensity Slope Detector- V. Vyšniauskas
 * This code converts RGB to YIQ values for calculating change in intensity therefore making the whole calculation more perfect
 * 
 * 
 * @param {ImageData} imageData
 * @param {ImageData} outputData
 * @param {Number} width
 * @param {Number} height
 * @param {Object} options
 * @returns {ImageData}
 */

import { rgbToyiq } from "../imageProcessing/yiqRange";


export function detectAntiAliasPixels(imageData,width, height, options){

    /**
     * Assuming that the edge-most pixels of image don't contains anti-aliased pixels 
     * and therefore kernel will start from i+1 and j+1 position assuming i and j are 0.
     * And also, kernel will move till i-1 and j-1 position
     */

    let aaColor= options.aaColour || [0,0,0,255];
    let mergeAA= options.merge || false;

    let outputData= new ImageData(width, height);


    for (let i=1; i<width-1; i++){
        for (let j=1; j<height-1; j++){

            let antialiased=false;
            let pos= ((j*width)+i); 
            let anchorPosition= pos*4;
            let anchorValueRGB= [imageData.data[anchorPosition],imageData.data[anchorPosition+1],imageData.data[anchorPosition+2]];
            let anchorValueYIQ= rgbToyiq(anchorValueRGB[0]/255, anchorValueRGB[1]/255, anchorValueRGB[2]/255);

            let adjacentValues= findAdjacentPixels(pos, width, height, imageData,'yiq');

            //if the adjacentValues array contains more than 2 values with anchorValueYIQ, its NOT ANTI-ALIASED

            let zeros=0;
            for (let k=0; k<adjacentValues.length; k++){
                if (distanceInYIQ(anchorValueYIQ, adjacentValues[k])===0) zeros++;
            }

            if (zeros>2){
                antialiased=false;
            }else {
                antialiased=true;
            }

            if (antialiased===true){  //case-1

                outputData.data[anchorPosition]=aaColor[0];
                outputData.data[anchorPosition+1]=aaColor[1];
                outputData.data[anchorPosition+2]=aaColor[2];
                outputData.data[anchorPosition+3]=aaColor[3];

            }  
        }
    }

    return outputData;

}

function findAdjacentPixels(anchorPosition, width, height, imageData, colorSpace){

    let adjacentValues=[];

    let x= (anchorPosition%width);
    let y= Math.floor(anchorPosition/width);
    //console.log(x,y);

    //creating a 3*3 kernel and extracting adjacent values

    for (let i= x-1; i<=x+1; i++){
        for (let j= y-1; j<=y+1; j++){

            let pixpos= ((j*width)+i)*4;
            if (pixpos===anchorPosition) continue;
            let pixelRGB= [imageData.data[pixpos],imageData.data[pixpos+1],imageData.data[pixpos+2],imageData.data[pixpos+3]];
            
            if (colorSpace==='yiq'){
                let pixelYIQ= rgbToyiq(pixelRGB[0]/255, pixelRGB[1]/255, pixelRGB[2]/255);
                adjacentValues.push(pixelYIQ);
            }else if (colorSpace==='rgb'){
                adjacentValues.push(pixelRGB);
            }
            
        }
    }

    return adjacentValues;

}

let distanceInYIQ= (yiq1, yiq2)=>{

    let dis= Math.sqrt(                                        
        0.5053*(Math.pow((yiq1[0]-yiq2[0]),2))+
         0.299*(Math.pow((yiq1[1]-yiq2[1]),2))+
         0.1957*(Math.pow((yiq1[2]-yiq2[2]),2))
        );

    return dis;
}



