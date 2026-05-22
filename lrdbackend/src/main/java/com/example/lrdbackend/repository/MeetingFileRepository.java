package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.MeetingFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingFileRepository extends JpaRepository<MeetingFile, Long> {
    List<MeetingFile> findByMeetingId(Long meetingId);
    List<MeetingFile> findByFileNameContaining(String fileName);
}
