package com.example.lrdbackend.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingRequest {
    private Long roomId;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Long> attendeeIds;
}