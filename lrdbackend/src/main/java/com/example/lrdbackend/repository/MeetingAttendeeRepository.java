package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.MeetingAttendee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingAttendeeRepository extends JpaRepository<MeetingAttendee, Long> {
    // 使用 @Query 和 JOIN FETCH 明确加载 user，避免懒加载问题
    @Query("SELECT ma FROM MeetingAttendee ma JOIN FETCH ma.user WHERE ma.meeting.id = :meetingId")
    List<MeetingAttendee> findByMeetingId(@Param("meetingId") Long meetingId);
    
    List<MeetingAttendee> findByUserId(Long userId);
}
