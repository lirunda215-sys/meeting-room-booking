package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.RoomSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomSettingsRepository extends JpaRepository<RoomSettings, Long> {
}