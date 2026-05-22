package com.example.lrdbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "meeting_files")
public class MeetingFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Meeting meeting;

    @Column(nullable = false, length = 200)
    private String fileName;

    @Column(nullable = false, length = 100)
    private String fileType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(length = 200)
    private String fileUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
