let DIV1= document.createElement('div');
    DIV1.style.width='300px';
    DIV1.style.background="white";
    let msg= document.createElement('h3');
    msg.textContent='Select features from both map';
    msg.style.color='#32a852';
    msg.style.fontWeight='bold';
    let title1= document.createElement('h3');
    title1.className='h3';
    title1.textContent='Enter parameters for Map 1';
    let title2= document.createElement('h3');
    title2.className='h3';
    title2.textContent='Enter parameters for Map 2';



function createOption(key,value,txt){

    let OPT_DIV=document.createElement('div');
    let OPT_INPUT= document.createElement('input');
    OPT_INPUT.setAttribute('id', key);
    OPT_INPUT.placeholder=txt;
    OPT_INPUT.style.marginLeft='10px';
    OPT_INPUT.style.marginBottom='10px';
    OPT_INPUT.className='input';
    OPT_INPUT.value=value;

    sessionStorage.setItem(key,value);

    OPT_INPUT.addEventListener('input', (e)=>{

        sessionStorage.setItem(OPT_INPUT.id, OPT_INPUT.value);
        
        
    });


    let val= OPT_INPUT.value;

    OPT_DIV.append(OPT_INPUT);

    return OPT_DIV;


}


function lineProcesses(root){

    

    let opt11= createOption('ER_KER_SIZ_1',3, '');
    let opt12= createOption('ER_ITER_1',3, '');
    let opt13= createOption('WIN_MIN_SIZ_1',25, '');
    let opt14= createOption('WIN_MAX_SIZ_1',31, '');
    let opt21= createOption('ER_KER_SIZ_2',3, '');
    let opt22= createOption('ER_ITER_2',3, '');
    let opt23= createOption('WIN_MIN_SIZ_2',25, '');
    let opt24= createOption('WIN_MAX_SIZ_2',31, '');


    
    
    DIV1.append(
        msg,
        title1,
         opt11,
         opt12,
         opt13,
         opt14,
         title2,
         opt21,
         opt22,
         opt23,
         opt24
         
    );
    
  
    root.append(DIV1);
    
    
}

function polygonProcesses(root){

    DIV1.append(msg,title1,title2);
    root.append(DIV1);

}

function clearChilds(root){
    while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
}

function createResults(txt, param){

    let RSLT= document.createElement('p');
    RSLT.textContent= txt + param;
    RSLT.className='p';

}

function showResults(root){

let RESULT_DIV= document.createElement('DIV');
RESULT_DIV.style.width='300px';
DIV1.style.background="white";

let RESULT_TITLE_1= document.createElement('h3');
RESULT_TITLE_1.textContent='Results for Map-1';

let RESULT_TITLE_2= document.createElement('h3');
RESULT_TITLE_2.textContent='Results for Map-2';



}


export {polygonProcesses,lineProcesses, clearChilds};