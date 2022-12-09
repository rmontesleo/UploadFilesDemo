package com.dmo.fileapp.utils;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;

public class FileBuilder {

    /**
     * 
     * @param path
     * @param fileName
     * @param base64Content
     * @return
     */
    public static boolean buildFileFromBase64Content( final String path, final String fileName, final String base64Content) {
        String file = path.concat(fileName);
        try (FileWriter writer = new FileWriter(file);
                BufferedWriter buffer = new BufferedWriter(writer)) {
            buffer.write(base64Content);                       
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 
     * @param path
     * @param fileName
     * @param byteArray
     * @return
     */
    public static boolean buildFileFromByteArray(final String path, final String fileName, final byte[] byteArray) {
        String file = path.concat(fileName);
        try (FileOutputStream fos = new FileOutputStream(file)) {
            fos.write(byteArray);
            return true;
        } catch (IOException e) {
            return false;
        }
    }
  


    /**
     * 
     * @param path
     * @param fileName
     * @param fileNameList
     * @return
     */
    public static boolean joinChunksInFile(final String path, final String fileName, final List<String> fileNameList ) {

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

        return buildFileFromBase64Content( path, fileName, String.join("", lines) );

    }

    
    /**
     * 
     * @param path
     * @param fileName
     * @param fileNameArray
     * @return
     */
    public static boolean joinChunksArrayInFile(final String path, final String fileName, final String[] fileNameArray ) {
        List<String> fileNameList = Arrays.asList(fileNameArray);
        return joinChunksInFile( path,  fileName, fileNameList );
    }


    public static boolean joinChunksStringInFile(final String path, final String fileName, final String concatenatedNames ) {
        List<String> fileNameList =  Arrays.asList( concatenatedNames.split(",") );
        return joinChunksInFile( path,  fileName, fileNameList );
    }


    /**
     * 
     * @param path
     * @param base64FileName
     * @param bytesFileName
     * @return
     */
    public static boolean changeBase64ToBytesFile( final String path, final String base64FileName, final String bytesFileName){
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
