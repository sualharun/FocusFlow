package com.example.focusflow.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.focusflow.config.DemoModeConfig;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private DemoModeConfig demoModeConfig;

    @GetMapping("/demo-mode")
    public ResponseEntity<Map<String, Object>> getDemoModeStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("demoMode", demoModeConfig.isDemoMode());
        response.put("oauthEnabled", !demoModeConfig.isDemoMode());
        
        if (demoModeConfig.isDemoMode()) {
            response.put("message", "Running in demo mode - OAuth login disabled");
            response.put("features", Map.of(
                "timer", "enabled",
                "sessionSharing", "enabled", 
                "googleLogin", "disabled"
            ));
        } else {
            response.put("message", "OAuth authentication enabled");
            response.put("features", Map.of(
                "timer", "enabled",
                "sessionSharing", "enabled",
                "googleLogin", "enabled"
            ));
        }
        
        return ResponseEntity.ok(response);
    }
}