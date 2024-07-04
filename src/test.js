arr= [11,2,8,9,5,1,0];

function getMinValPos(arr){

    if (arr.length === 0) {
        console.log('ERROR');
    }

    let smallestIndex = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[smallestIndex]) {
            smallestIndex = i;
        }
    }
    return smallestIndex;

}

console.log(getMinValPos(arr));