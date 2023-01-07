import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { ISTOCK7XM_POST_URL, BASE_URL } from '../common/constants/index';

class DownloadService {
  // eslint-disable-next-line class-methods-use-this
  cleanLink(link: string) {
    // get string starting with images/7xm.xyz until end of quotation mark
    const regex = /images\/7xm.xyz.*?"/g;
    const result = link.match(regex);
    if (result) {
      return result[0].slice(0, -1);
    }
    return '';
  }

  // eslint-disable-next-line class-methods-use-this
  saveImage(url: string, path: string) {
    // eslint-disable-next-line no-param-reassign

    const requestUrl = `${BASE_URL}/${url}`;
    const nameOfFile = url.split('/').pop();
    const writer = fs.createWriteStream(`${path}/${nameOfFile}`);
    // eslint-disable-next-line promise/catch-or-return
    axios({
      url: requestUrl,
      method: 'GET',
      responseType: 'stream',
    }).then(async (response) => {
      response.data.pipe(writer);
      try {
        return await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
          return response;
        });
      } catch (err) {
        console.log(err);
        return err;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  getDirectLink(obj: any, destinationPath: string) {
    return obj[0].forEach(async (l) => {
      // send axios with form data
      const formData = new FormData();
      formData.append('url', l.link);
      const response = await axios.post(ISTOCK7XM_POST_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const clean = this.cleanLink(response.data);
      this.saveImage(clean, destinationPath);
      // save file to disk
      // eslint-disable-next-line no-param-reassign

      console.log(111111111, clean);
    });
  }
}

export default DownloadService;
