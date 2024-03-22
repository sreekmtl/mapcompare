function growRegion(inputs, data) {
    const image = inputs;
    let seed = data.pixel;
    let totalCount=[];
    const delta = parseInt(data.delta);
    if (!seed) {
      return image;
    }
  
    seed = seed.map(Math.round);
    const width = image.width;
    const height = image.height;
    const inputData = image.data;
    const outputData = new Uint8ClampedArray(inputData);
    const seedIdx = (seed[1] * width + seed[0]) * 4;
    const seedR = inputData[seedIdx];
    const seedG = inputData[seedIdx + 1];
    const seedB = inputData[seedIdx + 2];
    let edge = [seed];
    while (edge.length) {
      const newedge = [];
      for (let i = 0, ii = edge.length; i < ii; i++) {
        // As noted in the Raster source constructor, this function is provided
        // using the `lib` option. Other functions will NOT be visible unless
        // provided using the `lib` option.
        const next = next4Edges(edge[i]);
        for (let j = 0, jj = next.length; j < jj; j++) {
          const s = next[j][0];
          const t = next[j][1];
          if (s >= 0 && s < width && t >= 0 && t < height) {
            const ci = (t * width + s) * 4;
            const cr = inputData[ci];
            const cg = inputData[ci + 1];
            const cb = inputData[ci + 2];
            const ca = inputData[ci + 3];
            // if alpha is zero, carry on
            if (ca === 0) {
              continue;
            }
            if (
              Math.abs(seedR - cr) < delta &&
              Math.abs(seedG - cg) < delta &&
              Math.abs(seedB - cb) < delta
            ) {
              outputData[ci] = 255;
              outputData[ci + 1] = 0;
              outputData[ci + 2] = 0;
              outputData[ci + 3] = 255;
              newedge.push([s, t]);
            }
            // mark as visited
            inputData[ci + 3] = 0;
          }
        }
      }
      totalCount.push(newedge);
      edge = newedge;
    }
    console.log(totalCount);
    return {data: outputData, width: width, height: height};
  }
  
  function next4Edges(edge) {
    const x = edge[0];
    const y = edge[1];
    return [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
  }

  export {growRegion, next4Edges};