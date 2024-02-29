/**
 * Utility functions
 */

function getChannels(imgDataArray){

    let rgbArray=[];

    for (let i=0; i<imgDataArray.length; i+=4){

        let R= imgDataArray[i];
        let G= imgDataArray[i+1];
        let B= imgDataArray[i+2];
        let A= imgDataArray[i+4];

        rgbArray.push([R,G,B]);


    }

    return rgbArray;

    
}

function colorFromPixel(pixPos, imgDataArray, width, height){

    let rgbArray= getChannels(imgDataArray);
    let pos= (pixPos[1]*width)+pixPos[0];
    let colorRGB= rgbArray[pos];

    return colorRGB;

}

export {getChannels, colorFromPixel};