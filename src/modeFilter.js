


function mode(kernel, kernelSize){

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

    return [count, mode];

}

function convolution(paddedImageData, kernelSize){

    for (let i=(padWidth*padding)+padding; i<paddedImageData.length;i++){

        if (i<(paddedImageData.length-(padWidth*padding))){  


            for (let j=0; j<imageWidth; j++){

                let pos= i+j;
                let kernelCenter= paddedImageData[pos] ;
                let kernel= new Array(kernelSize*kernelSize);
                let el=[]; //Array for storing kernel elements
                let center= kernelSize+((kernelSize+1)/2);
                el[center]= paddedImageData[pos];

                //Array for filling kernel elements from image
                let l=0;
                for (let k=0; k<kernel.length; k++){

                    el[k]= paddedImageData[pos- (padWidth+(kernelSize-k))]; 
                    l++;
                    if(l===(kernelSize-1)){

                    

                    }

    

                }

                kernel= [...el];

                let mode= mode(kernel, kernelSize);

                paddedImageData[pos]= mode;
    
            }

            i+=imageWidth+ ( (2*padding)-1);
    

        }


    }



}

function modeFilter(kernel, kernelSize, imageData, imageWidth, imageHeight){

    //Adding padding based on kernel size

    const padding= kernelSize-((kernelSize+1)/2);
    const padWidth= imageWidth+ (2*padding);
    const padHeight= imageHeight+ (2*padding);

    const paddedImageData= new Uint8ClampedArray(padWidth*padHeight);
    console.log(paddedImageData);

    //converting original image to padded image

    let k=0;

    for (let i=(padWidth*padding)+padding; i<paddedImageData.length;i++){

        if (i<(paddedImageData.length-(padWidth*padding))){  


            for (let j=0; j<imageWidth; j++){

                paddedImageData[i+j]= imageData[k];
                k++;
    
            }

            i+=imageWidth+ ( (2*padding)-1);
    

        }


    }
    console.log(k);

// passing the kernel and padded image for convolution    

let filteredImageData= convolution(paddedImageData, kernel, kernelSize);

let filteredImage= new ImageData(padWidth, padHeight);
let q=0;
for (let i=0; i<paddedImageData.length; i++){

    filteredImage.data[q]= paddedImageData[i];
    filteredImage.data[q+3]=255;
    q+=4;
}


    
return filteredImage;

}

export {modeFilter};

//console.log(mode([5,3,5,5,3,5,2,1,3], 3));