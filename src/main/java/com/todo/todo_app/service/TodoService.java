package com.todo.todo_app.service;

import com.todo.todo_app.model.Todo;
import com.todo.todo_app.repository.TodoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; // Prrevents Null pointer Errors

/**
 * TodoService.java — THE BUSINESS LOGIC LAYER
 *
 * Controller → Service → Repository → Database
 *
 * Controller handles HTTP, Service handles logic,
 * Repository handles database.
 */
@Service  // Marks this as a Spring-managed service component
public class TodoService {

    // for Dependency Injection)
    @Autowired
    private TodoRepository todoRepository;

    /**
     * Get ALL todos from the database
     */
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    /**
     * Get a single todo by its ID
     * Returns Optional<Todo> because the todo might not exist
     */
    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }

    /**
     * Create a brand new todo and save it to the database
     */
    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);  // .save() inserts if new, updates if exists
    }

    /**
     * Update an existing todo (e.g., mark as complete, edit title)
     */
    public Optional<Todo> updateTodo(Long id, Todo updatedTodo) {
        // First, check if the todo exists
        return todoRepository.findById(id).map(existingTodo -> {
            // Update the fields with new values
            existingTodo.setTitle(updatedTodo.getTitle());
            existingTodo.setCompleted(updatedTodo.isCompleted());
            existingTodo.setPriority(updatedTodo.getPriority());
            // Save and return the updated todo
            return todoRepository.save(existingTodo);
        });
    }

    /**
     * Delete a todo by its ID
     * Returns true if deleted, false if not found
     */
    public boolean deleteTodo(Long id) {
        if (todoRepository.existsById(id)) {
            todoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Toggle a todo's completed status (true → false, false → true)
     */
    public Optional<Todo> toggleComplete(Long id) {
        return todoRepository.findById(id).map(todo -> {
            todo.setCompleted(!todo.isCompleted());  // Flip the boolean
            return todoRepository.save(todo);
        });
    }
}