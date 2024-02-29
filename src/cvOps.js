/**
 * All OpenCV.js based functions are written in this file
 */

function getContours(imgData,canvas){

    let src= cv.matFromImageData(imgData)
    console.log(src);

    let dst= cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    console.log(dst);
    
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 200, 255, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
    }


    cv.imshow(canvas,dst);
    src.delete();
    dst.delete();


}

function getCannyEdge(imgData, canvas){

    let src= cv.matFromImageData(imgData)
    console.log(src);

    
    let dst= cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    console.log(dst);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);

    let ksize = new cv.Size(3, 3);
    let anchor = new cv.Point(-1, -1);
    cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);
    //cv.GaussianBlur(src, src, ksize, 0, 0, cv.BORDER_DEFAULT);

    cv.Canny(src, dst, 50, 100, 3, false);
    cv.imshow(canvas, dst);
    src.delete(); 
    dst.delete();

    
}


export {getContours, getCannyEdge};