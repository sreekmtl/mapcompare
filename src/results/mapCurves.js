

/**
 * 
 * @param {ImageData} data1 
 * @param {ImageData} data2 
 * @param {Number} num1 //Number of classes in map1
 * @param {Number} num2 //Number of classes in map2
 * @returns {Number} GOF //Returns Goodness Of Fit
 */

export function mapCurves(class1,class2,areaPerPixel){
    console.log(areaPerPixel,'app');

    //class1 and class2 contains rgb as key and uint8clampedarray as value
    //this uint8clampedarray contains image data of the particular class
    //for easy computation, this array can be converted to binary form
    //Therefore it easy to calculate class overlaps and other factors

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


    //now calculating the Goodness Of Fit
    let totalAreaOfMap= 300*300*areaPerPixel;

    let GOF=0;

    for (let i=0; i<num1; i++){

        let Ai= classArray1[i];
         //since both maps is having same size, overlapped area of particular class with the second map is the area of the class itself
        let Ci= areaofClass(Ai, areaPerPixel);
        let insidness_deno=0;

        for (let j=0; j<num2; j++){
            let B_class= classArray2[j];
            let Bj= areaofOverlap(B_class, Ai, areaPerPixel);
            insidness_deno+= (Bj+Ci);
        }

        let Ii= Ci/(insidness_deno);
        //console.log(Ii,'ii');

        let Wi= Ii* (Ci/(2*Ci));

        GOF+= Wi;
    }
    
    return GOF;
}

function areaofClass(dataClass, areaPerPixel){

    let count=0;
    for (let i=0; i<dataClass.length;i++){
        if (dataClass[i]===1){
            count+=1;
        }else{
            continue;
        }
    }

    let area= count*areaPerPixel;

    return area;

}

function areaofOverlap(B_class, Ai, areaPerPixel){

    //calculates area of overlap of each class of B over Ai
    //To check overlap, adds two arrays. since these are binary arrays, array position with value 2 is spatially overlapped

    let overlappedArea=0;

    for (let i=0; i<B_class.length; i++){
        if (B_class[i]+Ai[i]===2){
            overlappedArea+=1;
        }
    }
    
    //console.log(overlappedArea,'oa');
    overlappedArea= overlappedArea*areaPerPixel;

    return overlappedArea;

}