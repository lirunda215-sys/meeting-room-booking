package com.example.lrdbackend.service;

import com.example.lrdbackend.entity.Meeting;
import com.example.lrdbackend.entity.MeetingAttendee;
import com.example.lrdbackend.entity.User;
import com.example.lrdbackend.repository.MeetingAttendeeRepository;
import com.example.lrdbackend.repository.MeetingRepository;
import com.example.lrdbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MeetingRepository meetingRepository;
    private final MeetingAttendeeRepository meetingAttendeeRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            if (userDetails.getName() != null) {
                user.setName(userDetails.getName());
            }
            if (userDetails.getEmail() != null) {
                user.setEmail(userDetails.getEmail());
            }
            if (userDetails.getRole() != null) {
                user.setRole(userDetails.getRole());
            }
            return userRepository.save(user);
        }).orElse(null);
    }

    @Transactional
    public void deleteUser(Long id) {
        // 1. 删除该用户作为参会者的所有记录
        List<MeetingAttendee> attendees = meetingAttendeeRepository.findByUserId(id);
        meetingAttendeeRepository.deleteAll(attendees);
        
        // 2. 删除该用户作为组织者的所有会议
        List<Meeting> organizedMeetings = meetingRepository.findByOrganizerId(id);
        for (Meeting meeting : organizedMeetings) {
            // 先删除会议的参会者
            List<MeetingAttendee> meetingAttendees = meetingAttendeeRepository.findByMeetingId(meeting.getId());
            meetingAttendeeRepository.deleteAll(meetingAttendees);
            // 再删除会议
            meetingRepository.delete(meeting);
        }
        
        // 3. 最后删除用户
        userRepository.deleteById(id);
    }
}
