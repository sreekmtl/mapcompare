

function lineProcesses(root,name){

    let br= document.createElement('br');

    let title= document.createElement('p').textContent="Enter Parameters for "+name;
    let ki= document.createElement('p').textContent="Erosion Kernel Size";
    const kernelInput= document.createElement('input');
    let ii= document.createElement('p').textContent='No of Iterations';
    const itInput= document.createElement('input');
    
  
    root.append(title,br,ki,kernelInput,br,ii,itInput,br);

    return {kernelInput, itInput}
}

function clearChilds(root){
    while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
}

export {lineProcesses, clearChilds};