package com.example.lrdbackend.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/health")
    public Map<String, String> health() {
        System.out.println("收到健康检查请求");
        return Map.of("status", "ok", "message", "后端服务正常运行");
    }

    @GetMapping("/db")
    public Map<String, String> dbTest() {
        System.out.println("收到数据库测试请求");
        try {
            return Map.of("status", "ok", "message", "数据库连接正常");
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @PostMapping("/echo")
    public Map<String, Object> echo(@RequestBody Map<String, Object> data) {
        System.out.println("收到echo请求: " + data);
        return Map.of("received", data, "status", "ok");
    }
}
