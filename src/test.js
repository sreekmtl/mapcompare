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
console.log(x-1);

ip= [10,20];

function kernel(k){return [[k[0]-1, k[1]-1],[k[0], k[1]-1],[k[0]+1, k[1]-1],
    [k[0]-1, k[1]],k,[k[0]+1, k[1]],
    [k[0]-1, k[1]+1],[k[0], k[1]+1],[k[0]+1, k[1]+1]];
}

console.log(kernel([19,4]));

let c=[4];
console.log(kernel([19,4]).slice(-1));