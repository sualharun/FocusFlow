package com.example.focusflow.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class TipService {
    
    private final List<String> focusTips = List.of(
        "Try the 2-minute rule: If a task takes less than 2 minutes, do it now!",
        "Use the Pomodoro Technique: Work in focused 25-minute intervals.",
        "Eliminate distractions: Put your phone in another room while working.",
        "Take regular breaks: Your brain needs time to rest and recharge.",
        "Set clear, specific goals for each work session.",
        "Use background music or white noise to maintain focus.",
        "Stay hydrated and maintain good posture while working.",
        "Practice deep breathing exercises to reduce stress and improve focus.",
        "Time-block your schedule to dedicate specific hours to focused work.",
        "Work during your peak energy hours when you're naturally most alert.",
        "Use the 'eat the frog' technique: Tackle your hardest task first.",
        "Create a dedicated workspace free from clutter and distractions.",
        "Practice mindfulness meditation to improve your attention span.",
        "Take short walks during breaks to refresh your mind.",
        "Use visualization techniques to imagine completing your tasks successfully.",
        "Set up accountability systems with friends or colleagues.",
        "Reward yourself after completing focused work sessions.",
        "Break large tasks into smaller, manageable chunks.",
        "Use natural light when possible to maintain alertness.",
        "Practice the 'one thing' principle: Focus on one task at a time."
    );
    
    public String getRandomTip() {
        Random random = new Random();
        return focusTips.get(random.nextInt(focusTips.size()));
    }
    
    public String getContextualTip(String context) {
        // For now, return a random tip. In the future, this could use AI to generate contextual tips
        return getRandomTip();
    }
}
