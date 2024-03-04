


function findMode(kernel, kernelSize){

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

function convolution(paddedImageData, kernelSize){

    for (let i=(padWidth*padding)+padding; i<paddedImageData.length;i++){

        if (i<(paddedImageData.length-(padWidth*padding))){  


            for (let j=0; j<imageWidth; j++){

                let pos= i+j;
                let kernelCenter= paddedImageData[pos] ;
                let kernel= new Array(kernelSize*kernelSize);
                let el=[]; //Array for storing kernel elements
                let center= (kernel.length/2)-1;
                //el[center]= paddedImageData[pos];

                //Array for filling kernel elements from image
                let kPos= pos- (padWidth+padding); //initial kernel element
                for (let k=0, l=0; k<kernel.length; k++, l++){

                    if ((l+1)%kernelSize===0){
                        kPos= kPos+padWidth; //move to next line of kernel
                        l=0; 
                    }
                    
                    el[k]= paddedImageData[kPos+l];

                }

                kernel= [...el];

                let mode= findMode(kernel, kernelSize);

                paddedImageData[pos]= mode;
    
            }

            i+=imageWidth+ ( (2*padding)-1);
    

        }


    }



}

function modeFilter(kernelSize, imageData, imageWidth, imageHeight){

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

let filteredImageData= convolution(paddedImageData, kernelSize);

let filteredImage= new ImageData(imageWidth, imageHeight);
let q=0;
for (let i=0; i<filteredImageData.length; i++){

    filteredImage.data[q]= filteredImageData[i];
    filteredImage.data[q+3]=255;
    q+=4;
}


    
return filteredImage;

}

