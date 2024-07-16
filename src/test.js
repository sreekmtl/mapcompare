function findMode(kernel){

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

console.log(findMode([[1,3,2],[1,3,2],[2,3,1],[1,3,2]]));