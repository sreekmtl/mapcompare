/**
 * Utility functions
 */

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

export {getChannels, colorFromPixel, extractChannel};