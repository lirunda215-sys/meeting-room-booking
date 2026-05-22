package com.example.lrdbackend.service;

import com.example.lrdbackend.dto.MeetingDetailDTO;
import com.example.lrdbackend.dto.MeetingRequest;
import com.example.lrdbackend.entity.*;
import com.example.lrdbackend.repository.MeetingAttendeeRepository;
import com.example.lrdbackend.repository.MeetingCateringRepository;
import com.example.lrdbackend.repository.MeetingFileRepository;
import com.example.lrdbackend.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;
    private final MeetingFileRepository meetingFileRepository;
    private final MeetingCateringRepository meetingCateringRepository;
    private final RoomService roomService;
    private final UserService userService;
    private final RoomSettingsService roomSettingsService;
    private final SystemSettingsService systemSettingsService;
    private final EmailService emailService;

    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    public List<Meeting> getMeetingsByRoom(Long roomId) {
        return meetingRepository.findByRoomIdOrderByStartTimeAsc(roomId);
    }

    public List<Meeting> getMeetingsByOrganizer(Long organizerId) {
        return meetingRepository.findByOrganizerIdOrderByStartTimeAsc(organizerId);
    }

    public List<Meeting> getMyMeetings(Long userId) {
        return meetingRepository.findAllByUserId(userId);
    }

    public List<Meeting> getMeetingsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return meetingRepository.findByDateRange(startDate, endDate);
    }

    public List<Meeting> getMeetingsByRoomAndDateRange(Long roomId, LocalDateTime startDate, LocalDateTime endDate) {
        return meetingRepository.findByRoomIdAndDateRange(roomId, startDate, endDate);
    }

    public Optional<Meeting> getMeetingById(Long id) {
        return meetingRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Meeting> getMeetingWithDetailsById(Long id) {
        log.info("========================================");
        log.info("开始加载会议详情, ID: {}", id);
        
        // 先获取基本会议信息
        Optional<Meeting> meetingOptional = meetingRepository.findWithDetailsById(id);
        if (!meetingOptional.isPresent()) {
            log.warn("会议不存在, ID: {}", id);
            log.info("========================================");
            return Optional.empty();
        }
        
        Meeting meeting = meetingOptional.get();
        
        // 单独查询并手动加载关联数据，避免懒加载问题
        List<MeetingAttendee> attendees = meetingAttendeeRepository.findByMeetingId(id);
        log.info("查询到参会者数量: {}", attendees.size());
        for (int i = 0; i < attendees.size(); i++) {
            MeetingAttendee a = attendees.get(i);
            log.info("  参会者{}: id={}, user={}, status={}", i+1, a.getId(), 
                    a.getUser() != null ? a.getUser().getName() : "null", a.getStatus());
        }
        
        List<MeetingFile> files = meetingFileRepository.findByMeetingId(id);
        log.info("查询到文件数量: {}", files.size());
        for (int i = 0; i < files.size(); i++) {
            MeetingFile f = files.get(i);
            log.info("  文件{}: id={}, name={}, size={}", i+1, f.getId(), f.getFileName(), f.getFileSize());
        }
        
        List<MeetingCatering> caterings = meetingCateringRepository.findByMeetingId(id);
        log.info("查询到茶水服务数量: {}", caterings.size());
        for (int i = 0; i < caterings.size(); i++) {
            MeetingCatering c = caterings.get(i);
            log.info("  茶水{}: id={}, catering={}", i+1, c.getId(), 
                    c.getCatering() != null ? c.getCatering().getName() : "null");
        }
        
        // 直接设置关联数据
        meeting.setAttendees(attendees);
        meeting.setFiles(files);
        meeting.setCaterings(caterings);
        
        log.info("会议详情加载完成, attendees: {}, files: {}, caterings: {}", 
                attendees.size(), files.size(), caterings.size());
        log.info("========================================");
        
        return Optional.of(meeting);
    }

    @Transactional(readOnly = true)
    public Optional<MeetingDetailDTO> getMeetingDetailDTO(Long id) {
        log.info("========================================");
        log.info("开始加载会议详情DTO, ID: {}", id);
        
        Optional<Meeting> meetingOptional = meetingRepository.findWithDetailsById(id);
        if (!meetingOptional.isPresent()) {
            log.warn("会议不存在, ID: {}", id);
            return Optional.empty();
        }
        
        Meeting meeting = meetingOptional.get();
        
        // 单独查询并手动加载关联数据，避免懒加载问题
        List<MeetingAttendee> attendees = meetingAttendeeRepository.findByMeetingId(id);
        log.info("查询到参会者数量: {}", attendees.size());
        
        List<MeetingFile> files = meetingFileRepository.findByMeetingId(id);
        log.info("查询到文件数量: {}", files.size());
        for (int i = 0; i < files.size(); i++) {
            MeetingFile f = files.get(i);
            log.info("  文件{}: id={}, name={}, size={}", i+1, f.getId(), f.getFileName(), f.getFileSize());
        }
        
        List<MeetingCatering> caterings = meetingCateringRepository.findByMeetingId(id);
        log.info("查询到茶水服务数量: {}", caterings.size());
        for (int i = 0; i < caterings.size(); i++) {
            MeetingCatering c = caterings.get(i);
            log.info("  茶水{}: id={}, catering={}, quantity={}, totalPrice={}", 
                    i+1, c.getId(), 
                    c.getCatering() != null ? c.getCatering().getName() : "null",
                    c.getQuantity(), c.getTotalPrice());
        }
        
        // 构建 DTO
        MeetingDetailDTO dto = new MeetingDetailDTO();
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setStartTime(meeting.getStartTime());
        dto.setEndTime(meeting.getEndTime());
        dto.setStatus(meeting.getStatus() != null ? meeting.getStatus().name() : null);
        dto.setCreatedAt(meeting.getCreatedAt());
        dto.setUpdatedAt(meeting.getUpdatedAt());
        
        // 转换 Room
        if (meeting.getRoom() != null) {
            dto.setRoom(new MeetingDetailDTO.RoomDTO(
                meeting.getRoom().getId(),
                meeting.getRoom().getName(),
                meeting.getRoom().getLocation(),
                meeting.getRoom().getCapacity(),
                meeting.getRoom().getEquipment()
            ));
        }
        
        // 转换 Organizer
        if (meeting.getOrganizer() != null) {
            dto.setOrganizer(new MeetingDetailDTO.UserDTO(
                meeting.getOrganizer().getId(),
                meeting.getOrganizer().getUsername(),
                meeting.getOrganizer().getName(),
                meeting.getOrganizer().getEmail(),
                meeting.getOrganizer().getRole() != null ? meeting.getOrganizer().getRole().name() : null
            ));
        }
        
        // 直接使用加载好的数据转换，不依赖 meeting.getXxx()（避免 Hibernate 代理问题）
        dto.setAttendees(attendees.stream()
            .map(a -> {
                MeetingDetailDTO.UserDTO userDTO = null;
                if (a.getUser() != null) {
                    userDTO = new MeetingDetailDTO.UserDTO(
                        a.getUser().getId(), a.getUser().getUsername(),
                        a.getUser().getName(), a.getUser().getEmail(),
                        a.getUser().getRole() != null ? a.getUser().getRole().name() : null
                    );
                }
                return new MeetingDetailDTO.MeetingAttendeeDTO(
                    a.getId(), userDTO,
                    a.getStatus() != null ? a.getStatus().name() : null,
                    a.getCreatedAt()
                );
            })
            .collect(Collectors.toList()));
        
        dto.setFiles(files.stream()
            .map(f -> new MeetingDetailDTO.MeetingFileDTO(
                f.getId(), f.getFileName(), f.getFileType(),
                f.getFileSize(), f.getFileUrl(), f.getCreatedAt()
            ))
            .collect(Collectors.toList()));
        
        dto.setCaterings(caterings.stream()
            .map(c -> {
                MeetingDetailDTO.CateringServiceDTO serviceDTO = null;
                if (c.getCatering() != null) {
                    serviceDTO = new MeetingDetailDTO.CateringServiceDTO(
                        c.getCatering().getId(), c.getCatering().getName(),
                        c.getCatering().getDescription(), c.getCatering().getPrice(),
                        c.getCatering().getIsActive()
                    );
                }
                return new MeetingDetailDTO.MeetingCateringDTO(
                    c.getId(), serviceDTO, c.getQuantity(),
                    c.getTotalPrice(), c.getCreatedAt()
                );
            })
            .collect(Collectors.toList()));
        
        log.info("DTO构建完成: attendees={}, files={}, caterings={}", 
                dto.getAttendees().size(), dto.getFiles().size(), dto.getCaterings().size());
        log.info("========================================");
        
        return Optional.of(dto);
    }

    @Transactional
    public Meeting createMeeting(MeetingRequest request, Long organizerId) {
        Room room = roomService.getRoomById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        User organizer = userService.getUserById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));

        RoomSettings settings = roomSettingsService.getSettings();

        // 添加默认值防止空指针异常
        Integer maxDurationMinutes = settings.getMaxDurationMinutes() != null ? settings.getMaxDurationMinutes() : 240;
        Integer minDurationMinutes = settings.getMinDurationMinutes() != null ? settings.getMinDurationMinutes() : 30;
        Integer maxBookingDaysAhead = settings.getMaxBookingDaysAhead() != null ? settings.getMaxBookingDaysAhead() : 7;
        Integer minBookingAdvanceMinutes = settings.getMinBookingAdvanceMinutes() != null ? settings.getMinBookingAdvanceMinutes() : 30;
        Boolean sendEmailNotification = settings.getSendEmailNotification() != null ? settings.getSendEmailNotification() : true;

        LocalDateTime now = LocalDateTime.now();

        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        long durationMinutes = duration.toMinutes();

        if (durationMinutes < minDurationMinutes) {
            throw new RuntimeException("会议时长太短，最少 " + minDurationMinutes + " 分钟");
        }

        if (durationMinutes > maxDurationMinutes) {
            throw new RuntimeException("会议时长太长，最多 " + maxDurationMinutes + " 分钟");
        }

        // 检查时间是否在允许范围内
        String minBookingTime = systemSettingsService.getMinBookingTime();
        String maxBookingTime = systemSettingsService.getMaxBookingTime();
        int meetingStartHour = request.getStartTime().getHour();
        int meetingStartMin = request.getStartTime().getMinute();
        int meetingEndHour = request.getEndTime().getHour();
        int meetingEndMin = request.getEndTime().getMinute();
        
        String[] minParts = minBookingTime.split(":");
        String[] maxParts = maxBookingTime.split(":");
        int minHour = Integer.parseInt(minParts[0]);
        int minMin = Integer.parseInt(minParts[1]);
        int maxHour = Integer.parseInt(maxParts[0]);
        int maxMin = Integer.parseInt(maxParts[1]);
        
        if (meetingStartHour < minHour || (meetingStartHour == minHour && meetingStartMin < minMin)) {
            throw new RuntimeException("会议开始时间不能早于 " + minBookingTime);
        }
        if (meetingEndHour > maxHour || (meetingEndHour == maxHour && meetingEndMin > maxMin)) {
            throw new RuntimeException("会议结束时间不能晚于 " + maxBookingTime);
        }

        if (request.getStartTime().isBefore(now)) {
            throw new RuntimeException("不能预订过去的时间");
        }

        Duration timeUntilStart = Duration.between(now, request.getStartTime());
        if (timeUntilStart.toMinutes() < minBookingAdvanceMinutes) {
            throw new RuntimeException("至少需要提前 " + minBookingAdvanceMinutes + " 分钟预订");
        }

        Duration daysUntilStart = Duration.between(now.toLocalDate().atStartOfDay(), 
                                                    request.getStartTime().toLocalDate().atStartOfDay());
        if (daysUntilStart.toDays() > maxBookingDaysAhead) {
            throw new RuntimeException("最多只能提前 " + maxBookingDaysAhead + " 天预订");
        }

        List<Meeting> conflicting = meetingRepository.findConflictingMeetings(
                room, request.getStartTime(), request.getEndTime());

        if (!conflicting.isEmpty()) {
            throw new RuntimeException("该时间段已被其他预订占用，请选择其他时间");
        }

        Meeting meeting = new Meeting();
        meeting.setRoom(room);
        meeting.setOrganizer(organizer);
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setStartTime(request.getStartTime());
        meeting.setEndTime(request.getEndTime());
        meeting.setStatus(Meeting.MeetingStatus.SCHEDULED);

        Meeting savedMeeting = meetingRepository.save(meeting);

        if (request.getAttendeeIds() != null) {
            for (Long attendeeId : request.getAttendeeIds()) {
                User attendee = userService.getUserById(attendeeId).orElse(null);
                if (attendee != null) {
                    MeetingAttendee ma = new MeetingAttendee();
                    ma.setMeeting(savedMeeting);
                    ma.setUser(attendee);
                    ma.setStatus(MeetingAttendee.AttendeeStatus.INVITED);
                    meetingAttendeeRepository.save(ma);
                }
            }
        }

        if (sendEmailNotification) {
            try {
                emailService.sendBookingConfirmation(
                    organizer.getEmail(),
                    organizer.getName(),
                    savedMeeting.getTitle(),
                    room.getName(),
                    room.getLocation(),
                    savedMeeting.getStartTime(),
                    savedMeeting.getEndTime()
                );
            } catch (Exception e) {
                log.warn("Failed to send email notification: {}", e.getMessage());
                // 邮件发送失败不影响预订流程
            }
        }

        // 重新查询以确保关联数据被加载
        return meetingRepository.findById(savedMeeting.getId()).orElse(savedMeeting);
    }

    @Transactional
    public Meeting updateMeeting(Long id, MeetingRequest request) {
        return meetingRepository.findById(id).map(meeting -> {
            if (request.getRoomId() != null) {
                Room room = roomService.getRoomById(request.getRoomId())
                        .orElseThrow(() -> new RuntimeException("Room not found"));

                if (!meeting.getRoom().getId().equals(request.getRoomId()) ||
                    !meeting.getStartTime().equals(request.getStartTime()) ||
                    !meeting.getEndTime().equals(request.getEndTime())) {

                    List<Meeting> conflicting = meetingRepository.findConflictingMeetings(
                            room, request.getStartTime(), request.getEndTime());
                    conflicting = conflicting.stream().filter(m -> !m.getId().equals(id)).toList();

                    if (!conflicting.isEmpty()) {
                        throw new RuntimeException("该时间段已被其他预订占用，请选择其他时间");
                    }
                }

                meeting.setRoom(room);
            }

            if (request.getTitle() != null) meeting.setTitle(request.getTitle());
            if (request.getDescription() != null) meeting.setDescription(request.getDescription());
            if (request.getStartTime() != null) meeting.setStartTime(request.getStartTime());
            if (request.getEndTime() != null) meeting.setEndTime(request.getEndTime());

            if (request.getAttendeeIds() != null) {
                meeting.getAttendees().clear();
                for (Long attendeeId : request.getAttendeeIds()) {
                    User attendee = userService.getUserById(attendeeId).orElse(null);
                    if (attendee != null) {
                        MeetingAttendee ma = new MeetingAttendee();
                        ma.setMeeting(meeting);
                        ma.setUser(attendee);
                        ma.setStatus(MeetingAttendee.AttendeeStatus.INVITED);
                        meeting.getAttendees().add(ma);
                    }
                }
            }

            return meetingRepository.save(meeting);
        }).orElse(null);
    }

    @Transactional
    public Meeting cancelMeeting(Long id, Long userId, boolean isAdmin) {
        return meetingRepository.findById(id).map(meeting -> {
            if (!isAdmin && !meeting.getOrganizer().getId().equals(userId)) {
                throw new RuntimeException("只能取消自己的预订");
            }

            if (meeting.getStatus() == Meeting.MeetingStatus.CANCELLED) {
                throw new RuntimeException("预订已被取消");
            }

            meeting.setStatus(Meeting.MeetingStatus.CANCELLED);
            Meeting savedMeeting = meetingRepository.save(meeting);

            RoomSettings settings = roomSettingsService.getSettings();
            Boolean sendEmailNotification = settings.getSendEmailNotification() != null ? settings.getSendEmailNotification() : true;
            
            if (sendEmailNotification) {
                try {
                    emailService.sendBookingCancellation(
                        meeting.getOrganizer().getEmail(),
                        meeting.getOrganizer().getName(),
                        meeting.getTitle(),
                        meeting.getRoom().getName(),
                        meeting.getStartTime(),
                        meeting.getEndTime(),
                        "用户主动取消"
                    );
                } catch (Exception e) {
                    log.warn("Failed to send cancellation email: {}", e.getMessage());
                }
            }

            return savedMeeting;
        }).orElse(null);
    }

    @Transactional
    public void deleteMeeting(Long id) {
        meetingRepository.deleteById(id);
    }
}