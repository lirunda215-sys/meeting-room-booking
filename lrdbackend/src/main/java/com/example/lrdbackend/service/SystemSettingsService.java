package com.example.lrdbackend.service;

import com.example.lrdbackend.entity.SystemSettings;
import com.example.lrdbackend.repository.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingsService {

    private final SystemSettingsRepository systemSettingsRepository;

    @Transactional(readOnly = true)
    public List<SystemSettings> getAllSettings() {
        return systemSettingsRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<SystemSettings> getSettingByKey(String key) {
        return systemSettingsRepository.findByKey(key);
    }

    @Transactional(readOnly = true)
    public String getSettingValue(String key, String defaultValue) {
        return getSettingByKey(key).map(SystemSettings::getValue).orElse(defaultValue);
    }

    @Transactional
    public SystemSettings updateSetting(String key, String value, String description) {
        SystemSettings setting = systemSettingsRepository.findByKey(key).orElseGet(() -> {
            SystemSettings newSetting = new SystemSettings();
            newSetting.setKey(key);
            if (description != null) {
                newSetting.setDescription(description);
            }
            return newSetting;
        });
        setting.setValue(value);
        if (description != null && setting.getDescription() == null) {
            setting.setDescription(description);
        }
        return systemSettingsRepository.save(setting);
    }

    @Transactional(readOnly = true)
    public String getMinBookingTime() {
        return getSettingValue("minBookingTime", "08:00");
    }

    @Transactional(readOnly = true)
    public String getMaxBookingTime() {
        return getSettingValue("maxBookingTime", "22:00");
    }
}
