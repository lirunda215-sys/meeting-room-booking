package com.example.lrdbackend.repository;

import com.example.lrdbackend.entity.CateringService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CateringServiceRepository extends JpaRepository<CateringService, Long> {
    List<CateringService> findByIsActiveTrue();
}
