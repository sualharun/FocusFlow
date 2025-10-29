package com.example.focusflow.service;

import com.example.focusflow.entity.Session;
import com.example.focusflow.entity.User;
import com.example.focusflow.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
public class SessionService {
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public Session createSession(User creator, double durationMinutes, double breakMinutes, double longBreakMinutes, int totalCycles) {
        Session session = new Session();
        session.setSessionCode(generateSessionCode());
        session.setCreator(creator);
        session.setDurationMinutes(durationMinutes);
        session.setBreakMinutes(breakMinutes);
        session.setLongBreakMinutes(longBreakMinutes);
        session.setTotalCycles(totalCycles);
        session.setStatus(Session.SessionStatus.CREATED);
        
        return sessionRepository.save(session);
    }
    
    public Optional<Session> findBySessionCode(String sessionCode) {
        return sessionRepository.findBySessionCode(sessionCode);
    }
    
    public Optional<Session> findById(Long id) {
        return sessionRepository.findById(id);
    }
    
    public Session updateSessionStatus(Long sessionId, Session.SessionStatus status) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.setStatus(status);
            
            if (status == Session.SessionStatus.ACTIVE && session.getStartedAt() == null) {
                session.setStartedAt(LocalDateTime.now());
            } else if (status == Session.SessionStatus.COMPLETED) {
                session.setCompletedAt(LocalDateTime.now());
            }
            
            session = sessionRepository.save(session);
            
            // Broadcast session update via WebSocket
            messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode(), session);
            
            return session;
        }
        throw new RuntimeException("Session not found");
    }
    
    public Session updateCurrentCycle(Long sessionId, int cycle) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.setCurrentCycle(cycle);
            
            // Check if all cycles are completed (allow for both >= and > to catch edge cases)
            if (cycle >= session.getTotalCycles() && session.getStatus() != Session.SessionStatus.COMPLETED) {
                // Set cycle to exactly the total cycles
                session.setCurrentCycle(session.getTotalCycles());
                session.setStatus(Session.SessionStatus.COMPLETED);
                session.setCompletedAt(LocalDateTime.now());
                session.setIsRunning(false); // Ensure timer is stopped
                session.setIsBreak(false);   // Clear break state
                System.out.println("🎉 Session " + sessionId + " marked as COMPLETED. All " + session.getTotalCycles() + " cycles completed.");
            } else if (session.getStatus() != Session.SessionStatus.COMPLETED) {
                System.out.println("📊 Session " + sessionId + " cycle updated to: " + cycle + "/" + session.getTotalCycles());
            }
            
            session = sessionRepository.save(session);
            
            // Broadcast session update via WebSocket
            messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode(), session);
            
            return session;
        }
        throw new RuntimeException("Session not found");
    }
    
    public Session checkAndUpdateCompletion(Long sessionId) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            
            // Force completion check - if cycles are complete but status isn't updated
            if (session.getCurrentCycle() >= session.getTotalCycles() && 
                session.getStatus() != Session.SessionStatus.COMPLETED) {
                
                session.setCurrentCycle(session.getTotalCycles());
                session.setStatus(Session.SessionStatus.COMPLETED);
                session.setCompletedAt(LocalDateTime.now());
                session.setIsRunning(false);
                session.setIsBreak(false);
                
                session = sessionRepository.save(session);
                
                // Broadcast session update via WebSocket
                messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode(), session);
                
                System.out.println("✅ Force-completed session " + sessionId + " with " + session.getTotalCycles() + " cycles");
            }
            
            return session;
        }
        throw new RuntimeException("Session not found");
    }
    
    private String generateSessionCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        
        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }
        
        String sessionCode = code.toString();
        
        // Ensure uniqueness
        while (sessionRepository.existsBySessionCode(sessionCode)) {
            code = new StringBuilder();
            for (int i = 0; i < 6; i++) {
                code.append(characters.charAt(random.nextInt(characters.length())));
            }
            sessionCode = code.toString();
        }
        
        return sessionCode;
    }
    
    public Session updateTimerState(Long sessionId, Integer timeLeft, Boolean isRunning, Boolean isBreak) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            session.setCurrentTimeLeft(timeLeft);
            session.setIsRunning(isRunning);
            session.setIsBreak(isBreak);
            
            if (isRunning) {
                session.setTimerStartedAt(LocalDateTime.now());
            }
            
            session = sessionRepository.save(session);
            
            // Broadcast timer update via WebSocket
            messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode(), session);
            
            return session;
        }
        throw new RuntimeException("Session not found");
    }
    
    public Session joinSession(Long sessionId, User user) {
        Optional<Session> sessionOpt = sessionRepository.findById(sessionId);
        if (sessionOpt.isPresent()) {
            Session session = sessionOpt.get();
            
            // Broadcast user joined message via WebSocket
            Map<String, Object> userJoinedMessage = new HashMap<>();
            userJoinedMessage.put("user", user.getUsername());
            userJoinedMessage.put("timestamp", LocalDateTime.now());
            messagingTemplate.convertAndSend("/topic/session/" + session.getSessionCode() + "/user-joined", userJoinedMessage);
            
            return session;
        }
        throw new RuntimeException("Session not found");
    }

    public List<Session> findByCreatorOrderByCreatedAtDesc(User creator) {
        return sessionRepository.findByCreatorOrderByCreatedAtDesc(creator);
    }
}
