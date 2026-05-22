package com.example.lrdbackend.service;

import com.example.lrdbackend.entity.RoomSettings;
import com.example.lrdbackend.repository.RoomSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomSettingsService {

    private final RoomSettingsRepository roomSettingsRepository;

    public RoomSettings getSettings() {
        return roomSettingsRepository.findAll().stream().findFirst()
                .map(settings -> {
                    // 确保所有字段都有默认值，防止空指针
                    if (settings.getMaxDurationMinutes() == null) {
                        settings.setMaxDurationMinutes(240);
                    }
                    if (settings.getMinDurationMinutes() == null) {
                        settings.setMinDurationMinutes(30);
                    }
                    if (settings.getMaxBookingDaysAhead() == null) {
                        settings.setMaxBookingDaysAhead(7);
                    }
                    if (settings.getMinBookingAdvanceMinutes() == null) {
                        settings.setMinBookingAdvanceMinutes(30);
                    }
                    if (settings.getSendEmailNotification() == null) {
                        settings.setSendEmailNotification(false); // 默认不发送邮件
                    }
                    return roomSettingsRepository.save(settings);
                })
                .orElseGet(() -> {
                    RoomSettings settings = new RoomSettings();
                    settings.setSendEmailNotification(false); // 默认不发送邮件
                    return roomSettingsRepository.save(settings);
                });
    }

    public RoomSettings updateSettings(RoomSettings settings) {
        RoomSettings existing = getSettings();
        existing.setMaxDurationMinutes(settings.getMaxDurationMinutes());
        existing.setMinDurationMinutes(settings.getMinDurationMinutes());
        existing.setMaxBookingDaysAhead(settings.getMaxBookingDaysAhead());
        existing.setMinBookingAdvanceMinutes(settings.getMinBookingAdvanceMinutes());
        existing.setSendEmailNotification(settings.getSendEmailNotification());
        return roomSettingsRepository.save(existing);
    }
}