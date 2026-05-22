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
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User organizer;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "meeting", "user"})
    private List<MeetingAttendee> attendees = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "meeting"})
    private List<MeetingFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "meeting"})
    private List<MeetingCatering> caterings = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum MeetingStatus {
        SCHEDULED, CANCELLED, COMPLETED
    }
}