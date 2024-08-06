let DIV1= document.createElement('div');
    //DIV1.style.background="white";
    DIV1.style.display="flex";
    DIV1.style.flexDirection="row";
    DIV1.style.alignContent="space-between"
    DIV1.style.gap='20px';

let DIV2= document.createElement('div');
    //DIV2.style.background="white";
    DIV2.style.display="flex";
    DIV2.style.alignItems='center';
    DIV2.style.flexDirection="column";

let DIV3= document.createElement('div');
    //DIV3.style.background="white";
    DIV3.style.display="flex";
    DIV3.style.alignItems='center';
    DIV3.style.flexDirection="column";
    
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

    let br= document.createElement('br');

    let opt11= createOption('ER_KER_SIZ_1',3, '');
    let opt12= createOption('ER_ITER_1',3, '');
    let opt13= createOption('WIN_MIN_SIZ_1',25, '');
    let opt14= createOption('WIN_MAX_SIZ_1',31, '');
    let opt21= createOption('ER_KER_SIZ_2',3, '');
    let opt22= createOption('ER_ITER_2',3, '');
    let opt23= createOption('WIN_MIN_SIZ_2',25, '');
    let opt24= createOption('WIN_MAX_SIZ_2',31, '');


    DIV2.append(
        title1,
         opt11,
         opt12,
         opt13,
         opt14,

    )
    
    DIV3.append(
         title2,
         opt21,
         opt22,
         opt23,
         opt24
         
    );

    DIV1.append(DIV2,DIV3);
    
  
    root.append(DIV1,br);
    
    
}

function polygonProcesses(root){

    DIV1.append(msg,title1,title2);
    root.append(DIV1);

}

function colorPalette(root,cls, text){

    let pp= document.createElement('p');
    pp.textContent=text;
    //let br= document.createElement('br');
    root.append(pp);

    cls.forEach(e => {
        let clrId= e.toString();
        let imgEl= document.createElement('img');
        imgEl.style.width='20px';
        imgEl.style.height='20px';
        imgEl.style.background='rgba('+clrId+')';
        root.append(imgEl);
    });

    
}

function clearChilds(root){
    while (root.firstChild) {
        root.removeChild(root.firstChild);
      }
}

function createResults(txt, param){

    let RSLT= document.createElement('p');
    RSLT.textContent= txt +' : '+ param;
    RSLT.className='p';

}

function createTable(root, cols, data){

    const tbl= document.createElement("table");
    const tbl_body= document.createElement("tbody");

    let titles=['COLOR', 'HUE', 'SATURATION', 'LIGHTNESS'];
    let titlerow= []

    for (let i=0; i<titles.length; i++){
        const titlecell= document.createElement('th');
        titlecell.style.fontSize='14px';
        const titlecellText= document.createTextNode(titles[i]);
        titlecell.append(titlecellText);
        titlerow.push(titlecell);
    }

    for (let i=0; i<4; i++){
        const row= document.createElement('tr');
        row.append(titlerow[i]);

        for (let j=0; j<cols;j++){ //4 is bcos color, hue, sat, lightness
            const cell= document.createElement('td');
            const cellText= document.createTextNode(data[i][j]);
            cell.style.padding='3px';
            cell.style.fontSize='14px';
            cell.appendChild(cellText);
            row.append(cell);
        }
        tbl_body.appendChild(row);
    }
    tbl.appendChild(tbl_body);
    //tbl.setAttribute("border", 0.2);

    root.append(tbl);
}

function showResults(root, resultData){

Object.entries(resultData).map(entry=>{
        let key=entry[0];
        let value= entry[1];
        let res= key+" : "+value+" ";

        let RESULT_TXT= document.createElement('p');
        //let br= document.createElement('br');
        RESULT_TXT.textContent= res;
        root.append(RESULT_TXT);
        //root.append(br);
        
      });

}


export {polygonProcesses,lineProcesses, colorPalette, clearChilds, showResults, createTable};