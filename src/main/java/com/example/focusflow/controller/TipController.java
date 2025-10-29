package com.example.focusflow.controller;

import com.example.focusflow.service.TipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tips")
@CrossOrigin(origins = "*")
public class TipController {
    
    @Autowired
    private TipService tipService;
    
    @PostMapping
    public ResponseEntity<TipResponse> getTip(@RequestBody TipRequest request) {
        String tip = tipService.getContextualTip(request.getContext());
        return ResponseEntity.ok(new TipResponse(tip));
    }
    
    @GetMapping("/random")
    public ResponseEntity<TipResponse> getRandomTip() {
        String tip = tipService.getRandomTip();
        return ResponseEntity.ok(new TipResponse(tip));
    }
    
    public static class TipRequest {
        private String context;
        private Long userId;
        
        // Getters and setters
        public String getContext() {
            return context;
        }
        
        public void setContext(String context) {
            this.context = context;
        }
        
        public Long getUserId() {
            return userId;
        }
        
        public void setUserId(Long userId) {
            this.userId = userId;
        }
    }
    
    public static class TipResponse {
        private String tip;
        
        public TipResponse(String tip) {
            this.tip = tip;
        }
        
        // Getters and setters
        public String getTip() {
            return tip;
        }
        
        public void setTip(String tip) {
            this.tip = tip;
        }
    }
}
