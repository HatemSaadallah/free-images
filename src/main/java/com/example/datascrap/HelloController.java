package com.example.datascrap;

import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.ListView;
import javafx.stage.DirectoryChooser;
import javafx.stage.FileChooser;

import java.io.*;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class HelloController {
    List<String> urls, failedUrls;
    GlobalConfig globalConfig = GlobalConfig.getInstance();
    int currentIndex = 0;
    String localDestinationFolder = "";
    @FXML
    private Label filePath;

    @FXML
    private Label destinationPath;
    @FXML
    private ListView<String> listView;

    @FXML
    private Label scrapStatus;

    @FXML
    private void onScrapButtonClick() {
        ExecutorService executorService = Executors.newFixedThreadPool(1000);
        int totalLength = urls.size();


        for (String url : urls) {
            executorService.execute(() -> {
                String directUrl = null;
                try {
                    directUrl = globalConfig.baseUrl + "/" + ApiScrapper.request(url);
                    ApiScrapper.downloadImage(directUrl, ApiScrapper.request(url).substring(6), localDestinationFolder);
                } catch (IOException e) {
                    System.Logger logger = System.getLogger("onScrapButtonClick");
                    logger.log(System.Logger.Level.ERROR, "Error while scrapping url: " + url);
                    try {
                        failedUrls.add(url);
                        BufferedWriter writer = new BufferedWriter(new FileWriter("failedUrls.txt", true));
                        writer.write(url + "\n");
                        writer.close();
                    } catch (IOException ex) {
                        logger.log(System.Logger.Level.ERROR, "Error while writing to failed");
                    }
                }
//                update status
                Platform.runLater(() -> {
                    scrapStatus.setText("Scrapped " + currentIndex + " of " + totalLength);
                    currentIndex++;
                });

                System.out.println(directUrl);
            });
        }
        executorService.shutdown();
        while (!executorService.isTerminated()) {
        }
        Platform.runLater(() -> {
            try {
                if (System.getProperty("os.name").toLowerCase().contains("win")) {
                    Runtime.getRuntime().exec("notepad.exe failedUrls.txt");
                } else {
                    Runtime.getRuntime().exec("gedit failedUrls.txt");
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
        scrapStatus.setText("Done");
    }

    @FXML
    protected void onSelectFileButtonClick() {
        FileChooser fileChooser = new FileChooser();
        fileChooser.setTitle("Select XLSX file");
        fileChooser.getExtensionFilters().addAll(
                new FileChooser.ExtensionFilter("XLSX", "*.xlsx")
        );
        File selectedFile = fileChooser.showOpenDialog(null);
        if (selectedFile != null) {
            String fileName = selectedFile.getAbsolutePath();
            globalConfig.fileName = fileName;
            XlSXReader reader = new XlSXReader();

            try {
                urls = reader.readXlSX(fileName);
                for (String url : urls) {
                    listView.getItems().add(url);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }

            filePath.setText("File selected: " + selectedFile.getAbsolutePath());
        }
    }


    @FXML
    protected void onSelectDestinationClick() {
        DirectoryChooser directoryChooser = new DirectoryChooser();
        directoryChooser.setTitle("Select destination folder");
        File selectedDirectory = directoryChooser.showDialog(null);
        if (selectedDirectory != null) {
            String destinationFolder = selectedDirectory.getAbsolutePath();
            globalConfig.destinationFolder = destinationFolder;
            localDestinationFolder = destinationFolder;
            destinationPath.setText("Destination selected: " + destinationFolder);
        }
    }

}