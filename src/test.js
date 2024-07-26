distanceArray=[2,3,1,4,5,6,1];

function sample(da){
    let minIndex= distanceArray.indexOf(Math.min(...distanceArray));
    da[minIndex]=10;

    return da;
}

let d= sample(distanceArray);
console.log(d);