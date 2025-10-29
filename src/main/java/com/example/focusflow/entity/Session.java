package com.example.focusflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
public class Session {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "session_code", unique = true, nullable = false)
    private String sessionCode;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;
    
    @Column(name = "duration_minutes", nullable = false)
    private double durationMinutes;
    
    @Column(name = "break_minutes", nullable = false)
    private double breakMinutes;
    
    @Column(name = "long_break_minutes", nullable = false)
    private double longBreakMinutes;
    
    @Column(name = "total_cycles", nullable = false)
    private int totalCycles;
    
    @Column(name = "current_cycle")
    private int currentCycle = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status = SessionStatus.CREATED;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "current_time_left")
    private Integer currentTimeLeft;
    
    @Column(name = "is_running")
    private Boolean isRunning = false;
    
    @Column(name = "is_break")
    private Boolean isBreak = false;
    
    @Column(name = "timer_started_at")
    private LocalDateTime timerStartedAt;
    
    // Constructors
    public Session() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSessionCode() {
        return sessionCode;
    }
    
    public void setSessionCode(String sessionCode) {
        this.sessionCode = sessionCode;
    }
    
    public User getCreator() {
        return creator;
    }
    
    public void setCreator(User creator) {
        this.creator = creator;
    }
    
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
    
    public int getCurrentCycle() {
        return currentCycle;
    }
    
    public void setCurrentCycle(int currentCycle) {
        this.currentCycle = currentCycle;
    }
    
    public SessionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SessionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public Integer getCurrentTimeLeft() {
        return currentTimeLeft;
    }
    
    public void setCurrentTimeLeft(Integer currentTimeLeft) {
        this.currentTimeLeft = currentTimeLeft;
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
    
    public LocalDateTime getTimerStartedAt() {
        return timerStartedAt;
    }
    
    public void setTimerStartedAt(LocalDateTime timerStartedAt) {
        this.timerStartedAt = timerStartedAt;
    }
    
    public enum SessionStatus {
        CREATED, ACTIVE, PAUSED, COMPLETED, ENDED_EARLY
    }
}
