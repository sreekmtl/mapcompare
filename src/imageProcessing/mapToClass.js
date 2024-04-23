import { getChannels } from "../utils";


export default function mapToClass(imageData, numberOfClasses){

    let imageDataArray= imageData.data;
    let RGBA_Array= getChannels(imageDataArray, true);
    console.log(RGBA_Array);


}