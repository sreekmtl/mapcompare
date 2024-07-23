import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import '../styles/myStyles.css'
import 'ol/ol.css';
import { getContours, getCannyEdge, erodePlusCanny } from './imageProcessing/cvOps.js';
import { colorFromPixel, extractChannel, getChannels, imageCovariance } from './utils.js';
import Image from 'image-js';
import { colorInRange } from './imageProcessing/yiqRange.js';
import { contourToPolygon } from './spatialOperations/imageToPolygon.js';
import Sources from './mapOperations/mapSources.js';
import { mapToImg } from './mapOperations/mapToImg.js';
import { clearChilds, colorPalette, lineProcesses, polygonProcesses } from './uiElements.js';
import { growRegion } from './algorithms/regionGrowing.js';
import { junctionExtract1 } from './spatialOperations/imageToLine.js';
import { createVectorLayer } from './mapOperations/vectorLyrSrc.js';
import { apply } from 'ol-mapbox-style';
import { Tile } from 'ol/layer.js';
import { geometryBasedJI, getPolygonCount, lineCompleteness, pixelBasedJI, polygonCompleteness } from './results/completeness.js';
import Constants from './constants.js';
import mapToClass, { detectAntiAlias } from './imageProcessing/mapToClass.js';
import RasterSource from 'ol/source/Raster.js';
import modFilter from './imageProcessing/modeFilter.js';
import { junctionExtract2 } from './spatialOperations/imageToLine2.js';
import { linePositionalAccuracy } from './results/positionalAccuracy.js';
import { olVectorLayerToGeoJSON, olVectorLayerToTurfLayer, transformOlLayer } from './mapOperations/vectorUtils.js';
import { Fill, Stroke, Style } from 'ol/style';
import ssim from 'ssim.js';
import { createLineChart } from './results/chart.js';
import { mapCurves } from './results/mapCurves.js';
import { vMeasure } from './results/vmeasure.js';
import { getColorComponents } from './results/colorMap.js';
import { createHeatMap } from './results/heatmap.js';





let sources= new Sources();

const canvas1= document.getElementById('imgCanvas1');
const canvas2= document.getElementById('imgCanvas2');

const canvasCtx1= canvas1.getContext('2d',  { willReadFrequently: true });
const canvasCtx2= canvas2.getContext('2d',  { willReadFrequently: true });

var mCanvas1= document.createElement('canvas');
var mCanvas2= document.createElement('canvas');

var mCtx1= mCanvas1.getContext('2d');
var mCtx2= mCanvas2.getContext('2d');



var img1= new Image();
var img2= new Image();

const imgProcessBtn= document.getElementById('processImgBtn');
const imgVectorizeBtn= document.getElementById('vectorizeBtn');
const compareBtn= document.getElementById('compareBtn')
const downloadBtn= document.getElementById('downloadVector');
const clearAllBtn= document.getElementById('clearAll');
const thematicBtn= document.getElementById('mapGOF');
const visBtn= document.getElementById('visBtn');

const extentBox= document.getElementById('extentBox');
const zoomLevelBox= document.getElementById('zoomLevel');
const featureDropDown= document.getElementById('FeatureType');
const selectionDropDown= document.getElementById('SelectionType');
const mapdd1= document.getElementById('MapType1');
const mapdd2= document.getElementById('MapType2');
const inner= document.getElementById('processOptions');
const colorArea1= document.getElementById('colorArea1');
const colorArea2= document.getElementById('colorArea2');
const resultBox= document.getElementById('resultView');
//const chartArea= document.getElementById('chart');

let map1Selected= false; //Whether user selected feature from map1 or not
let map2Selected= false;
let imgProcessed1= false;
let imgProcessed2= false;
let vectorFilePresent1= false;
let vectorFilePresent2=false;
let selectionAlgorithm= 'YIQ';


let contourData1, contourData2, erodeCannyData1, erodeCannyData2, vectorData1, vectorData2, diffImg1, diffImg2 ;
let polyLayer1, polyLayer2, lineLayer1, lineLayer2;
let map1, map2;
let extent, pixelWidth, pixelHeight;

function init(src1, src2){

  featureDropDown.addEventListener('change',(c)=>{

    if (featureDropDown.value==='1'){
      imgProcessBtn.disabled=false;
      imgVectorizeBtn.disabled=false;
      compareBtn.disabled=false;
      downloadBtn.disabled=false;
      thematicBtn.disabled= false;
      visBtn.disabled= false;

      clearChilds(inner);

    }else if (featureDropDown.value==='2'){ 
      imgProcessBtn.disabled=false;
      imgVectorizeBtn.disabled=false;
      compareBtn.disabled=false;
      downloadBtn.disabled=false;
      thematicBtn.disabled= true;
      visBtn.disabled= true;

      clearChilds(inner);
      polygonProcesses(inner);

    }else if (featureDropDown.value==='3'){ 
      imgProcessBtn.disabled=false;
      imgVectorizeBtn.disabled=false;
      compareBtn.disabled=false;
      downloadBtn.disabled=false;
      thematicBtn.disabled= true;
      visBtn.disabled= true;
      
      clearChilds(inner);
      lineProcesses(inner);

    }else if (featureDropDown.value==='4'){
      thematicBtn.disabled= false;
      imgProcessBtn.disabled=true;
      imgVectorizeBtn.disabled=true;
      compareBtn.disabled=true;
      downloadBtn.disabled=true;
      visBtn.disabled=true;

    }else if (featureDropDown.value==='5'){
      visBtn.disabled= false;
      imgProcessBtn.disabled=true;
      imgVectorizeBtn.disabled=true;
      compareBtn.disabled=true;
      downloadBtn.disabled=true;
      thematicBtn.disabled=true;
    }
  
  });

  selectionDropDown.addEventListener('change', (c)=>{

    if (selectionDropDown.value==='1'){
      selectionAlgorithm='YIQ';
    }else if (selectionDropDown.value==='2'){
      selectionAlgorithm='RG';
    }

  });
  

  const view= new View({
    center: [8687373.06, 3544749.53],
    zoom: 13,
    constrainResolution:true,
  });

  const raster= new RasterSource({
    sources: [src1],

    operation: function (pixels, data){
      
      console.log(pixels, 'pixels');
    }
  });
 raster.on('beforeoperations', function (e){
    console.log(e.data, 'eventdata');
 })
 raster.on('afteroperations', function (e){
  console.log(e.data, 'afterevent');
 })
  
  map1=    new Map({
          layers: [
            new TileLayer({source: src1}),
          ],
          view:view,
          target: 'map1',
        });
      
  map2=    new Map({
          layers:[
              new Tile({source: src2}),
          ],
          view:view,
          target:'map2',
      
      });

  //let url=`https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/arcgis/streets?token=AAPK3890bdd7605a4e3d9adb68f5790780eczWSlc-Uyepn0n8XMnNwNaiymNVrEy4ihJruVsf2PVK_lD086faryQVtQkssjkq84`
  //apply(map2, url)
  
  extentBox.textContent="Extent: "+map1.getView().calculateExtent(map1.getSize());
  zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
  
  map1.on('moveend',(e)=>{
    mapToImg(map1, canvas1, canvasCtx1);
    
    if (vectorFilePresent1===true){
      contourData1=undefined;
      vectorData1=undefined;
      vectorFilePresent1=false;
      

    }

    extent= map1.getView().calculateExtent(map1.getSize());
    pixelWidth= (extent[2]-extent[0])/canvas1.width;
    pixelHeight= (extent[3]-extent[1])/canvas1.height;
    extentBox.textContent="Extent: "+extent
    zoomLevelBox.textContent="Zoom Level: "+map1.getView().getZoom();
    
  });
  
  map2.on('moveend',(e)=>{
    mapToImg(map2, canvas2, canvasCtx2);
    
    if (vectorFilePresent2===true){
      contourData2=undefined;
      vectorData2=undefined;
      vectorFilePresent2=false;
    }
  });
 let coord; 
  map1.on('click',(e)=>{
    let imgData= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
    if (selectionAlgorithm==='YIQ'){
      diffImg1= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0)[0];
      console.log(colorFromPixel(e.pixel, imgData.data, 300, 300));
      canvasCtx1.putImageData(diffImg1,0,0);
    }else if (selectionAlgorithm==='RG'){
      let op= growRegion(imgData, {delta:20,pixel:e.pixel});
      diffImg1= new ImageData(op.data,300,300);
      canvasCtx1.putImageData(diffImg1,0,0);
    }
    
    map1Selected=true;
    
  });

  map2.on('click',(e)=>{
    let imgData= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
    
    if (selectionAlgorithm==='YIQ'){
      diffImg2= colorInRange(imgData, colorFromPixel(e.pixel, imgData.data, 300, 300), 0)[0];
      canvasCtx2.putImageData(diffImg2,0,0);
    }else if (selectionAlgorithm==='RG'){
      let op= growRegion(imgData, {delta:20,pixel:e.pixel});
      diffImg2= new ImageData(op.data,300,300);
      canvasCtx2.putImageData(diffImg2,0,0);
    }
    
    map2Selected=true;
  })


}


function download(file, text){
  var element = document.createElement('a');
                element.setAttribute('href',
                'data:application/json;charset=utf-8, '
                + encodeURIComponent(text));
                element.setAttribute('download', file);
                document.body.appendChild(element);
                element.click();
 
                document.body.removeChild(element);
}


/**
 * All the UI events are written below
 * This includes button, slider events etc.
 */
let sourceMap={
  '1':sources.OSM_Standard,
  '2':sources.Bing_RoadsOnDemand,
  '3':sources.EsriXYZ,
  '4':sources.ArcGIS_sample, //NW
  '5':sources.googleMaps,    //NW
  '6':sources.EsriMaps,
  '7':sources.ESA_WORLDCOVER2020,
  '8':sources.ESA_WORLDCOVER2021,
  '9':sources.BhuvanLULC1,
  '10':sources.BhuvanLULC2,
}

init(sourceMap['9'],sourceMap['10']);
let constants= new Constants(canvas1.width, canvas1.height, map1.getView().calculateExtent(map1.getSize()));

mapdd1.addEventListener('change',(c)=>{

  //init(sourceMap[mapdd1.value], sourceMap[mapdd2.value]);
});

mapdd2.addEventListener('change', (c)=>{
  //init(sourceMap[mapdd1.value], sourceMap[mapdd2.value]);
});

imgProcessBtn.addEventListener('click',(e)=>{

  if (featureDropDown.value==='1'){

    alert('Choose a feature type from drop down');

  }else if (featureDropDown.value==='2'){

    //polygon feature


    if (map1Selected===true){

      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      contourData1= getContours(imgData1, canvas1);
      imgProcessed1=true;
  
    }
  
    if (map2Selected===true){
      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      contourData2= getContours(imgData2, canvas2);
      imgProcessed2=true;
    }
    
    pixelBasedJI(diffImg1,diffImg2,pixelWidth*pixelHeight);
    const {mssim} = ssim(diffImg1, diffImg2,);
 
    console.log(`SSIM: ${mssim}`);

  }else if (featureDropDown.value==='3'){

    //Line feature
    if (map1Selected===true){

      let param1= parseInt(sessionStorage.getItem('ER_KER_SIZ_1'));
      let param2= parseInt(sessionStorage.getItem('ER_ITER_1'));

      let imgData1= canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
      erodeCannyData1= erodePlusCanny(imgData1,param1, param2);
      imgProcessed1=true;
      canvasCtx1.putImageData(erodeCannyData1,0,0);
      
    }

    if (map2Selected===true){
      let param1= parseInt(sessionStorage.getItem('ER_KER_SIZ_2'));
      let param2= parseInt(sessionStorage.getItem('ER_ITER_2'));

      let imgData2= canvasCtx2.getImageData(0,0,canvas2.width,canvas2.height);
      erodeCannyData2= erodePlusCanny(imgData2,param1, param2);
      imgProcessed2=true;
      canvasCtx2.putImageData(erodeCannyData2,0,0);
      

    }

    pixelBasedJI(diffImg1,diffImg2,pixelWidth*pixelHeight);
    const {mssim} = ssim(diffImg1, diffImg2,);
 
    console.log(`SSIM: ${mssim}`);
  }
  

});

imgVectorizeBtn.addEventListener('click', (e)=>{

  if (featureDropDown.value==='2'){

    if (imgProcessed1===true){
      let extent1= map1.getView().calculateExtent(map1.getSize());
      vectorData1=contourToPolygon(contourData1, canvas1.width, canvas1.height, extent1);

      vectorFilePresent1=true;
      polyLayer1= createVectorLayer(vectorData1);
      let polyLayer3857= transformOlLayer(polyLayer1,'EPSG:4326', 'EPSG:3857'); //For visualizing converting to 3857

      map1.addLayer(polyLayer3857);
      vectorData1=olVectorLayerToGeoJSON(polyLayer1);
      
      imgProcessed1=false;
    }else {
      alert('Process image from map1 before vectorizing');
    }

    if(imgProcessed2===true){
      let extent2= map2.getView().calculateExtent(map2.getSize());
      vectorData2=contourToPolygon(contourData2, canvas2.width, canvas2.height, extent2);

      vectorFilePresent2=true;
      polyLayer2= createVectorLayer(vectorData2);
      let polyLayer3857= transformOlLayer(polyLayer2,'EPSG:4326', 'EPSG:3857');

      map2.addLayer(polyLayer3857);
      vectorData2=olVectorLayerToGeoJSON(polyLayer2);
      imgProcessed2=false;

    }

    console.log('Feature count in reference map : ', getPolygonCount(polyLayer1));
    console.log('Feature count in comparison map : ', getPolygonCount(polyLayer2));
    console.log('Area Completeness: ', polygonCompleteness(polyLayer1, polyLayer2));
    geometryBasedJI(polyLayer1,polyLayer2);

  }else if (featureDropDown.value==='3'){

    if (imgProcessed1===true){
      let extent1= map1.getView().calculateExtent(map1.getSize());
      let redata=junctionExtract2(erodeCannyData1.data, 300, 300, extent1);

      vectorData1= redata[1];
      vectorFilePresent1=true;
      let jn= createVectorLayer(redata[0]);
      lineLayer1= createVectorLayer(vectorData1);
      let line3857= transformOlLayer(lineLayer1,'EPSG:4326', 'EPSG:3857');

      map1.addLayer(jn);
      map1.addLayer(line3857);
      vectorData1=olVectorLayerToGeoJSON(lineLayer1);
      imgProcessed1=false;
      clearChilds(inner);
     

    }else {
      alert('Process image from map1 before vectorizing');
    }

    if (imgProcessed2===true){

      let extent2= map2.getView().calculateExtent(map2.getSize());
      let redata=junctionExtract2(erodeCannyData2.data, 300, 300, extent2);

      vectorData2= redata[0];
      vectorFilePresent2=true;
      let jn = createVectorLayer(vectorData2);
      lineLayer2= createVectorLayer(redata[1]);
      let line3857= transformOlLayer(lineLayer2,'EPSG:4326', 'EPSG:3857');

      map2.addLayer(jn);
      map2.addLayer(line3857);
      vectorData2=olVectorLayerToGeoJSON(lineLayer2);
      imgProcessed2=false;
      clearChilds(inner);

    }else {
      alert('Process image from map1 before vectorizing');
    }

    console.log(lineCompleteness(lineLayer1,lineLayer2), 'lineCompleteness');

  }
})



downloadBtn.addEventListener('click',(e)=>{

  if (vectorFilePresent1===true){

    let text1= JSON.stringify(vectorData1);
    var filename1 = "layer1.geojson";

    let text2=JSON.stringify(vectorData2);
    var filename2= "layer2.geojson";
 
    download(filename1, text1);
    download(filename2,text2);

  }else{
    alert('Generate vector file before downloading');
  }


});

clearAllBtn.addEventListener('click',(e)=>{

  location.reload();

});

compareBtn.addEventListener('click', (e)=>{

  let bufferData= linePositionalAccuracy(lineLayer1,lineLayer2);
  let re= bufferData.layers;
  let data= bufferData.data;
  console.log(data);
  let buffer3857= transformOlLayer(re[0],'EPSG:4326', 'EPSG:3857');
  let line3857= transformOlLayer(re[1],'EPSG:4326', 'EPSG:3857');

  line3857.setStyle([new Style({
      fill:new Fill({
          color:'rgba(255,0,0,1.0)'
      }),
      stroke:new Stroke({
          //color:'rgba(255,0,0,1.0)',
          //width:3
      })
  })]);

  map1.addLayer(buffer3857);
  map1.addLayer(line3857);

createLineChart(data);
  
});

thematicBtn.addEventListener('click', (e)=>{
  
  let imageData1=canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
  let cls1= mapToClass(imageData1,{merge:true, threshold:10});
  canvasCtx1.putImageData(cls1[1],0,0);
  colorPalette(colorArea1, cls1[0], 'map-1 classes');

  let imageData2=canvasCtx2.getImageData(0,0,canvas1.width,canvas1.height);
  let cls2= mapToClass(imageData2,{merge:true, threshold:10});
  canvasCtx2.putImageData(cls2[1],0,0);
  colorPalette(colorArea2,cls2[0],'map-2 classes');


  //let gof= mapCurves(cls1[0],cls2[0], (pixelWidth*pixelHeight));
  //console.log(`Goodness of fit is: ${gof}`);
  resultBox.style.visibility='visible';
  let result= vMeasure(cls1[0],cls2[0],(pixelWidth*pixelHeight));
  resultBox.value=result['vm'];

});

visBtn.addEventListener('click', (e)=>{

  let imageData1=canvasCtx1.getImageData(0,0,canvas1.width,canvas1.height);
  let classData1= mapToClass(imageData1,{merge:true, threshold:10});
  canvasCtx1.putImageData(classData1[1],0,0);
  colorPalette(colorArea1, classData1[0], 'map-1 classes');

  let imageData2=canvasCtx2.getImageData(0,0,canvas1.width,canvas1.height);
  let classData2= mapToClass(imageData2,{merge:true, threshold:10});
  canvasCtx2.putImageData(classData2[1],0,0);
  colorPalette(colorArea2,classData2[0],'map-2 classes');

  let components= getColorComponents(classData1[0],classData2[0]);
  createHeatMap(components.colorArray1,components.distanceArray1);

  
})






