package com.example.datascrap;

import java.awt.image.BufferedImage;
import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.NameValuePair;
import org.apache.http.util.EntityUtils;
import javax.imageio.ImageIO;

public class ApiScrapper {
    static GlobalConfig config = GlobalConfig.getInstance();
    static String request(String url) throws IOException {
        String found = "";
        try {
            HttpPost post = new HttpPost(config.baseUrl + config.postApi);

            List<NameValuePair> urlParameters = new ArrayList<>();
            urlParameters.add(
                    new BasicNameValuePair("url",
                            url));

            post.setEntity(new UrlEncodedFormEntity(urlParameters));
            String result;
            try (CloseableHttpClient httpClient = HttpClients.createDefault();
                 CloseableHttpResponse response = httpClient.execute(post)) {
                result = EntityUtils.toString(response.getEntity());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            found = result.substring(result.indexOf("images/7xm.xyz"));
            for(int i = 0; i < found.length(); i++){
                if(found.charAt(i) == '"'){
                    found = found.substring(0, i);
                    break;
                }
            }
        } catch (Exception e) {
            BufferedWriter writer = new BufferedWriter(new FileWriter("failedUrls.txt", true));
            writer.write(url + "\n");
            writer.close();
        }

        return found;
    }

    static void downloadImage(String url, String fileName, String path) throws IOException {
        BufferedImage image = ImageIO.read(new URL(url));

        ImageIO.write(image, "jpg", new File(path + "/" + fileName));
    }

//    public static void main(String[] args) {
//        try {
//            String url = "https://www.istockphoto.com/photo/controlling-smart-home-with-a-digital-tablet-gm1215082365-353776523?phrase=smart%20home";
//            String imageUrl = request(url);
//            GlobalConfig config = GlobalConfig.getInstance();
//            URL link = new URL(config.baseUrl + "/" + imageUrl);
//            BufferedImage image = ImageIO.read(link);
//            ImageIO.write(image, "jpg", new File(imageUrl));
//
//        } catch (UnsupportedEncodingException e) {
//
//        } catch (MalformedURLException e) {
//            throw new RuntimeException(e);
//        } catch (IOException e) {
//            throw new RuntimeException(e);
//        }
//    }
}
