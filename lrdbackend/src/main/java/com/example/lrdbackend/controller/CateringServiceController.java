package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.CateringService;
import com.example.lrdbackend.service.CateringServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catering")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@Slf4j
public class CateringServiceController {

    private final CateringServiceService cateringServiceService;

    @GetMapping
    public ResponseEntity<List<CateringService>> getAllCateringServices() {
        log.info("获取所有茶水服务");
        try {
            return ResponseEntity.ok(cateringServiceService.getAllCateringServices());
        } catch (Exception e) {
            log.error("获取茶水服务失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<CateringService>> getActiveCateringServices() {
        log.info("获取激活的茶水服务");
        try {
            return ResponseEntity.ok(cateringServiceService.getActiveCateringServices());
        } catch (Exception e) {
            log.error("获取激活的茶水服务失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CateringService> getCateringService(@PathVariable Long id) {
        log.info("获取茶水服务, id: {}", id);
        try {
            return cateringServiceService.getCateringServiceById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("获取茶水服务失败, id: {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createCateringService(@RequestBody CateringService cateringService) {
        log.info("创建茶水服务: {}", cateringService);
        try {
            // 验证必填字段
            if (cateringService.getName() == null || cateringService.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "茶水服务名称不能为空"));
            }
            if (cateringService.getName().length() > 100) {
                return ResponseEntity.badRequest().body(Map.of("error", "茶水服务名称不能超过100个字符"));
            }
            
            // 确保价格为0（免费服务）
            if (cateringService.getPrice() == null) {
                cateringService.setPrice(java.math.BigDecimal.ZERO);
            }
            
            CateringService saved = cateringServiceService.createCateringService(cateringService);
            log.info("茶水服务创建成功, id: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("创建茶水服务失败", e);
            return ResponseEntity.badRequest().body(Map.of("error", "创建茶水服务失败：" + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCateringService(@PathVariable Long id, @RequestBody CateringService cateringService) {
        log.info("更新茶水服务, id: {}, data: {}", id, cateringService);
        try {
            // 验证必填字段
            if (cateringService.getName() != null) {
                if (cateringService.getName().trim().isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "茶水服务名称不能为空"));
                }
                if (cateringService.getName().length() > 100) {
                    return ResponseEntity.badRequest().body(Map.of("error", "茶水服务名称不能超过100个字符"));
                }
            }
            
            // 确保价格为0（免费服务）
            if (cateringService.getPrice() == null) {
                cateringService.setPrice(java.math.BigDecimal.ZERO);
            }
            
            CateringService updated = cateringServiceService.updateCateringService(id, cateringService);
            if (updated != null) {
                log.info("茶水服务更新成功, id: {}", id);
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("更新茶水服务失败, id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", "更新茶水服务失败：" + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCateringService(@PathVariable Long id) {
        log.info("删除茶水服务, id: {}", id);
        try {
            cateringServiceService.deleteCateringService(id);
            log.info("茶水服务删除成功, id: {}", id);
            return ResponseEntity.ok(Map.of("message", "删除成功"));
        } catch (Exception e) {
            log.error("删除茶水服务失败, id: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of("error", "删除茶水服务失败：" + e.getMessage()));
        }
    }
}
