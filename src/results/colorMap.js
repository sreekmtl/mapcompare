/**
 * THIS FILE CHECKS THE VISUALIZATION QUALITY OF THE MAP, VISUALIZATION QUALITY CONSISTS OF MULTIPLE FACTORS.
 * HERE WE ARE ONLY CONSIDERING THE COLOR SCHEME USED.
 * 
 * This file checks how the colorMap is varying through each map
 * Therefore the user could check the logical connection between color variation with data variation
 * Mainly scietific vis schemes are divided into: (Recommended properties in brackets) Color space means a percieved color space
 * 
 * QUALITATIVE (Distance between colors should be same) Eg: LULC Maps
 * SEQUENTIAL (Single Hue with Varying lightness/ Multiple Hues with a percieved order) Eg: Rainfall map
 * DIVERGING  (Single Hue in center with multiple hues on both side which have a percieved order) Eg: Temperature map
 * 
 * So this code generates the colors used, its Hue, Saturation and Lightness component and also the distance between them.
 * So that the user could compare it with the underlying structure of data and can decide whether the visualization is good or not.
 */

import { rgbToyiq } from "../imageProcessing/yiqRange";


export function getColorComponents(classData1, classData2){
    //add rest of the colors to each classes based on distance in mapToClass
    let colorArray1= getKeys(classData1);
    let colorArray2= getKeys(classData2);

    let distanceArray1= getDistanceBetweenColors(colorArray1);
    let distanceArray2= getDistanceBetweenColors(colorArray2);

    let hueArray1= getHue(colorArray1);
    let hueArray2= getHue(colorArray2);

    let saturationArray1= getSaturation(colorArray1);
    let saturationArray2= getSaturation(colorArray2);

    let lightnessArray1= getLightness(colorArray1);
    let lightnessArray2= getLightness(colorArray2);

    //console.log(distanceArray1,distanceArray2, 'distances');
    //console.log(hueArray1,hueArray2, 'hue');
    //console.log(saturationArray1, saturationArray2, 'saturation');
    //console.log(lightnessArray1,lightnessArray2, 'lightness');

    return {
        colorArray1:colorArray1,
        colorArray2:colorArray2,
        distanceArray1:distanceArray1,
        distanceArray2:distanceArray2,
        hueArray1:hueArray1,
        hueArray2:hueArray2,
        saturationArray1:saturationArray1,
        saturationArray2:saturationArray2,
        lightnessArray1,lightnessArray1,
        lightnessArray2:lightnessArray2
    }
}

let getHue= (colorArray)=>{

    let hueArray=[];

    colorArray.forEach(c=>{
        let rgba= c;
        let yiq= rgbToyiq(rgba[0]/255,rgba[1]/255,rgba[2]/255);

        let I= yiq[1];
        let Q= yiq[2];

        let hue= (Math.atan(Q/I))*(180/Math.PI);
        hueArray.push(hue.toFixed(2));
    })
    return hueArray;
}

let getSaturation= (colorArray)=>{

    let saturationArray=[];

    colorArray.forEach(c=>{
        let rgba= c;
        let yiq= rgbToyiq(rgba[0]/255,rgba[1]/255,rgba[2]/255);

        let I= yiq[1];
        let Q= yiq[2];

        let saturation= Math.sqrt((I*I)+(Q*Q));
        saturationArray.push(saturation.toFixed(2));
    })
    return saturationArray;

}

let getLightness= (colorArray)=>{

    let lightnessArray=[];

    colorArray.forEach(c=>{
        let rgba= c;
        let yiq= rgbToyiq(rgba[0]/255,rgba[1]/255,rgba[2]/255);

        let Y= yiq[0]; //Y is lightness component
        lightnessArray.push(Y.toFixed(2));
    })
    return lightnessArray;
}

let getDistanceBetweenColors= (colorArray)=>{

    let distanceArray=[];

    for (let i=0; i<colorArray.length; i++){
        for (let j=0; j<colorArray.length; j++){

            let yiq_i= rgbToyiq(colorArray[i][0]/255,colorArray[i][1]/255,colorArray[i][2]/255,colorArray[i][3]/255);
            let yiq_j= rgbToyiq(colorArray[j][0]/255,colorArray[j][1]/255,colorArray[j][2]/255,colorArray[j][3]/255);

            let dis= distanceInYIQ(yiq_i,yiq_j);
            distanceArray.push({c1:colorArray[i].toString(), c2:colorArray[j].toString(), dis:dis});

        }
    }

    return distanceArray;

}

let distanceInYIQ= (yiq1, yiq2)=>{

    let dis= Math.sqrt(                                        
        0.5053*(Math.pow((yiq1[0]-yiq2[0]),2))+
         0.299*(Math.pow((yiq1[1]-yiq2[1]),2))+
         0.1957*(Math.pow((yiq1[2]-yiq2[2]),2))
        );

    return dis;
}


function getKeys(colorData){

    let colorArray=[];
    
    colorData.forEach(e => {
        let key= Object.keys(e);
        key= key.toString();
        let components= key.split(',');
        let rgba=[];
        components.forEach(el=>{
            rgba.push(parseInt(el));
        })
        colorArray.push(rgba); 
    });

    return colorArray;
}