package com.example.focusflow.controller;

import com.example.focusflow.entity.Session;
import com.example.focusflow.entity.User;
import com.example.focusflow.service.SessionService;
import com.example.focusflow.service.UserService;
import com.example.focusflow.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {
    
    @Autowired
    private SessionService sessionService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Session> createSession(
            @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal OAuth2User oauth2User) {
        
        try {
            User user;
            
            if (oauth2User == null) {
                // Demo mode - create or get demo user
                user = userRepository.findByEmail("demo@focusflow.app").orElseGet(() -> {
                    User demoUser = new User();
                    demoUser.setEmail("demo@focusflow.app");
                    demoUser.setUsername("Demo User");
                    demoUser.setGoogleId("demo-user-id");
                    demoUser.setFirstName("Demo");
                    demoUser.setLastName("User");
                    demoUser.setProfilePictureUrl(null);
                    demoUser.setAnonymous(true);
                    System.out.println("Creating demo user for session");
                    return userRepository.save(demoUser);
                });
            } else {
                // OAuth mode - get or create user from OAuth2 data
                String email = oauth2User.getAttributes().get("email").toString();
                user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setUsername(email);
                    newUser.setGoogleId(oauth2User.getAttributes().get("sub").toString());
                    newUser.setFirstName(oauth2User.getAttributes().get("given_name").toString());
                    newUser.setLastName(oauth2User.getAttributes().get("family_name").toString());
                    newUser.setProfilePictureUrl(oauth2User.getAttributes().get("picture").toString());
                    newUser.setAnonymous(false);
                    return userRepository.save(newUser);
                });
            }
            
            Session session = sessionService.createSession(
                user, 
                request.getDurationMinutes(), 
                request.getBreakMinutes(), 
                request.getLongBreakMinutes(),
                request.getTotalCycles()
            );
            
            System.out.println("Session created successfully for user: " + user.getEmail());
            return ResponseEntity.ok(session);
            
        } catch (Exception e) {
            System.err.println("Error creating session: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/code/{sessionCode}")
    public ResponseEntity<Session> getSessionByCode(@PathVariable String sessionCode) {
        return sessionService.findBySessionCode(sessionCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable Long id) {
        return sessionService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<Session>> getSessionHistory(@AuthenticationPrincipal OAuth2User oauth2User) {
        try {
            String email;
            
            if (oauth2User == null) {
                // Demo mode
                email = "demo@focusflow.app";
            } else {
                // OAuth mode
                email = oauth2User.getAttributes().get("email").toString();
            }
            
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Session> sessions = sessionService.findByCreatorOrderByCreatedAtDesc(userOpt.get());
            System.out.println("Retrieved " + sessions.size() + " sessions for user: " + email);
            return ResponseEntity.ok(sessions);
            
        } catch (Exception e) {
            System.err.println("Error fetching session history: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Session> updateSessionStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Session.SessionStatus status = Session.SessionStatus.valueOf(request.get("status"));
            Session session = sessionService.updateSessionStatus(id, status);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/cycle")
    public ResponseEntity<Session> updateCurrentCycle(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        try {
            Integer cycle = request.get("cycle");
            Session session = sessionService.updateCurrentCycle(id, cycle);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/check-completion")
    public ResponseEntity<Session> checkCompletion(@PathVariable Long id) {
        try {
            Session session = sessionService.checkAndUpdateCompletion(id);
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/timer-state")
    public ResponseEntity<Session> updateTimerState(@PathVariable Long id, @RequestBody TimerStateRequest request) {
        try {
            Session session = sessionService.updateTimerState(
                id, 
                request.getTimeLeft(), 
                request.getIsRunning(), 
                request.getIsBreak()
            );
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{id}/join")
    public ResponseEntity<Session> joinSession(@PathVariable Long id, @RequestBody Map<String, Long> request) {
        try {
            Long userId = request.get("userId");
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Session session = sessionService.joinSession(id, userOpt.get());
            return ResponseEntity.ok(session);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    public static class CreateSessionRequest {
        private double durationMinutes;
        private double breakMinutes;
        private double longBreakMinutes;
        private int totalCycles;
        
        // Getters and setters
        
        public double getDurationMinutes() {
            return durationMinutes;
        }
        
        public void setDurationMinutes(double durationMinutes) {
            this.durationMinutes = durationMinutes;
        }
        
        public double getBreakMinutes() {
            return breakMinutes;
        }
        
        public void setBreakMinutes(double breakMinutes) {
            this.breakMinutes = breakMinutes;
        }
        
        public double getLongBreakMinutes() {
            return longBreakMinutes;
        }
        
        public void setLongBreakMinutes(double longBreakMinutes) {
            this.longBreakMinutes = longBreakMinutes;
        }
        
        public int getTotalCycles() {
            return totalCycles;
        }
        
        public void setTotalCycles(int totalCycles) {
            this.totalCycles = totalCycles;
        }
    }
    
    public static class TimerStateRequest {
        private Integer timeLeft;
        private Boolean isRunning;
        private Boolean isBreak;
        
        public Integer getTimeLeft() {
            return timeLeft;
        }
        
        public void setTimeLeft(Integer timeLeft) {
            this.timeLeft = timeLeft;
        }
        
        public Boolean getIsRunning() {
            return isRunning;
        }
        
        public void setIsRunning(Boolean isRunning) {
            this.isRunning = isRunning;
        }
        
        public Boolean getIsBreak() {
            return isBreak;
        }
        
        public void setIsBreak(Boolean isBreak) {
            this.isBreak = isBreak;
        }
    }
}
