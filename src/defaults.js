
let DefaultValues={

    contourKernelSize:3,
    contourIterations:3,
    erodeKernelSize:3,
    erodeIterations:3,

    saveDefaults: ()=>{

        sessionStorage.setItem('CONTOUR_KERNEL', DefaultValues.contourKernelSize);
        sessionStorage.setItem('CONTOUR_ITER', DefaultValues.contourIterations);
        sessionStorage.setItem('ERODE_KERNEL', DefaultValues.erodeKernelSize);
        sessionStorage.setItem('ERODE_ITER', DefaultValues.erodeIterations);
    }


}

export default DefaultValues;