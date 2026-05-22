package com.example.lrdbackend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@company.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public void sendBookingConfirmation(String toEmail, String attendeeName,
                                         String meetingTitle, String roomName,
                                         String location, java.time.LocalDateTime startTime,
                                         java.time.LocalDateTime endTime) {
        String subject = String.format("[会议室预订] 会议预订确认: %s", meetingTitle);
        Map<String, Object> params = new HashMap<>();
        params.put("name", attendeeName);
        params.put("title", meetingTitle);
        params.put("room", roomName);
        params.put("location", location);
        params.put("startTime", startTime.format(DATE_TIME_FORMATTER));
        params.put("endTime", endTime.format(DATE_TIME_FORMATTER));
        
        String htmlContent = buildConfirmationEmail(params);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    public void sendBookingCancellation(String toEmail, String attendeeName,
                                        String meetingTitle, String roomName,
                                        java.time.LocalDateTime startTime,
                                        java.time.LocalDateTime endTime,
                                        String reason) {
        String subject = String.format("[会议室预订] 会议已取消: %s", meetingTitle);
        Map<String, Object> params = new HashMap<>();
        params.put("name", attendeeName);
        params.put("title", meetingTitle);
        params.put("room", roomName);
        params.put("startTime", startTime.format(DATE_TIME_FORMATTER));
        params.put("endTime", endTime.format(DATE_TIME_FORMATTER));
        params.put("reason", reason != null ? reason : "用户主动取消");
        
        String htmlContent = buildCancellationEmail(params);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("邮件发送成功: to={}, subject={}", to, subject);
        } catch (MessagingException e) {
            log.error("邮件发送失败: to={}, error={}", to, e.getMessage());
        }
    }

    private String buildConfirmationEmail(Map<String, Object> params) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4A90E2; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .info-table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
                    .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .info-table td:first-child { font-weight: bold; width: 30%%; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>会议预订确认</h1>
                    </div>
                    <div class="content">
                        <p>尊敬的 %s，</p>
                        <p>您的会议已成功预订！以下是会议详情：</p>
                        <table class="info-table">
                            <tr><td>会议主题</td><td>%s</td></tr>
                            <tr><td>会议室</td><td>%s</td></tr>
                            <tr><td>位置</td><td>%s</td></tr>
                            <tr><td>开始时间</td><td>%s</td></tr>
                            <tr><td>结束时间</td><td>%s</td></tr>
                        </table>
                    </div>
                    <div class="footer">
                        <p>此邮件由系统自动发送，请勿回复。</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            params.get("name"), params.get("title"), params.get("room"), 
            params.get("location"), params.get("startTime"), params.get("endTime")
        );
    }

    private String buildCancellationEmail(Map<String, Object> params) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #E74C3C; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .info-table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
                    .info-table td { padding: 10px; border-bottom: 1px solid #ddd; }
                    .info-table td:first-child { font-weight: bold; width: 30%%; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>会议已取消</h1>
                    </div>
                    <div class="content">
                        <p>尊敬的 %s，</p>
                        <p>以下会议已被取消：</p>
                        <table class="info-table">
                            <tr><td>会议主题</td><td>%s</td></tr>
                            <tr><td>会议室</td><td>%s</td></tr>
                            <tr><td>原定时间</td><td>%s - %s</td></tr>
                            <tr><td>取消原因</td><td>%s</td></tr>
                        </table>
                    </div>
                    <div class="footer">
                        <p>此邮件由系统自动发送，请勿回复。</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            params.get("name"), params.get("title"), params.get("room"), 
            params.get("startTime"), params.get("endTime"), params.get("reason")
        );
    }
}