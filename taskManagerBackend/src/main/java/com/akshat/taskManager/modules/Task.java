package com.akshat.taskManager.modules;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Integer id;

    private String tName;
    private String tDescription;


    @Column(updatable=false, nullable =  false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm a")
    private LocalDateTime createdAt;

    @Column(insertable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm a")
    private LocalDateTime updatedAt;

    @Column(insertable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm a")
    private LocalDateTime completedAt;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy hh:mm a")
    private LocalDateTime dueAt;

    @Column(nullable = false)
    private boolean completeStatus;
    
    
}
