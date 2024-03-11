

count={};

count[3]= 2;
console.log(count);
var i=2;
console.log((2).toString() in count);

a=[0,0,0];
b=[2,3,4];
[...a]=[...b];
console.log(a);

let f = new Uint8Array(11*22);
//console.log(f);
console.log(6%3);

let d= new Array(3);
d=[...b];
console.log(d, 'd');

let x= [4,5,6];
let y= [4,5,6];

if ((x[0]===y[0]) && (x[1]===y[1]) && (x[2]===y[2])){

    console.log(true, 'true');

}

console.log(0/3);

let vv={};
vv['l']= [1];
vv['l'].push(2);
console.log(Object.keys(vv).length);

var u= x;
console.log(x-1,'ff');

ip= [10,20];

function kernel(k){return [[k[0]-1, k[1]-1],[k[0], k[1]-1],[k[0]+1, k[1]-1],
    [k[0]-1, k[1]],k,[k[0]+1, k[1]],
    [k[0]-1, k[1]+1],[k[0], k[1]+1],[k[0]+1, k[1]+1]];
}

console.log(kernel([68,1]));

//let c=[4];
//console.log(kernel([19,4]).slice(-1));

function kernel1(k) {
    let result = [];
    for (let i = k[0] - 2; i <= k[0] + 2; i++) {
        for (let j = k[1] - 2; j <= k[1] + 2; j++) {
            result.push([i, j]);
        }
    }
    return result;
}

function sortContourPixels(positionArray){

    /**
     * Sort points in location array such that
     * arrange point in an order in order to create a polygon out of these points
     * Here I am implementing it in clock-wise order
     * FOR THAT :
     * 
     */

    let posArray= positionArray.slice();
    let sortedArray=[];
    let ip= posArray[0]; //initial point
    sortedArray.push(ip);
    posArray[0]=[NaN,NaN]; 
    console.log(posArray, 'pos');
    let i_f=0;
    let sub_factor=posArray.length-1;
    let ii=0; //independent iterator

    function kernel(k){
        let kern= [[k[0]-1, k[1]-1],[k[0], k[1]-1],[k[0]+1, k[1]-1],
        [k[0]-1, k[1]],k,[k[0]+1, k[1]],
        [k[0]-1, k[1]+1],[k[0], k[1]+1],[k[0]+1, k[1]+1]];
    
        return kern; 
       
    }

    loop1:
    for (let k=0; k<=sortedArray.length; k++){
        let il= sortedArray.length;
        let ker= kernel(sortedArray[k]);

        loop2:
        for (let j=0; j<ker.length; j++){  

            loop3:
            for (let i=1; i<posArray.length; i++){

                if (j===4){ //if kernel center, its same. So break
                    break loop3;
                }

                if (((ker[j][0]===posArray[i][0]) && (ker[j][1]===posArray[i][1])) && ((posArray[i][0]!=NaN && posArray[i][1]!=NaN))){ //checking current pos equals any element in kernel

                    
                    
                    sortedArray.push(positionArray[i]);
                    posArray[i]=[NaN,NaN];
                    sub_factor-=1;
                    break loop2;
        
                }
            }

        }

        let fl= sortedArray.length;
        console.log([k, il,fl], 'ilfl');
        if (fl-il===0){
            //console.log(sortedArray[k]);
            let v=sortedArray.pop();
            console.log(v, 'v');
            k=k-2;
            ii+=2;
            i_f+=1;
            console.log(k);
        
        }

        let gap= sub_factor+i_f;
        let limit= posArray.length-gap;

        i

        if(k===(sortedArray.length-(gap))){
            console.log('breaked');
            break;
        }

      

    }

    console.log(sub_factor,'subf');
    console.log(posArray);
    console.log(i_f, 'if');
    console.log(ii,'ii');


    return sortedArray;



}

let pa= [
    [1,0],
    [2,0],
    [3,0],
    [4,0],
    [5,1],
    [5,2],
    [2,2],
    [1,1],
    [3,1],
    [0,1]
];

let qa=[
    [69,0],
    [70,0],
    [71,0],
    [72,0],
    [73,0],
    [74,0],
    [75,0],
    [76,0],
    [77,0],
    [78,0],
    [68,1],
    [78,1],
    [68,2],
    [77,2],
    [67,3],
    [76,3],
    [66,4],
    [75,4],
    [65,5],
    [66,5],
    [74,5],
    [67,6],
    [73,6],
    [74,6], //
    [68,7],
    [72,7],
    [69,8],
    [71,8],
    [70,9]
];
let cc= sortContourPixels(pa);
console.log(cc);
console.log(pa.length);
console.log(cc.length);
