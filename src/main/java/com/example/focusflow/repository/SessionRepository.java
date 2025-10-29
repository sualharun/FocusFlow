package com.example.focusflow.repository;

import com.example.focusflow.entity.Session;
import com.example.focusflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findBySessionCode(String sessionCode);
    boolean existsBySessionCode(String sessionCode);
    List<Session> findByCreatorOrderByCreatedAtDesc(User creator);
}
