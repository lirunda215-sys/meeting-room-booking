package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.RoomSettings;
import com.example.lrdbackend.service.RoomSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RoomSettingsController {

    private final RoomSettingsService roomSettingsService;

    @GetMapping
    public ResponseEntity<RoomSettings> getSettings() {
        return ResponseEntity.ok(roomSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<RoomSettings> updateSettings(@RequestBody RoomSettings settings) {
        return ResponseEntity.ok(roomSettingsService.updateSettings(settings));
    }
}