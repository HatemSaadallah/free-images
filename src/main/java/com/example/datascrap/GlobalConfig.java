package com.example.datascrap;

public class GlobalConfig {
    static GlobalConfig singleton = null;
    final String baseUrl = "https://istock.7xm.xyz";
    final String postApi = "/get.php";

    String fileName = "";
    String destinationFolder = "";
    private GlobalConfig() {
    }
    public static GlobalConfig getInstance() {
        if (singleton == null) {
            singleton = new GlobalConfig();
        }
        return singleton;
    }
}
