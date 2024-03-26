import DefaultValues from "./defaults";


function createOption(txt,param){

    let OPT_DIV=document.createElement('div');
    let OPT_TXT= document.createElement('p');
    OPT_TXT.className='p';
    OPT_TXT.textContent=txt;
    let OPT_INPUT= document.createElement('input');
    OPT_INPUT.style.marginLeft='10px';
    OPT_INPUT.style.marginBottom='10px';
    OPT_INPUT.className='input';
    OPT_INPUT.value=param;

    OPT_INPUT.addEventListener('change', (e)=>{
        console.log(OPT_INPUT.value);
        
    });

    let val= OPT_INPUT.value;

    OPT_DIV.append(OPT_TXT, OPT_INPUT);

    return [OPT_DIV,val];


}


function lineProcesses(root){

    let br= document.createElement('br');

    let DIV1= document.createElement('div');
    DIV1.style.width='300px';
    DIV1.style.background="white";
    let title1= document.createElement('h3');
    title1.className='h3';
    title1.textContent='Enter parameters for Map 1';
    let title2= document.createElement('h3');
    title2.className='h3';
    title2.textContent='Enter parameters for Map 2';

    let opt1= createOption('Kernel Size', DefaultValues.erodeKernelSize);
    let opt2= createOption('Num of Iterations',DefaultValues.erodeIterations);
    let opt3= createOption('Kernel Size',DefaultValues.erodeKernelSize);
    let opt4= createOption('Num of Iterations',DefaultValues.erodeIterations);

    DefaultValues.saveDefaults();

    
    
    DIV1.append(
        title1,
         opt1[0],
         opt2[0],
         title2,
         opt3[0],
         opt4[0]
         
    );
    
  
    root.append(DIV1);
    
    return [opt1[1],opt2[1],opt3[1],opt4[1]];
}

function clearChilds(root){
    while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
}


export {lineProcesses, clearChilds};