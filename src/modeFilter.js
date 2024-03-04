import { findMode } from './utils';
import { validateArrayOfChannels } from 'image-js/src/util/channel';
import {checkProcessable} from 'image-js/src/image/core/checkProcessable';
import Image from 'image-js/src/image/Image';

/**
 * Each pixel of the image becomes the median of the neighbor pixels.
 * @memberof Image
 * @instance
 * @param {Image} image
 * @param {object} options
 * @param {SelectedChannels} [options.channels] - Specify which channels should be processed.
 * @param {number} [options.radius=1] - Distance of the square to take the mean of.
 * @param {string} [options.border='copy'] - Algorithm that will be applied after to deal with borders.
 * @return {Image}
 */
export default function modFilter(image, options = {}) {
  let { radius = 1, border = 'copy', channels } = options;

  image.checkProcessable('medianFilter', {
    bitDepth: [8, 16],
  });

  if (radius < 1) {
    throw new Error('radius must be greater than 0');
  }

  channels = validateArrayOfChannels(image, channels, true);

  let kWidth = radius;
  let kHeight = radius;
  let newImage = Image.createFrom(image);

  let size = (kWidth * 2 + 1) * (kHeight * 2 + 1);
  let kernel = new Array(size);

  for (let channel = 0; channel < channels.length; channel++) {
    let c = channels[channel];
    for (let y = kHeight; y < image.height - kHeight; y++) {
      for (let x = kWidth; x < image.width - kWidth; x++) {
        let n = 0;
        for (let j = -kHeight; j <= kHeight; j++) {
          for (let i = -kWidth; i <= kWidth; i++) {
            let index = ((y + j) * image.width + x + i) * image.channels + c;
            kernel[n++] = image.data[index];
          }
        }

        let index = (y * image.width + x) * image.channels + c;

        newImage.data[index] = findMode(kernel);
      }
    }
  }
  if (image.alpha && !channels.includes(image.channels)) {
    for (let i = image.components; i < image.data.length; i = i + image.channels) {
      newImage.data[i] = image.data[i];
    }
  }

  newImage.setBorder({ size: [kWidth, kHeight], algorithm: border });

  return newImage;
}