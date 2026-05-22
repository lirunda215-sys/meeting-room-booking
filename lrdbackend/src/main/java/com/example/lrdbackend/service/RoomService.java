package com.example.lrdbackend.service;

import com.example.lrdbackend.entity.Room;
import com.example.lrdbackend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getActiveRooms() {
        return roomRepository.findByIsActiveTrue();
    }

    public Optional<Room> getRoomById(Long id) {
        return roomRepository.findById(id);
    }

    public Room createRoom(Room room) {
        return roomRepository.save(room);
    }

    public Room updateRoom(Long id, Room roomDetails) {
        return roomRepository.findById(id).map(room -> {
            room.setName(roomDetails.getName());
            room.setLocation(roomDetails.getLocation());
            room.setCapacity(roomDetails.getCapacity());
            room.setEquipment(roomDetails.getEquipment());
            room.setIsActive(roomDetails.getIsActive());
            return roomRepository.save(room);
        }).orElse(null);
    }

    public void deleteRoom(Long id) {
        roomRepository.deleteById(id);
    }
}