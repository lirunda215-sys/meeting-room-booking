package com.example.lrdbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 200)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private UserRole role = UserRole.EMPLOYEE;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "meeting"})
    private List<MeetingAttendee> attendees = new ArrayList<>();

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "organizer", "room", "attendees", "meetings"})
    private List<Meeting> organizedMeetings = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum UserRole {
        EMPLOYEE, ADMIN
    }
}