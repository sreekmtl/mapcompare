/**
 * 
 * @param {ImageData} imageData Map tile data
 * @param {Array} selectedColor User selected color of pixel from map
 * @param {Number} sensitivity
 * @returns {ImageData} diffImage
 * 
 * This returns all the pixels with value lying in given range in YIQ space
 */


function colorInRange(imageData, selectedColor, sensitivity){

    let diffData= [];
    let diffImg= new ImageData(imageData.width, imageData.height);

    let colorSelected= [
        rgb2y(selectedColor[0], selectedColor[1], selectedColor[2]),
        rgb2i(selectedColor[0], selectedColor[1], selectedColor[2]),
        rgb2q(selectedColor[0], selectedColor[1], selectedColor[2])

    ];

    console.log(colorSelected, 'inYIQ');


    for (let i=0; i<imageData.data.length;i+=4){

        let r= imageData.data[i];
        let g= imageData.data[i+1];
        let b= imageData.data[i+2];

        let yiq= [
            rgb2y(r,g,b),
            rgb2i(r,g,b),
            rgb2q(r,g,b)
        ];

        let distanceinYIQ= Math.sqrt(                                        //calculating squared distance for efficiency
        0.5053*(Math.pow((yiq[0]-colorSelected[0]),2))+
         0.299*(Math.pow((yiq[1]-colorSelected[1]),2))+
         0.1957*(Math.pow((yiq[2]-colorSelected[2]),2))
        );

        diffData.push(distanceinYIQ);

     
        if (Math.abs(distanceinYIQ)===sensitivity){
            diffImg.data[i]=255;
            diffImg.data[i+3]=255;
        }
        

    }

    //console.log('original YIQ distance', diffData);
    return diffImg;

}

function rgb2y(r, g, b) { return r * 0.29889531 + g * 0.58662247 + b * 0.11448223; }
function rgb2i(r, g, b) { return r * 0.59597799 - g * 0.27417610 - b * 0.32180189; }
function rgb2q(r, g, b) { return r * 0.21147017 - g * 0.52261711 + b * 0.31114694; }

export {colorInRange};