import React, { useState } from 'react'
import { Plus, Check, Trash2, Square, CheckSquare, Clock, Zap, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

const TaskList: React.FC = () => {
    const { tasks, addTask, toggleTask, removeTask, selectedTaskId, setSelectedTask } = useStore()
    const [newTaskTitle, setNewTaskTitle] = useState('')

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault()
        if (newTaskTitle.trim()) {
            addTask(newTaskTitle.trim())
            setNewTaskTitle('')
        }
    }

    // Smart Scheduling Logic
    // Sort logic: Incomplete first, then by "implied importance" (shorter titles or recent)
    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return b.id.localeCompare(a.id) // Recent first
    })

    // Prediction heuristic: 1-2 pomodoros for small tasks, 3+ for longer titles
    const estimateTime = (title: string) => {
        const words = title.split(' ').length
        if (words <= 3) return 1
        if (words <= 6) return 2
        return 3
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%' }}>
            {/* Smart Planning Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 5px',
                marginBottom: '5px'
            }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={12} color="var(--accent-color)" /> PLANNING AUTOMATIQUE
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-color)' }}>
                    {tasks.filter(t => !t.completed).length} RESTANTES
                </div>
            </div>

            {/* Add Task Input */}
            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <input
                        type="text"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Qu'allez-vous accomplir ?"
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            paddingRight: '40px',
                            color: 'white',
                            fontSize: '13px',
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    />
                    <Zap size={14} style={{ position: 'absolute', right: '15px', top: '14px', opacity: 0.3, color: 'var(--accent-color)' }} />
                </div>
                <button
                    type="submit"
                    style={{
                        background: 'var(--accent-color)',
                        border: 'none',
                        borderRadius: '12px',
                        width: '42px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        cursor: 'pointer',
                        boxShadow: '0 5px 15px var(--accent-glow)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <Plus size={20} />
                </button>
            </form>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                {sortedTasks.map((task) => {
                    const est = task.pomodoros || estimateTime(task.title)
                    return (
                        <div
                            key={task.id}
                            className={`task-item glass ${selectedTaskId === task.id ? 'active-focus' : ''}`}
                            onClick={() => !task.completed && setSelectedTask(selectedTaskId === task.id ? null : task.id)}
                            style={{
                                padding: '12px 15px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                borderRadius: '14px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: task.completed ? 0.4 : 1,
                                border: selectedTaskId === task.id ? '2px solid var(--accent-color)' : (task.completed ? '1px solid transparent' : '1px solid var(--glass-border)'),
                                transform: selectedTaskId === task.id ? 'scale(1.02)' : 'scale(1)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: task.completed ? 'default' : 'pointer',
                                boxShadow: selectedTaskId === task.id ? '0 8px 20px var(--accent-glow)' : 'none'
                            }}
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); toggleTask(task.id); if (selectedTaskId === task.id) setSelectedTask(null); }}
                                style={{ background: 'none', border: 'none', color: task.completed ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer', padding: 0, zIndex: 2 }}
                            >
                                {task.completed ? <CheckSquare size={18} fill="rgba(99, 102, 241, 0.2)" /> : <Square size={18} />}
                            </button>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    textDecoration: task.completed ? 'line-through' : 'none',
                                    color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                                }}>
                                    {task.title}
                                </span>
                                {!task.completed && (
                                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} /> ESTIMATION: {est * 25} MIN ({est} POMO)
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={() => removeTask(task.id)}
                                style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.2)', cursor: 'pointer', padding: '4px', zIndex: 2, transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 1)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.2)'}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )
                })}

                {tasks.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <div style={{ marginBottom: '15px', opacity: 0.5 }}><Sparkles size={32} style={{ margin: '0 auto' }} /></div>
                        Votre liste est vide.<br />Planifiez votre réussite maintenant.
                    </div>
                )}
            </div>
        </div>
    )
}

export default TaskList
