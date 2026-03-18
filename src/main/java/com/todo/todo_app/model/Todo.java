package com.todo.todo_app.model;

// Import JPA annotations to map this class to a database table
import jakarta.persistence.*;

/**
 * Todo.java — The DATA MODEL
 * This class represents a single to-do item.
 * @Entity tells Spring to create a database table for this class.
 */
@Entity                          // Maps this class to a database table
@Table(name = "todos")           // table will be named "todos"
public class Todo {

    // ── Fields become columns in the database ───

    @Id                                    // This is the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false)              // Title cannot be empty
    private String title;

    @Column(nullable = false)
    private boolean completed = false;     // Default: task is not done

    @Column
    private String priority;              // "LOW", "MEDIUM", "HIGH"


    // No-argument constructor (required by JPA)
    public Todo() {}

    // Constructor to create a Todo with title and priority
    public Todo(String title, String priority) {
        this.title = title;
        this.priority = priority;
        this.completed = false;
    }

    // ── Getters and Setters ───

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
}