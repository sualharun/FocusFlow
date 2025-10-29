package com.example.focusflow.service;

import com.example.focusflow.entity.User;
import com.example.focusflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Random;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createAnonymousUser() {
        String username = generateAnonymousUsername();
        User user = new User(username);
        user.setAnonymous(true);
        return userRepository.save(user);
    }
    
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    private String generateAnonymousUsername() {
        String[] adjectives = {"Quick", "Smart", "Focus", "Zen", "Calm", "Swift", "Bright", "Cool"};
        String[] nouns = {"Student", "Learner", "Scholar", "Mind", "Brain", "Thinker", "Focus", "User"};
        
        Random random = new Random();
        String adjective = adjectives[random.nextInt(adjectives.length)];
        String noun = nouns[random.nextInt(nouns.length)];
        int number = random.nextInt(1000);
        
        String username = adjective + noun + number;
        
        // Ensure uniqueness
        while (userRepository.existsByUsername(username)) {
            number = random.nextInt(1000);
            username = adjective + noun + number;
        }
        
        return username;
    }
}
