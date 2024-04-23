

/**
 * 
 * @param {ImageData} data1 
 * @param {ImageData} data2 
 * @param {Number} num1 //Number of classes in map1
 * @param {Number} num2 //Number of classes in map2
 * @returns {Number} GOF //Returns Goodness Of Fit
 */

export function mapCurves(data1, data2, num1, num2){

    let GOF=0;
    let classes_map1;
    let classes_map2;

    for (let i=0; i<num1; i++){

        let Ai= classes_map1[i];
        let Ci= overlappedArea(Ai, data2);

        let insidness_deno=0;

        for (let j=0; j<num2; j++){
            //let Bj= classes_map2[j];
            insidness_deno+= (Bj+Ci);
        }

        let Ii= Ci/(insidness_deno);

        let Wi= Ii* (Ci/(Ai+Ci));

        GOF+= Wi;
    }
    
    return GOF;
}

function overlappedArea(dataClass, data){

}