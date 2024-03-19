
export function junctionExtract(edgeData, imgW, imgH, kernelSize){

    /**
     * Take canny edge filtered data
     * Runs a kernel (depending on road size) over the image pixel by pixel
     * only the outer shell of the kernel is populated (with 1 and all others are 0)
     * multiply outer element with underlying image pixel element
     * if same image pixel element is returning, it means the image element is intersecting with kernel.
     * 
     * BASED ON INTERSECTIONS:
     * 
     * 4 intersection- Not a juntion
     * 6 intersection- Juntion of 3 roads
     * 8 intersections- junction of 4 roads
     * Like that....
     */
    for (let i=0; i<edgeData.length; i++){

        let intersectionCount=[];

        let anchorPoint= i;
        let x= (i%imgW);
        let y= Math.floor((i/imgW));

        let kernel= createSquareKernel(kernelSize);
        let kernelCenter= (kernelSize-1)/2;

        let imgWindow= [];

        for (let j=0-Math.floor((kernelSize/2)); j<=Math.floor(kernelSize/2); j++){
            let p,q;
            for (let k=0-Math.floor((kernelSize/2)); k<=Math.floor(kernelSize/2); k++){

                p=x+j;
                q=y+k;
                let pos= (q*imgW+p);
                imgWindow.push(edgeData[pos]);
            }
        }

        for (let l=0; l<(kernelSize*kernelSize); l++){

            if (imgWindow[l]*kernel[l]===255){

                intersectionCount.push(1);
            }

        }
        if(intersectionCount.length>=6){
            console.log([x,y]);
        }



    }

}

function createSquareKernel(size){

    let kernel= new Array(size*size);
    for (let i=0; i<=kernel.length; i++){

        if (i===0){
            kernel[i]=1;
        }else if (i!=0 && i<kernel.length){
            if (i%size===0){
                kernel[i]=1;
                kernel[i-1]=1;
            }
        }else {
            kernel[kernel.length-1]=1;
        }      
            
    }
   return kernel;
}

function createCicrcularKernel(size){

    let radius= size/2;
    let kernel= new Array(size*size);



}