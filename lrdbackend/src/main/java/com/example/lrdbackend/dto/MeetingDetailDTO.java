package com.example.lrdbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDetailDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private RoomDTO room;
    private UserDTO organizer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MeetingAttendeeDTO> attendees;
    private List<MeetingFileDTO> files;
    private List<MeetingCateringDTO> caterings;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomDTO {
        private Long id;
        private String name;
        private String location;
        private Integer capacity;
        private String equipment;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String username;
        private String name;
        private String email;
        private String role;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingAttendeeDTO {
        private Long id;
        private UserDTO user;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingFileDTO {
        private Long id;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String fileUrl;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingCateringDTO {
        private Long id;
        private CateringServiceDTO catering;
        private Integer quantity;
        private BigDecimal totalPrice;
        private LocalDateTime createdAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CateringServiceDTO {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Boolean isActive;
    }
}
