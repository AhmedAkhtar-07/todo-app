package com.todo.todo_app.controller;

import com.todo.todo_app.model.Todo;
import com.todo.todo_app.service.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * TodoController.java — THE API LAYER (HTTP Request Handler)
 *
 * This class defines REST API endpoints.
 * The frontend (HTML/JS) will call these URLs to get and save data.
 *
 * @RestController = handles web requests and returns JSON
 * @RequestMapping = all routes start with /api/todos
 * @CrossOrigin    = allows requests from any origin (needed for frontend)
 */
@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "*")  // Allow frontend to talk to this backend
public class TodoController {

    @Autowired
    private TodoService todoService;  

    // ── GET /api/todos ──
    // Returns ALL todos as a JSON array
    @GetMapping
    public List<Todo> getAllTodos() {
        return todoService.getAllTodos();
    }

    // ── GET /api/todos/{id} ──
    // Returns ONE todo by its ID like GET /api/todos/1
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getTodoById(@PathVariable Long id) {
        return todoService.getTodoById(id)
                .map(ResponseEntity::ok)                          // Found → 200 OK
                .orElse(ResponseEntity.notFound().build());       // Not found → 404
    }

    // ── POST /api/todos ──
    // Creates a NEW todo
    // The frontend sends a JSON body, Spring converts it to a Todo object
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody Todo todo) {
        Todo created = todoService.createTodo(todo);
        return ResponseEntity.ok(created);  // Return the saved todo (with its new ID)
    }

    // ── PUT /api/todos/{id} ──
    // Updates an EXISTING todo (e.g., edit the title or priority will be send in json body)
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        return todoService.updateTodo(id, todo)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PATCH /api/todos/{id}/toggle ───
    // Toggles the completed status of a todo
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Todo> toggleComplete(@PathVariable Long id) {
        return todoService.toggleComplete(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE /api/todos/{id} ───
    // Deletes a todo by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        if (todoService.deleteTodo(id)) {
            return ResponseEntity.ok().build();     
        }
        return ResponseEntity.notFound().build();  
    }
}