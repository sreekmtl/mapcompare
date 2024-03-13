/**
 * Utility functions
 */

import { createChart } from "./chart";

function getChannels(imgDataArray){

    let rgbArray=[];

    for (let i=0; i<imgDataArray.length; i+=4){

        let R= imgDataArray[i];
        let G= imgDataArray[i+1];
        let B= imgDataArray[i+2];
        let A= imgDataArray[i+3];

        rgbArray.push([R,G,B]);


    }

    return rgbArray;

    
}

function extractChannel(imgDataArray, channelName){

    let c;
    let channelArray=[];

    if (channelName==='R'){
        c=0;
    }else if (channelName==='G'){
        c=1;
    }else if (channelName==='B'){
        c=2;
    }else if (channelName==='A'){
        c=3;
    }

    for (let i=c; i<imgDataArray.length; i+=4){

        channelArray.push(imgDataArray[i]);

    }

    return channelArray;

}

function colorFromPixel(pixPos, imgDataArray, width, height){

    let rgbArray= getChannels(imgDataArray);
    let pos= (pixPos[1]*width)+pixPos[0];
    let colorRGB= rgbArray[pos];

    return colorRGB;

}

function findMode(kernel){

    //Finds the mode value frm the kernel

    let count={};
    let mode=0;

    for (let i=0; i<kernel.length; i++){

        if (kernel[i].toString() in count){

            count[(kernel[i]).toString()]+=1;
            
            if (count[(kernel[i]).toString()]> mode){
                mode= kernel[i];
            }

        } else {

            count[(kernel[i]).toString()]=1;

        }

    }

    return mode;

}


function imageCovariance(imageData1, imageData2){

    let dataArray1= getChannels(imageData1.data);
    let dataArray2= getChannels(imageData2.data);

    let cBand1= new Array(dataArray1.length);
    let cBand2= new Array(dataArray2.length);

    for (let i=0; i<dataArray1.length; i++){
        if(dataArray1[i][0] && dataArray1[i][1] && dataArray1[i][2]===255){
            cBand1[i]=255;
        }else{
            cBand1[i]=0;
        }
    }

    for (let i=0; i<dataArray2.length; i++){
        if(dataArray2[i][0] && dataArray2[i][1] && dataArray2[i][2]===255){
            cBand2[i]=255;
        }else{
            cBand2[i]=0;
        }
    }

    let N= cBand1.length;
    let Xbar= cBand1.reduce((a,c)=>a+c)/N;
    let Ybar= cBand2.reduce((a,c)=>a+c)/N;
    let covData= new Array(N);

    for (let i=0; i<N; i++){

        covData[i]= ((cBand1[i]-Xbar)*(cBand2[i]-Ybar))/N;
    }

    //let covImage= new ImageData(300, 300, );

    let min= Math.min(...covData);
    let max= Math.max(...covData);
    console.log(min, max, covData);

    createChart(covData);
 

    return 1;
    
}

export {getChannels, colorFromPixel, extractChannel, findMode, imageCovariance};