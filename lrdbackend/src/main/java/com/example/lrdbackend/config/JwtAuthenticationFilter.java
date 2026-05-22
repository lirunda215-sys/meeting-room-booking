package com.example.lrdbackend.config;

import com.example.lrdbackend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)  // 在 CORS 之后执行
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        
        // 跳过 OPTIONS 请求（预检请求）
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            log.debug("Skipping OPTIONS request");
            filterChain.doFilter(request, response);
            return;
        }
        
        // 登录和注册不需要 token
        String path = request.getRequestURI();
        log.debug("Processing request: {} {}", request.getMethod(), path);
        
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            log.debug("Skipping auth path");
            filterChain.doFilter(request, response);
            return;
        }
        
        String authHeader = request.getHeader("Authorization");
        log.debug("Authorization header: {}", authHeader != null ? "exists" : "missing");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            log.debug("Token extracted, validating...");

            if (jwtUtil.validateToken(token)) {
                Claims claims = jwtUtil.parseToken(token);
                Long userId = Long.valueOf(claims.get("userId").toString());
                String role = claims.get("role").toString();
                String username = claims.getSubject();

                log.debug("Token valid - userId: {}, username: {}, role: {}", userId, username, role);
                
                request.setAttribute("userId", userId);
                request.setAttribute("userRole", role);
                request.setAttribute("username", username);
            } else {
                log.warn("Token validation failed");
            }
        } else {
            log.warn("No valid Authorization header found");
        }

        filterChain.doFilter(request, response);
    }
}