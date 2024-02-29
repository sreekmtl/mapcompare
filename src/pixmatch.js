import * as pm from 'pixelmatch';


function colorCompare(imgData, tileW, tileH){

    let refData= new ImageData(tileW, tileH);
    for (let i=0; i<refData.data.length;i++){
        refData.data[i]=255;
    }

    console.log(refData, 'refdata');

    let outputData= new ImageData(tileW,tileH)
    pm(imgData.data, refData.data, outputData.data, tileW, tileH, {threshold:0.1, includeAA:true, aaColor:[255,0,0], diffColor:[0,255,0] });
    return outputData;

}

export {colorCompare};