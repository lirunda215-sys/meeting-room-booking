package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.MeetingCatering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingCateringRepository extends JpaRepository<MeetingCatering, Long> {
    // 使用 @Query 和 JOIN FETCH 明确加载 catering，避免懒加载问题
    @Query("SELECT mc FROM MeetingCatering mc JOIN FETCH mc.catering WHERE mc.meeting.id = :meetingId")
    List<MeetingCatering> findByMeetingId(@Param("meetingId") Long meetingId);
}
