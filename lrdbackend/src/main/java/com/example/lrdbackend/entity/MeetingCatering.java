package com.example.lrdbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "meeting_caterings")
public class MeetingCatering {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catering_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CateringService catering;

    @Column(name = "quantity")
    private Integer quantity = 1;

    @Column(name = "unit_price")
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_price")
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
