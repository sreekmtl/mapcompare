/**
 * Utility functions
 */

import { createChart } from "./results/chart";

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
    let pos= (Math.floor(pixPos[1])*width)+Math.floor(pixPos[0]);
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

    
    //let Xbar= cBand1.reduce((a,c)=>a+c)/N;
    //let Ybar= cBand2.reduce((a,c)=>a+c)/N;
    let variables= [cBand1, cBand2];
    let N= variables.length;
    let covData= new Array(N*N);
    
    for (let i=0; i<N;i++){
        for (let j=0; j<N;j++){
            let coval= 0;
            let X= variables[i];
            let Y= variables[j];
            let l= X.length;

            let Xbar= X.reduce((a,c)=>a+c)/l;
            let Ybar= Y.reduce((a,c)=>a+c)/l;

            for (let k=0; k<l;k++){

                coval+= ((X[k]-Xbar)*(Y[k]-Ybar))/l;
            }
            covData.push(coval);
        }

        
    }

   

    

    let min= Math.min(...covData);
    let max= Math.max(...covData);
    console.log(min, max, covData);

    //createChart(covData);
 

    return 1;
    
}

function euclideanDistance(p1, p2){

    let distance= Math.sqrt(Math.pow((p2[0]-p1[0]), 2)+ Math.pow((p2[1]-p1[1]), 2));
    return distance;

}

export {getChannels, colorFromPixel, extractChannel, findMode, imageCovariance, euclideanDistance};