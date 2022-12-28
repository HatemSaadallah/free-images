package com.example.datascrap;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class XlSXReader {
    public XlSXReader() {
    }

    List<String> readXlSX(String path) throws IOException {
        FileInputStream file = new FileInputStream(path);
        Workbook workbook = new XSSFWorkbook(file);
        XSSFSheet sheet = (XSSFSheet) workbook.getSheetAt(0);
        List<String> urls = new ArrayList<>();
        for (Row row : sheet) {
            for (Cell cell : row) {
                try {
                    String url = cell.getHyperlink().getAddress();
                    urls.add(url);
                } catch (NullPointerException ignored) {
                }
            }
        }
        return urls;
    }
}
