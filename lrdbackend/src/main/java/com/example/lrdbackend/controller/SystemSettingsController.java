package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.SystemSettings;
import com.example.lrdbackend.service.SystemSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/system-settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<List<SystemSettings>> getAllSettings() {
        return ResponseEntity.ok(systemSettingsService.getAllSettings());
    }

    @GetMapping("/time-limits")
    public ResponseEntity<Map<String, String>> getTimeLimits() {
        Map<String, String> limits = new HashMap<>();
        limits.put("minBookingTime", systemSettingsService.getMinBookingTime());
        limits.put("maxBookingTime", systemSettingsService.getMaxBookingTime());
        return ResponseEntity.ok(limits);
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> updates) {
        try {
            for (Map.Entry<String, String> entry : updates.entrySet()) {
                systemSettingsService.updateSetting(entry.getKey(), entry.getValue(), null);
            }
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "更新设置失败: " + e.getMessage()));
        }
    }

    @PutMapping("/{key}")
    public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String, String> request) {
        try {
            String value = request.get("value");
            String description = request.get("description");
            SystemSettings updated = systemSettingsService.updateSetting(key, value, description);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "更新设置失败: " + e.getMessage()));
        }
    }
}
