const dev = process.env.PROD_ENV === "development";
const domen = `https://api.${dev ? "dev." : ""}zaptap.ru`;
const route = "/public/media/";

/**
 * Binding image to zaptap url
 * @param {string} url image url
 * @returns {string} image url binded to zaptap url
 */
export const getUrlFromString = url => {
  if (!url) return "";
  if (url.startsWith(route)) return domen + url;
  return domen + route + url;
};

/**
 * Creates minified url from File object
 * @param {File} file File object to process
 * @param {number} width width of the file
 * @returns {Promise<string>} Minified image data url
 */
export const getUrlFromFile = (file, width) => {
  const isFile = file instanceof File;
  if (!isFile) return Promise.resolve("");

  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async ({ target = {} } = {}) => {
      const { result } = target;
      if (!result) return reject("No result");
      const smallerImage = await resizeImageByUrl(result, width);
      resolve(smallerImage);
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Minify image by its url
 * @param {string} src image source link
 * @param {number} maxWidth image width
 * @returns {Promise<string>} minified image data url
 */
export function resizeImageByUrl(src, maxWidth) {
  const image = new Image();
  image.src = src;
  image.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const oc = document.createElement("canvas");
      const ctx = oc.getContext("2d");
      // resize to [maxWidth] px
      const scale = maxWidth / image.width;
      oc.width = image.width * scale;
      oc.height = image.height * scale;
      ctx.drawImage(image, 0, 0, oc.width, oc.height);
      // convert canvas back to dataurl
      try {
        resolve(oc.toDataURL());
      } catch (error) {
        reject(error);
      }
    };
  });
}
