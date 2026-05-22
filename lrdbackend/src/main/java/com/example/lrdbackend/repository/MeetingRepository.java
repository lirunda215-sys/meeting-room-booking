package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.Meeting;
import com.example.lrdbackend.entity.Room;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    List<Meeting> findByRoomIdOrderByStartTimeAsc(Long roomId);

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    List<Meeting> findByOrganizerIdOrderByStartTimeAsc(Long organizerId);

    List<Meeting> findByOrganizerId(Long organizerId);

    @Query("SELECT m FROM Meeting m WHERE m.room = :room " +
           "AND m.status = 'SCHEDULED' " +
           "AND ((m.startTime < :endTime AND m.endTime > :startTime))")
    List<Meeting> findConflictingMeetings(
            @Param("room") Room room,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    @Query("SELECT m FROM Meeting m WHERE m.room.id = :roomId " +
           "AND m.status = 'SCHEDULED' " +
           "AND m.startTime >= :startDate AND m.startTime <= :endDate " +
           "ORDER BY m.startTime ASC")
    List<Meeting> findByRoomIdAndDateRange(
            @Param("roomId") Long roomId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    @Query("SELECT m FROM Meeting m WHERE m.status = 'SCHEDULED' " +
           "AND m.startTime >= :startDate AND m.startTime <= :endDate " +
           "ORDER BY m.startTime ASC")
    List<Meeting> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    @Override
    List<Meeting> findAll();

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    @Override
    Optional<Meeting> findById(Long id);
    
    // 简化版：先不加载过多关联，Service 层手动加载
    @EntityGraph(attributePaths = {"room", "organizer"})
    Optional<Meeting> findWithDetailsById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"room", "organizer", "attendees.user"})
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.attendees a WHERE m.organizer.id = :userId OR a.user.id = :userId ORDER BY m.startTime ASC")
    List<Meeting> findAllByUserId(@Param("userId") Long userId);
}
