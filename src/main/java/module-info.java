module com.example.datascrap {
    requires javafx.controls;
    requires javafx.fxml;

    requires org.kordamp.bootstrapfx.core;
    requires org.apache.httpcomponents.httpclient;
    requires org.apache.httpcomponents.httpcore;
    requires java.desktop;
    requires org.apache.poi.poi;
    requires org.apache.poi.ooxml;


    opens com.example.datascrap to javafx.fxml;
    exports com.example.datascrap;

//    add log4j2
    requires org.apache.logging.log4j;
}