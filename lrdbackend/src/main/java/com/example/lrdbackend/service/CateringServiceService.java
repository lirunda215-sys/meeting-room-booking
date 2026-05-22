package com.example.lrdbackend.service;

import com.example.lrdbackend.entity.CateringService;
import com.example.lrdbackend.repository.CateringServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CateringServiceService {

    private final CateringServiceRepository cateringServiceRepository;

    public List<CateringService> getAllCateringServices() {
        return cateringServiceRepository.findAll();
    }

    public List<CateringService> getActiveCateringServices() {
        return cateringServiceRepository.findByIsActiveTrue();
    }

    public Optional<CateringService> getCateringServiceById(Long id) {
        return cateringServiceRepository.findById(id);
    }

    public CateringService createCateringService(CateringService cateringService) {
        return cateringServiceRepository.save(cateringService);
    }

    public CateringService updateCateringService(Long id, CateringService cateringDetails) {
        return cateringServiceRepository.findById(id).map(catering -> {
            if (cateringDetails.getName() != null) {
                catering.setName(cateringDetails.getName());
            }
            if (cateringDetails.getDescription() != null) {
                catering.setDescription(cateringDetails.getDescription());
            }
            if (cateringDetails.getIsActive() != null) {
                catering.setIsActive(cateringDetails.getIsActive());
            }
            if (cateringDetails.getImageUrl() != null) {
                catering.setImageUrl(cateringDetails.getImageUrl());
            }
            return cateringServiceRepository.save(catering);
        }).orElse(null);
    }

    public void deleteCateringService(Long id) {
        cateringServiceRepository.deleteById(id);
    }
}
