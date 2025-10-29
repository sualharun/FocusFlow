package com.example.focusflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getAuthenticatedUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        Map<String, Object> response = new HashMap<>();
        
        if (oauth2User == null) {
            response.put("authenticated", false);
            System.out.println("No OAuth2User found in security context");
            return ResponseEntity.ok(response);
        }

        try {
            Map<String, Object> attributes = oauth2User.getAttributes();
            System.out.println("OAuth2User attributes: " + attributes);
            
            String email = attributes.get("email").toString();
            String firstName = attributes.get("given_name").toString();
            String lastName = attributes.get("family_name").toString();
            
            response.put("authenticated", true);
            response.put("user", Map.of(
                "id", 1L, // Temporary ID
                "email", email,
                "firstName", firstName,
                "lastName", lastName,
                "profilePicture", attributes.get("picture")
            ));
            
            System.out.println("User authenticated successfully: " + email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error processing authenticated user: " + e.getMessage());
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}