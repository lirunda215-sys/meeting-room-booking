package com.example.lrdbackend.service;

import com.example.lrdbackend.dto.LoginRequest;
import com.example.lrdbackend.dto.RegisterRequest;
import com.example.lrdbackend.entity.User;
import com.example.lrdbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public Optional<User> login(LoginRequest request) {
        System.out.println("登录请求: " + request.getUsername());
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (request.getPassword().equals(user.getPassword())) {
                System.out.println("登录成功: " + user.getUsername());
                return Optional.of(user);
            } else {
                System.out.println("密码错误");
            }
        } else {
            System.out.println("用户不存在");
        }
        return Optional.empty();
    }

    public User register(RegisterRequest request) {
        System.out.println("注册请求: username=" + request.getUsername() + ", role=" + request.getRole());

        if (userRepository.existsByUsername(request.getUsername())) {
            System.out.println("用户名已存在: " + request.getUsername());
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setEmail(request.getUsername() + "@company.com");
        user.setName(request.getUsername());
        user.setRole(request.getRole() != null ? request.getRole() : User.UserRole.EMPLOYEE);

        User savedUser = userRepository.save(user);
        System.out.println("注册成功，保存用户: " + savedUser.getUsername() + ", id=" + savedUser.getId());
        return savedUser;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
}