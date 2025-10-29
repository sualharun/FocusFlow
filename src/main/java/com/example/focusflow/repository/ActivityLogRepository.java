package com.example.focusflow.repository;

import com.example.focusflow.entity.ActivityLog;
import com.example.focusflow.entity.Session;
import com.example.focusflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
    List<ActivityLog> findBySessionOrderByCreatedAtDesc(Session session);
    List<ActivityLog> findByUserAndSessionOrderByCreatedAtDesc(User user, Session session);
}
