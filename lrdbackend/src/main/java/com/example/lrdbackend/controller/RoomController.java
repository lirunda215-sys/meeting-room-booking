package com.example.lrdbackend.controller;

import com.example.lrdbackend.entity.Room;
import com.example.lrdbackend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Room>> getActiveRooms() {
        return ResponseEntity.ok(roomService.getActiveRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoom(@PathVariable Long id) {
        return roomService.getRoomById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        return ResponseEntity.ok(roomService.createRoom(room));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @RequestBody Room room) {
        Room updated = roomService.updateRoom(id, room);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }
}