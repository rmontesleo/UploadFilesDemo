package com.example.api.controllers;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.api.dtos.BuildBase64ToBytesRequest;
import com.example.api.dtos.BuildOrderRequest;
import com.example.api.dtos.DocumentResponse;
import com.example.api.dtos.ItemBase64Request;
import com.example.api.dtos.ItemByteArrayRequest;
import com.example.api.services.DocumentService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/document")
@AllArgsConstructor
@Slf4j
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public String ping(){
        return "ping";
    }

    private ResponseEntity<DocumentResponse> getDocumentResponse( Optional<DocumentResponse> optionalDocumentResponse ){
        return optionalDocumentResponse
            .map( response -> ResponseEntity.status( HttpStatus.CREATED ).body( response ) )
            .orElseThrow();
    }


    @PostMapping("/base64")
    public ResponseEntity<DocumentResponse> postSimpleBase64( @RequestBody ItemBase64Request requestBody ) {
        log.debug(  "Request Body is "  );
        return  getDocumentResponse ( documentService.createSingleFileFromBase64( requestBody ) );
    }

    @PostMapping("/byteArray")
    public ResponseEntity<DocumentResponse> postSimpleByteArray( @RequestBody ItemByteArrayRequest requestBody ){
        log.debug( "Request body of byte array" );
        return getDocumentResponse( documentService.createDocumentFromBytes(requestBody) );
    }


    @PostMapping("/buildFile")
    public ResponseEntity<DocumentResponse> buildFile(@RequestBody BuildOrderRequest requestBody ){
        log.debug("Request the build of the file of base64..");
        requestBody.getFileNameList().forEach(System.out::print);
        return getDocumentResponse( documentService.joinBase64Files(requestBody) );
    }


    @PostMapping("/changeBase64FileToBytes")
    public ResponseEntity<DocumentResponse> getMethodName(@RequestBody BuildBase64ToBytesRequest requestBody  ) {
        log.debug("Change the Base64 file to create a file from bytes");
        return getDocumentResponse ( documentService.createByteFileFromBase64(requestBody) );
    }   
    
}
