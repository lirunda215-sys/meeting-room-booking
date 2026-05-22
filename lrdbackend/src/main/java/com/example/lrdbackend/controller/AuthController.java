package com.example.lrdbackend.controller;

import com.example.lrdbackend.dto.LoginRequest;
import com.example.lrdbackend.dto.RegisterRequest;
import com.example.lrdbackend.entity.User;
import com.example.lrdbackend.service.AuthService;
import com.example.lrdbackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request)
                .map(user -> {
                    String token = jwtUtil.generateToken(
                        user.getId(), 
                        user.getUsername(), 
                        user.getRole().name()
                    );
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("username", user.getUsername());
                    response.put("name", user.getName());
                    response.put("email", user.getEmail());
                    response.put("role", user.getRole());
                    response.put("accessToken", token);
                    response.put("tokenType", "Bearer");
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid credentials")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            String token = jwtUtil.generateToken(
                user.getId(), 
                user.getUsername(), 
                user.getRole().name()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("accessToken", token);
            response.put("tokenType", "Bearer");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return authService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
