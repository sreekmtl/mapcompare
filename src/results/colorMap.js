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


export function getColorComponents(classData){

    //add rest of the colors to each classes based on distance in mapToClass
    let colorArray= getKeys(classData);
    let hueArray= getHue(colorArray);
    let saturationArray= getSaturation(colorArray);
    let lightnessArray= getLightness(colorArray);

    let sortedComponents= sortComponent(hueArray,saturationArray,lightnessArray,colorArray);
    let distanceArray= getDistanceBetweenColors(sortedComponents.colorArray);

    return {
        colorArray:sortedComponents.colorArray,
        distanceArray:distanceArray,
        hueArray:sortedComponents.hueArray,
        saturationArray:sortedComponents.saturationArray,
        lightnessArray:sortedComponents.lightnessArray,
    }
}

let getHue= (colorArray)=>{

    let hueArray=[];

    colorArray.forEach(c=>{
        let rgba= c;
        let yiq= rgbToyiq(rgba[0]/255,rgba[1]/255,rgba[2]/255);

        let I= yiq[1];
        let Q= yiq[2];

        let hue= (Math.atan2(I,Q))*(180/Math.PI);
        if (hue<0) hue= 360+hue;
        hueArray.push(Number(hue.toFixed(2)));
    });
    
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

function sortComponent(hueArray,saturationArray,lightnessArray,colorArray){

    /**
     * Sort components along with repective color in color array
     */
  
    for (let i=0; i<hueArray.length; i++){
        for (let j=i+1; j<hueArray.length; j++){
  
            if(hueArray[j]<hueArray[i]){
  
                let temp= hueArray[i];
                hueArray[i]=hueArray[j];
                hueArray[j]=temp;
  
  
                let temp1= saturationArray[i];
                saturationArray[i]=saturationArray[j];
                saturationArray[j]=temp1;
  
                let temp2= lightnessArray[i];
                lightnessArray[i]=lightnessArray[j];
                lightnessArray[j]=temp2;
  
  
                let temp3= colorArray[i];
                colorArray[i]=colorArray[j];
                colorArray[j]=temp3;
                
            }
        }
    }
    return {
      hueArray:hueArray,
      saturationArray:saturationArray,
      lightnessArray:lightnessArray,
      colorArray:colorArray,
    };
  }
  