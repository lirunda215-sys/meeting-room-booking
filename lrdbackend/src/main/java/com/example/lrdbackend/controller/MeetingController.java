package com.example.lrdbackend.controller;

import com.example.lrdbackend.dto.MeetingDetailDTO;
import com.example.lrdbackend.dto.MeetingRequest;
import com.example.lrdbackend.entity.Meeting;
import com.example.lrdbackend.entity.User;
import com.example.lrdbackend.service.MeetingService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class MeetingController {

    private final MeetingService meetingService;

    @GetMapping
    public ResponseEntity<List<Meeting>> getAllMeetings() {
        log.info("获取所有会议");
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<Meeting>> getMeetingsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(meetingService.getMeetingsByRoom(roomId));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<Meeting>> getMeetingsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(meetingService.getMeetingsByOrganizer(organizerId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Meeting>> getMyMeetings(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        log.info("获取我的会议, userId from token: {}", userId);
        if (userId == null) {
            log.warn("用户ID为空，可能token无效");
            return ResponseEntity.status(401).build();
        }
        List<Meeting> meetings = meetingService.getMyMeetings(userId);
        log.info("找到 {} 个会议", meetings.size());
        return ResponseEntity.ok(meetings);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Meeting>> getMeetingsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(meetingService.getMeetingsByDateRange(startDate, endDate));
    }

    @GetMapping("/room/{roomId}/date-range")
    public ResponseEntity<List<Meeting>> getMeetingsByRoomAndDateRange(
            @PathVariable Long roomId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(meetingService.getMeetingsByRoomAndDateRange(roomId, startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeeting(@PathVariable Long id) {
        return meetingService.getMeetingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/{id}/details")
    public ResponseEntity<MeetingDetailDTO> getMeetingWithDetails(@PathVariable Long id) {
        return meetingService.getMeetingDetailDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createMeeting(@RequestBody MeetingRequest request, HttpServletRequest httpRequest) {
        try {
            Long userId = (Long) httpRequest.getAttribute("userId");
            log.info("创建会议, userId: {}", userId);
            if (userId == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication failed: No valid token found"));
            }
            Meeting meeting = meetingService.createMeeting(request, userId);
            return ResponseEntity.ok(meeting);
        } catch (RuntimeException e) {
            log.error("创建会议失败: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMeeting(@PathVariable Long id, @RequestBody MeetingRequest request) {
        try {
            Meeting meeting = meetingService.updateMeeting(id, request);
            return meeting != null ? ResponseEntity.ok(meeting) : ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelMeeting(@PathVariable Long id, HttpServletRequest httpRequest) {
        try {
            Long userId = (Long) httpRequest.getAttribute("userId");
            String roleStr = (String) httpRequest.getAttribute("userRole");
            if (userId == null) {
                return ResponseEntity.status(401).build();
            }
            boolean isAdmin = "ADMIN".equals(roleStr);
            Meeting meeting = meetingService.cancelMeeting(id, userId, isAdmin);
            return ResponseEntity.ok(meeting);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeeting(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
        return ResponseEntity.ok().build();
    }
}