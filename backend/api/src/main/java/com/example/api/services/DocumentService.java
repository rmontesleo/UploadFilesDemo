package com.example.api.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dmo.fileapp.utils.FileBuilder;
import com.example.api.dtos.BuildBase64ToBytesRequest;
import com.example.api.dtos.BuildOrderRequest;
import com.example.api.dtos.DocumentResponse;
import com.example.api.dtos.ItemBase64Request;
import com.example.api.dtos.ItemByteArrayRequest;

@Service
public class DocumentService {

    @Value("${filesPath}")
    private String filesPath;

    private Optional<DocumentResponse> getDocumentResponse(boolean isCreated, String path, String fileName) {
        if (isCreated) {
            return Optional.of(new DocumentResponse(path, fileName, isCreated));
        }
        return Optional.empty();
    }

    public Optional<DocumentResponse> createSingleFileFromBase64(ItemBase64Request itemBase64Request) {
        String fileName = itemBase64Request.getFileName();
        boolean isCreated = FileBuilder
                .buildFileFromBase64Content(filesPath, fileName, itemBase64Request.getStringBase64());

        return getDocumentResponse(isCreated, filesPath, fileName);

    }

    public Optional<DocumentResponse> createDocumentFromBytes(ItemByteArrayRequest itemByteArrayRequest) {
        String fileName = itemByteArrayRequest.getFileName();
        boolean isCreated = FileBuilder
                .buildFileFromByteArray(filesPath, fileName, itemByteArrayRequest.getByteArray());

        return getDocumentResponse(isCreated, filesPath, fileName);
    }

    public Optional<DocumentResponse> joinBase64Files(BuildOrderRequest buildOrderRequest) {
        String fileName = buildOrderRequest.getFileName();
        boolean isCreated = FileBuilder
                .joinChunksInFile(filesPath, fileName, buildOrderRequest.getFileNameList());

        return getDocumentResponse(isCreated, filesPath, fileName);
    }

    public Optional<DocumentResponse> createByteFileFromBase64(BuildBase64ToBytesRequest base64ToBytesRequest) {
        String base64FileName = base64ToBytesRequest.getBase64FileName();
        String bytesFileName = base64ToBytesRequest.getBytesFileName();

        boolean isCreated = FileBuilder.changeBase64ToBytesFile(filesPath, base64FileName, bytesFileName);

        return getDocumentResponse(isCreated, filesPath, bytesFileName);
    }

}
