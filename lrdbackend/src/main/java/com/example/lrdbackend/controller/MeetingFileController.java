package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.Meeting;
import com.example.lrdbackend.entity.MeetingFile;
import com.example.lrdbackend.repository.MeetingFileRepository;
import com.example.lrdbackend.repository.MeetingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/meeting-files")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MeetingFileController {

    private final MeetingFileRepository meetingFileRepository;
    private final MeetingRepository meetingRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<List<MeetingFile>> getFilesByMeetingId(@PathVariable Long meetingId) {
        return ResponseEntity.ok(meetingFileRepository.findByMeetingId(meetingId));
    }

    @PostMapping("/upload/{meetingId}")
    public ResponseEntity<?> uploadFile(
            @PathVariable Long meetingId,
            @RequestParam("file") MultipartFile file) {
        try {
            Meeting meeting = meetingRepository.findById(meetingId)
                    .orElseThrow(() -> new RuntimeException("会议不存在"));

            // 创建上传目录
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = UUID.randomUUID().toString() + fileExtension;
            String filePath = uploadPath.resolve(newFilename).toString();

            // 保存文件
            file.transferTo(new File(filePath));

            // 创建文件记录
            MeetingFile meetingFile = new MeetingFile();
            meetingFile.setMeeting(meeting);
            meetingFile.setFileName(originalFilename);
            meetingFile.setFileType(file.getContentType());
            meetingFile.setFileSize(file.getSize());
            meetingFile.setFilePath(filePath);
            meetingFile.setFileUrl("/api/meeting-files/download/" + newFilename);

            MeetingFile savedFile = meetingFileRepository.save(meetingFile);

            return ResponseEntity.ok(Map.of(
                "success", true, 
                "id", savedFile.getId(),
                "fileName", savedFile.getFileName(),
                "fileUrl", savedFile.getFileUrl()
            ));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "文件上传失败：" + e.getMessage()));
        }
    }

    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        meetingFileRepository.deleteById(fileId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 获取文件的实际名称（从数据库或从文件名推断）
            MeetingFile meetingFile = meetingFileRepository.findByFileNameContaining(filename).stream()
                    .findFirst()
                    .orElse(null);
            String originalFileName = meetingFile != null ? meetingFile.getFileName() : filename;

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            meetingFile != null && meetingFile.getFileType() != null 
                                ? meetingFile.getFileType() 
                                : "application/octet-stream"))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + new String(originalFileName.getBytes("UTF-8"), "ISO-8859-1") + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
