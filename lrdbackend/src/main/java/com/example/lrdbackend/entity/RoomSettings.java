package com.example.lrdbackend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "room_settings")
public class RoomSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "max_duration_minutes")
    private Integer maxDurationMinutes = 240;

    @Column(name = "min_duration_minutes")
    private Integer minDurationMinutes = 30;

    @Column(name = "max_booking_days_ahead")
    private Integer maxBookingDaysAhead = 7;

    @Column(name = "min_booking_advance_minutes")
    private Integer minBookingAdvanceMinutes = 30;

    @Column(name = "send_email_notification")
    private Boolean sendEmailNotification = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}