import path from "path";
import download from 'image-downloader';


/**
 * downloads an image specified by url and saves to /img folder
 * @param url string url of image to download
 * @returns path to downloaded image
 */
export default async (url: string) => {
    const options = {
        url,
        dest: path.join(process.cwd(), '/img'),
        extractFileName: true,
    };

    return await (await download.image(options)).filename;
};
