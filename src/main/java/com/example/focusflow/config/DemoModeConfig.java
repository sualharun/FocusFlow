package com.example.focusflow.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DemoModeConfig {

    @Value("${spring.security.oauth2.client.registration.google.client-id:demo-client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:demo-client-secret}")
    private String googleClientSecret;

    private boolean demoMode = false;

    @PostConstruct
    public void init() {
        // Check if we're running in demo mode (default OAuth values)
        demoMode = "demo-client-id".equals(googleClientId) || 
                  "demo-client-secret".equals(googleClientSecret) ||
                  "your-google-client-id".equals(googleClientId) ||
                  "your-google-client-secret".equals(googleClientSecret);
        
        if (demoMode) {
            System.out.println("🚀 FocusFlow started in DEMO MODE");
            System.out.println("   • Timer functionality: ✅ Available");
            System.out.println("   • Session sharing: ✅ Available");
            System.out.println("   • Google OAuth login: ❌ Disabled (demo mode)");
            System.out.println("   • To enable OAuth: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables");
            System.out.println();
        } else {
            System.out.println("🔐 FocusFlow started with OAuth enabled");
            System.out.println("   • Google OAuth login: ✅ Enabled");
            System.out.println();
        }
    }

    public boolean isDemoMode() {
        return demoMode;
    }
}