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


export function getColorComponents(imageData){
//add rest of the colors to each classes based on distance in mapToClass
}

let getHue= ()=>{

}

let getSaturation= ()=>{

}

let getLightness= ()=>{

}

let getDistanceBetweenColors= ()=>{

}