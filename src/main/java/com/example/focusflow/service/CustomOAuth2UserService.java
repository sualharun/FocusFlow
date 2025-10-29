package com.example.focusflow.service;

import com.example.focusflow.entity.User;
import com.example.focusflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // Extract user information from Google
        Map<String, Object> attributes = oauth2User.getAttributes();
        String googleId = attributes.get("sub").toString();
        String email = attributes.get("email").toString();
        String firstName = attributes.get("given_name").toString();
        String lastName = attributes.get("family_name").toString();
        String profilePictureUrl = attributes.get("picture").toString();
        
        // Check if user already exists
        User user = userRepository.findByGoogleId(googleId)
            .orElseGet(() -> userRepository.findByEmail(email)
                .orElse(null));
        
        if (user == null) {
            // Create new user
            user = new User();
            user.setGoogleId(googleId);
            user.setEmail(email);
            user.setUsername(email); // Use email as username for now
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setProfilePictureUrl(profilePictureUrl);
            user.setAnonymous(false);
        } else {
            // Update existing user with latest info
            user.setGoogleId(googleId);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setProfilePictureUrl(profilePictureUrl);
        }
        
        userRepository.save(user);
        
        return oauth2User;
    }
}