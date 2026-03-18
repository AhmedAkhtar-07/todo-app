package com.todo.todo_app.repository;

import com.todo.todo_app.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * TodoRepository.java — THE DATABASE LAYER
 *
 * This interface talks directly to the database.
 * By extending JpaRepository, Spring automatically gives us:
 *   - findAll()       → get all todos like select *
 *   - findById(id)    → get one todo by ID
 *   - save(todo)      → insert or update a todo
 *   - deleteById(id)  → delete a todo
 * lesss go I dont have to write SQL queries
 */
@Repository  // Marks this as a Spring-managed database component
public interface TodoRepository extends JpaRepository<Todo, Long> {
    // JpaRepository<Todo, Long> means:
    //   Todo → the model this repo manages
    //   Long → the data type of the primary key (id)
    
    // Spring Data JPA gives us all basic CRUD for free!
}