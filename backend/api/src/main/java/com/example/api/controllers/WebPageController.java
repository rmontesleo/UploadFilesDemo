package com.example.api.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebPageController {


    @GetMapping()
    public String  goToIndexPage(){
        return "index";
    }
    
}
