package com.akshat.taskManager.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

import java.util.List;

import com.akshat.taskManager.repo.TaskRepo;
import com.akshat.taskManager.modules.*;

@Service
public class TaskService {
    @Autowired
    TaskRepo repo;


    public List<Task> getAllTask(){
        return repo.findAll();
    }

    public ResponseEntity<Task> getTaskById(int id){
        Task task = repo.findById(id).orElse(null);
        if(task != null)
            return new ResponseEntity<>(task,HttpStatus.FOUND);
        else
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    public Task addTask(Task task){
        task.setCreatedAt(LocalDateTime.now());
        return repo.save(task);
    }
    
    public void deleteTaskById(int id){
        repo.deleteById(id);
    }

    public void deleteAllTask(){
        repo.deleteAll();
    }

    public Task updateTask(int id,Task task){
        Task task2 = repo.findById(id).orElse(null);
        if(task2 != null){
            task.setId(id);
            task.setUpdatedAt(LocalDateTime.now());
            return repo.save(task);
        }
        else return null;
        
    }

    public Task updateTaskStatus(int id){
        Task task = repo.findById(id).orElse(null);
        task.setCompleteStatus(true);
        task.setCompletedAt(LocalDateTime.now());
        repo.save(task);
        return task;
    }
   
}
