
/**


function sortContourPixels(positionArray){

    /**
     * Sort points in location array such that
     * arrange point in an order in order to create a polygon out of these points
     * Here I am implementing it in clock-wise order
     * FOR THAT :
     * Take first pixel position 
     * initialize a 3*3 kernel with values represent pixel position w.r.t central pixel which is our first pixel
     * search for any random position in kernel and check whether it is present in our array of locations. If not-> Exit, Else:
     * Add that point next to first point, move kernel to the new point. Continue...
     

    let posArray= positionArray.slice();
    let sortedArray=[];
    let ip= posArray[0]; //initial point
    posArray[0]=[NaN]; 
    sortedArray.push(ip);
    console.log(posArray, 'pos');

    function kernel(k){return [[k[0]-1, k[1]-1],[k[0], k[1]-1],[k[0]+1, k[1]-1],
        [k[0]-1, k[1]],k,[k[0]+1, k[1]],
        [k[0]-1, k[1]+1],[k[0], k[1]+1],[k[0]+1, k[1]+1]];
    }

    loop1:
    for (let k=0; k<sortedArray.length; k++){
        let ker= kernel(sortedArray[k]);

        loop2:
        for (let j=0; j<ker.length; j++){

            loop3:
            for (let i=1; i<posArray.length; i++){

                if (j===4){ //if kernel center, its same. So break
                    break loop3;
                }

                if (((ker[j][0]===posArray[i][0]) && (ker[j][1]===posArray[i][1])) && ((posArray[i][0]!=NaN && posArray[i][1]!=NaN))){ //checking current pos equals any element in kernel

                    if (k===0){
                        sortedArray.push(positionArray[i]);
                        posArray[i]=[NaN,NaN];
                        break loop2;

                    }else {
        
                        sortedArray.push(positionArray[i]);
                        posArray[i]=[NaN,NaN];
                        break loop2;
                        
                    }

        
                }

            }

        }

        if (sortedArray.length===posArray.length){
            break;
        }

    }
    


    return sortedArray;


}

 */