/**
 * All OpenCV.js based functions are written in this file
 */

function getContours(imgData,canvas){

    let cData=[];
    let contourColors= [];

    let src= cv.matFromImageData(imgData)
    console.log(src);

    let dst= cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    console.log(dst);
    
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(src, src, 0, 255, cv.THRESH_BINARY);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(src, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    for (let i = 0; i < contours.size(); ++i) {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255),
                                Math.round(Math.random() * 255));
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 10);
        
        contourColors.push([color[0], color[1], color[2]]);
    }
    cData= dst;
    //console.log(contourColors, 'contourColors');
    //console.log(cData.data, 'contourData');
    cv.imshow(canvas,dst);
    src.delete();
    //dst.delete();

    return {contour:cData.data, color:contourColors};


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

function watershed(imgData, canvas){

    let src= cv.matFromImageData(imgData)
    let dst = new cv.Mat();
    let gray = new cv.Mat();
    let opening = new cv.Mat();
    let coinsBg = new cv.Mat();
    let coinsFg = new cv.Mat();
    let distTrans = new cv.Mat();
    let unknown = new cv.Mat();
    let markers = new cv.Mat();
    // gray and threshold image
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(gray, gray, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    // get background
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.erode(gray, gray, M);
    cv.dilate(gray, opening, M);
    cv.dilate(opening, coinsBg, M, new cv.Point(-1, -1), 5);
    // distance transform
    cv.distanceTransform(opening, distTrans, cv.DIST_L2, 5);
    cv.normalize(distTrans, distTrans, 1, 0, cv.NORM_INF);
    // get foreground
    cv.threshold(distTrans, coinsFg, 0.7 * 1, 255, cv.THRESH_BINARY);
    coinsFg.convertTo(coinsFg, cv.CV_8U, 1, 0);
    cv.subtract(coinsBg, coinsFg, unknown);
    // get connected components markers
    cv.connectedComponents(coinsFg, markers);
    for (let i = 0; i < markers.rows; i++) {
        for (let j = 0; j < markers.cols; j++) {
            markers.intPtr(i, j)[0] = markers.ucharPtr(i, j)[0] + 1;
            if (unknown.ucharPtr(i, j)[0] == 255) {
                markers.intPtr(i, j)[0] = 0;
            }
        }
    }
    cv.cvtColor(src, src, cv.COLOR_RGBA2RGB, 0);
    cv.watershed(src, markers);
    // draw barriers
    for (let i = 0; i < markers.rows; i++) {
        for (let j = 0; j < markers.cols; j++) {
            if (markers.intPtr(i, j)[0] == -1) {
                src.ucharPtr(i, j)[0] = 255; // R
                src.ucharPtr(i, j)[1] = 0; // G
                src.ucharPtr(i, j)[2] = 0; // B
            }
        }
    }
    cv.imshow(canvas, src);
    src.delete(); dst.delete(); gray.delete(); opening.delete(); coinsBg.delete();
    coinsFg.delete(); distTrans.delete(); unknown.delete(); markers.delete(); M.delete();

}

function erode(imgData, canvas, m, i){

    let src= cv.matFromImageData(imgData)
    console.log(src);

    let dst = new cv.Mat();
    let M = cv.Mat.ones(m, m, cv.CV_8U);
    let anchor = new cv.Point(-1, -1);
    // You can try more different parameters
    cv.erode(src, dst, M, anchor, i, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow(canvas, dst);
    src.delete(); dst.delete(); M.delete();


}


export {getContours, getCannyEdge, watershed, erode};