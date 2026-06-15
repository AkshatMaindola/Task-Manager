package com.akshat.taskManager.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.akshat.taskManager.modules.Task;


@Repository
public interface TaskRepo extends JpaRepository<Task , Integer> {

    
} 