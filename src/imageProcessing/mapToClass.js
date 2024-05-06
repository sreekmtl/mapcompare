import { getChannels } from "../utils";
import '../algorithms/kmeans';
import kmeans from "../algorithms/kmeans";
import { colorInRange, rgbToyiq } from "./yiqRange";
import pixelmatch from 'pixelmatch';



export default function mapToClass(mapImageData, numberOfClasses){

    
    //Take first pixel->YIQ->Extract all-> Assign to class1->assign 0 to covered pixels
    //Take next non-0 pixel-> Do the same
    //Do till everything becomes zero
    //* Filter out anti-aliased pixels or else these pixels appear as seperate class

    let imageData= detectAntiAlias(mapImageData);
    

    let classes=[];
    let j=0;
    for (let i=0; i<imageData.data.length; i+=4){

        if (imageData.data[i]===0 && imageData.data[i+1]===0 && imageData.data[i+2]===0 && imageData.data[i+3]===255){
            continue;
        }else {
            let selectedColor= [imageData.data[i],imageData.data[i+1],imageData.data[i+2]];
            let sc=[imageData.data[i],imageData.data[i+1],imageData.data[i+2]];
            //console.log(selectedColor,'selectedcolor');
            let cir= colorInRange(imageData, selectedColor, 10);
            let colorClass= cir[0];
            let classPixelCount= cir[1];
            if (classPixelCount>=100){
                j++;
                let key= sc.toString();
                let classObj={};
                classObj[key]= [colorClass.data, classPixelCount];
                classes.push(classObj)
            }
            

            for (let i=0; i<colorClass.data.length; i+=4){
                if (colorClass.data[i]===255 && colorClass.data[i+1]===0 && colorClass.data[i+2]===0 && colorClass.data[i+3]===255){
                    imageData.data[i]=0;
                    imageData.data[i+1]=0;
                    imageData.data[i+2]=0;
                    imageData.data[i+3]=255;
                }
           
            } 
            
        }  

    }

    
    console.log(classes, 'class');
    //groupClasses(classes);

    return [classes,imageData];


}

export function detectAntiAlias(imageData){

    let count=0;
    let samimgdata= new Uint8ClampedArray(300*300*4);
  //for (let i=0; i<samimgdata.length;i++){
    //samimgdata[i]=255;
  //}
  let samimg= new ImageData(samimgdata,300,300);
  const opdat= new ImageData(300,300);
  pixelmatch(imageData.data, samimg.data, opdat.data,300, 300, {threshold:0, includeAA:false, aaColor:[255,0,0], diffColor:[0,0,0]});

  for (let i=0; i<imageData.data.length;i+=4){
    if ((opdat.data[i]===255 && opdat.data[i+1]===0 && opdat.data[i+2]===0 && opdat.data[i+3]===255)){
        count++;
      imageData.data[i]=0; 
      imageData.data[i+1]=0; 
      imageData.data[i+2]=0; 
      imageData.data[i+3]=255; 
    }
  }
console.log('no of anti-aliased pixels: ', count);
  return imageData;
}

function groupClasses(classes){

    let colorClasses=[];
    let finalClasses=[];
    classes.forEach(e => {
        let key= Object.keys(e);
        colorClasses.push(key.toString().split(','));
    });

    for (let i=0; i<colorClasses.length; i++){
        for (let j=0; j<colorClasses.length; j++){

            let r1= parseInt(colorClasses[i][0]); let r2= parseInt(colorClasses[j][0]);
            let g1= parseInt(colorClasses[i][1]); let g2= parseInt(colorClasses[j][1]);
            let b1= parseInt(colorClasses[i][2]); let b2= parseInt(colorClasses[j][2]);

            let yiq1= rgbToyiq(r1,g1,b1); let yiq2= rgbToyiq(r2,g2,b2);
            let yiqDistance= distanceInYIQ(yiq1, yiq2);

           if (yiqDistance>0 && yiqDistance<5){
            //Here we have to join classes
            finalClasses.push([r1,g1,b1, yiqDistance, r2,g2,b2]);
           }

        }
    }
    console.log(finalClasses,'fc');
}

let distanceInYIQ= (yiq1, yiq2)=>{

    let dis= Math.sqrt(                                        
        0.5053*(Math.pow((yiq1[0]-yiq2[0]),2))+
         0.299*(Math.pow((yiq1[1]-yiq2[1]),2))+
         0.1957*(Math.pow((yiq1[2]-yiq2[2]),2))
        );

    return dis;
}