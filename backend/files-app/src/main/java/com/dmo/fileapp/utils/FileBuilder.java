package com.dmo.fileapp.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

public class FileBuilder {

    public static boolean buildFileFromBase64Content(String path, String fileName, String base64Content) {
        String file = path.concat(fileName);
        try (FileWriter writer = new FileWriter(file);
                BufferedWriter buffer = new BufferedWriter(writer)) {
            buffer.write(base64Content);
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    public static boolean buildFileFromByteArray(String path, String fileName, byte[] byteArray) {
        String file = path.concat(fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(byteArray);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
  


    public static boolean joinChunksInFile(String path, String fileName, List<String> fileNameList ) {

        List<String> lines = new ArrayList<>();
        String currentFile = null;
        String line = null;

        for (String currentName : fileNameList) {
            currentFile = path.concat(currentName);
            try (BufferedReader br = new BufferedReader(new FileReader(currentFile))) {                
                while ((line = br.readLine()) != null) {
                    lines.add(line);
                }
            } catch (IOException ex) {
                break;
            }
        }        

        if (fileNameList.size() != lines.size()) {
            return false;
        }

        return buildFileFromBase64Content(path, fileName, String.join("", lines));

    }


    public static boolean changeBase64ToBytesFile( String path, String base64FileName, String bytesFileName){
        String base64File = path.concat(base64FileName);
        
        StringBuilder lines = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new FileReader(base64File))){
            String currentLine;
            while( (currentLine = br.readLine()) != null ){
                lines.append(currentLine);
            }
        }catch(IOException ex){
            return false;
        }

        String encodedString = lines.toString();
        byte[] byteArray = Base64.getDecoder().decode(encodedString);


        return buildFileFromByteArray( path, 
                                       bytesFileName,  
                                       byteArray
                                     );
    }

}
