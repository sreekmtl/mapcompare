function regionalVariation(segmentArray, homo_arr, numOfClasses){

    /**
     * Regional variation is calculated in terms of shanon entropy
     */

    let entropy_arr=[];
    let len= homo_arr.length;

    let i=0;
    while (i<len){
        let s=0;
        for (let j=0; j<numOfClasses; j++){
            let aij= segmentArray[(i*numOfClasses)+j];
            if (aij!=0){
                s= s+(0-(Math.log2(aij/homo_arr[i]))*(aij/homo_arr[i]));
            }
        }
        entropy_arr.push(s);

        i++;
    }

   return entropy_arr;

}

function zonalVariation(segmentArray, homo_arr, numOfClasses){

    /**
     * Zonal variation is calculated in terms of shanon entropy
     */

    let entropy_arr=[];
    let len= homo_arr.length;

    let i=0;
    while (i<len){
        let s=0;
        for (let j=i; j<segmentArray.length; j+=len){
            let aij= segmentArray[j];
            if (aij!=0){
                s= s+(0-(Math.log2(aij/homo_arr[i]))*(aij/homo_arr[i]));
            }
        }
        entropy_arr.push(s);

        i++;
    }

   return entropy_arr;

}

function domainVariance(classes, A,num){

    /**
     * Variance of regions/zones within domain is calculated here
     * The same function computes both SR and SZ
     */

    let variance=0;

    for (let i=0; i<num; i++){
        if (classes[i]!=0){
            variance+= (0-(Math.log2(classes[i]/A))*(classes[i]/A));
        }
    }

    return variance;

}

seg=[734891.95,1021659.58,37680.32,30582.46,4427.60,69449.57,0,0,6002.37,149237.84,0,0];
let ai=[1824814.32,73877.18,155240.22];
let aj=[745321.94,1240346.99,37680.32,30582.46]
let n=4;
let m=3;
let a=regionalVariation(seg,ai,n);
let b=zonalVariation(seg,aj,m);
let c= domainVariance(aj,2054045.84,4);
console.log(c);