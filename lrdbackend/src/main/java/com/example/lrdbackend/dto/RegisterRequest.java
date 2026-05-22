package com.example.lrdbackend.dto;

import com.example.lrdbackend.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private User.UserRole role;
}
