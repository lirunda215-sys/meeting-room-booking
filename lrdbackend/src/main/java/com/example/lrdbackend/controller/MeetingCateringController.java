package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.CateringService;
import com.example.lrdbackend.entity.Meeting;
import com.example.lrdbackend.entity.MeetingCatering;
import com.example.lrdbackend.repository.CateringServiceRepository;
import com.example.lrdbackend.repository.MeetingCateringRepository;
import com.example.lrdbackend.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meeting-caterings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MeetingCateringController {

    private final MeetingCateringRepository meetingCateringRepository;
    private final MeetingRepository meetingRepository;
    private final CateringServiceRepository cateringServiceRepository;

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<MeetingCatering>> getCateringsByMeetingId(@PathVariable Long meetingId) {
        return ResponseEntity.ok(meetingCateringRepository.findByMeetingId(meetingId));
    }

    @PostMapping
    public ResponseEntity<?> addCateringToMeeting(@RequestBody Map<String, Object> request) {
        try {
            Long meetingId = Long.valueOf(request.get("meetingId").toString());
            Long cateringId = Long.valueOf(request.get("cateringId").toString());
            Integer quantity = request.get("quantity") != null 
                ? Integer.valueOf(request.get("quantity").toString()) 
                : 1;

            Meeting meeting = meetingRepository.findById(meetingId)
                    .orElseThrow(() -> new RuntimeException("会议不存在"));

            CateringService catering = cateringServiceRepository.findById(cateringId)
                    .orElseThrow(() -> new RuntimeException("茶水服务不存在"));

            MeetingCatering meetingCatering = new MeetingCatering();
            meetingCatering.setMeeting(meeting);
            meetingCatering.setCatering(catering);
            meetingCatering.setQuantity(quantity);
            if (catering.getPrice() != null) {
                meetingCatering.setUnitPrice(catering.getPrice());
                meetingCatering.setTotalPrice(
                    catering.getPrice().multiply(java.math.BigDecimal.valueOf(quantity))
                );
            }

            meetingCateringRepository.save(meetingCatering);
            return ResponseEntity.ok(Map.of("success", true, "id", meetingCatering.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "添加茶水失败：" + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCatering(@PathVariable Long id) {
        meetingCateringRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
