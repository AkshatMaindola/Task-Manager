package com.akshat.taskManager.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.akshat.taskManager.service.TaskService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.akshat.taskManager.modules.*;

import java.util.List;

@CrossOrigin
@RestController
public class TaskController {


    @Autowired
    TaskService service;

   @GetMapping("/")
   public ResponseEntity<List<Task>> getAllTask(){
    return new ResponseEntity<>(service.getAllTask(),HttpStatus.OK);
   }

   @GetMapping("/{id}")
   public ResponseEntity<Task> getTaskById(@PathVariable int id){
        return service.getTaskById(id);
   }

   @PostMapping("/")
   public ResponseEntity<Task> addTask(@RequestBody Task task){
    return new ResponseEntity<>(service.addTask(task), HttpStatus.OK);
   }

   @DeleteMapping("/")
   public ResponseEntity<String> deleteAllTask(){
    service.deleteAllTask();
    return new ResponseEntity<>(HttpStatus.OK);
   }

   @DeleteMapping("/{id}")
   public ResponseEntity<String> deleteTask(@PathVariable int id){
    service.deleteTaskById(id);
    return new ResponseEntity<>("Deleted Success",HttpStatus.OK);
   }

   @PutMapping("/{id}")
   public ResponseEntity<Task> updateTask(@PathVariable int id,@RequestBody Task task){
     
     return new ResponseEntity<>(service.updateTask(id,task),HttpStatus.OK);
   }

   @PutMapping("/{id}/status")
   public ResponseEntity<Task> updateTaskStatus(@PathVariable int id){
     Task task = service.updateTaskStatus(id);
     if(task != null)
          return new ResponseEntity<>(task,HttpStatus.OK);
     else
          return new ResponseEntity<>(HttpStatus.NOT_FOUND);
   }



}
