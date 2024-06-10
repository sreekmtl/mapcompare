/**
 * Calculates the v-measure
 */

export function vMeasure(class1, class2, areaPerPixel){

    //class1 and class2 contains rgb as key and uint8clampedarray as value
    //this uint8clampedarray contains image data of the particular class
    //for easy computation, this array can be converted to binary form
    //Therefore it easy to calculate class overlaps and other factors

    //ALL THE NAME USED FOR VARIABLES ARE FROM THE LITEARTURE TO AVOID CONFUSION

    let num1= class1.length; //number of classes in map1
    let num2= class2.length; //number of classes in map2

    let classArray1=[];
    let classArray2=[];

    //converting every uint8clampedarray to binary 

    class1.forEach(element => {
        let key= Object.keys(element);
        let keystring= key.toString();

        let arr= element[key];
        let ui8= arr[0];
        let bi=new Array(ui8.length/4);

        for (let i=0; i<ui8.length; i+=4){

            if (ui8[i]===255 && ui8[i+1]===0 && ui8[i+2]===0 && ui8[i+3]===255){
                bi[Math.floor(i/4)]=1;
            }else{
                bi[Math.floor(i/4)]=0;
            }
        }

        classArray1.push(bi);
        
    });

    class2.forEach(element => {
        let key= Object.keys(element);
        let keystring= key.toString();

        let arr= element[key];
        let ui8= arr[0];
        let bi=new Array(ui8.length/4);

        for (let i=0; i<ui8.length; i+=4){

            if (ui8[i]===255 && ui8[i+1]===0 && ui8[i+2]===0 && ui8[i+3]===255){
                bi[Math.floor(i/4)]=1;
            }else{
                bi[Math.floor(i/4)]=0;
            }
        }

        classArray2.push(bi);
        
    });


    console.log(classArray1, classArray2,'vm');

    let segmentArray= segments(classArray1,classArray2, areaPerPixel);
    console.log(segmentArray,'segments');

    let vm= computeVMeasure(segmentArray, num1, num2, areaPerPixel);

}


function segments(classArray1, classArray2, areaPerPixel){

    /**
     * Divide each class into segments based on overlap between classes from two images
     * Takes first class from first image, then checks the overlap of each classes from second image
     * The overlaped areas are called segments and the area of these segments are stored in a seperate array
     */

    let segmentArray=[];

    for (let i=0; i<classArray1.length; i++){
        for (let j=0; j<classArray2.length; j++){

            let overlappedSegment= new Array(90000);
            let region= classArray1[i];
            let zone= classArray2[j];

            for (let k=0; k<90000; k++){
                if (region[k]+ zone[k]===2){
                    overlappedSegment[k]=1;
                }else{
                    overlappedSegment[k]=0;
                }
            }
        
            segmentArray.push(areaofSegment(overlappedSegment, areaPerPixel));

        }
    }

    return segmentArray;//[13,0,4,0,3,16,0,4,4,4,16,16];
}

function areaofSegment(segmentClass, areaPerPixel){

    let count=0;
    for (let i=0; i<segmentClass.length;i++){
        if (segmentClass[i]===1){
            count+=1;
        }else{
            continue;
        }
    }

    let area= count*areaPerPixel;

    return area;

}

function computeVMeasure(segmentArray, n, m, areaPerPixel){

    let A= 0;
    let B= 90000*areaPerPixel;
    let Ai_arr=[];
    let Aj_arr=[];
    let SRj_arr=[];
    let SZi_arr=[];
    let SR, SZ;
    let h=0
    let c=0;
    let vm;

    //Calculates Regionalization (Aj)
    let i=0;
    while (i<segmentArray.length){
        let Aj=0;
        for (let j=0; j<n; j++){
            Aj=Aj+segmentArray[i+j];
        }
        Aj_arr.push(Aj);

        i+=n;
    }

    //Calculates Zonation (Ai)
    let p=0;
    while (p<n){
        let Ai=0;
        for (let q=p; q<segmentArray.length; q+=n){
            Ai=Ai+segmentArray[q];
        }
        Ai_arr.push(Ai);
        p++;
    }

    //Calculates A
    for (let k=0; k<segmentArray.length; k++){
        A=A+segmentArray[k];
    }


    console.log(Aj_arr, 'Aj');
    console.log(Ai_arr, 'Ai');
    console.log(A, 'A');

    SRj_arr= regionalVariation(segmentArray,Aj_arr,n);
    SZi_arr= zonalVariation(segmentArray,Ai_arr,m);

    SR= domainVariance(Ai_arr, A, n);
    SZ= domainVariance(Aj_arr, A, m);

    for (let x=0; x<m; x++){
        h+= ((Aj_arr[x]/A)*(SRj_arr[x]/SR));
    }

    h= 1-h;

    for (let y=0; y<n; y++){
        c+=((Ai_arr[y]/A)*(SZi_arr[y]/SZ));
    }

    c= 1-c;

    vm= 2*((h*c)/(h+c));
    

    console.log(SRj_arr,'SRj');
    console.log(SZi_arr, 'SZi');
    console.log(SR, 'SR');
    console.log(SZ, 'SZ');
    console.log(h, c, vm, '  vmeasure ');

    return 1;


}

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

