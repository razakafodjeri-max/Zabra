import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Zap, Coffee, CameraOff } from 'lucide-react'
import { useStore } from '../store/useStore'

const Timer: React.FC = () => {
    const {
        currentFocusState,
        settings,
        currentProfileId,
        lastInteraction
    } = useStore()

    // Configuration
    const MIN_DURATION = 5 * 60
    const MAX_DURATION = 50 * 60
    const BASE_DURATION = (settings?.pomodoro_duration || 25) * 60

    const [timeLeft, setTimeLeft] = useState(BASE_DURATION)
    const [isActive, setIsActive] = useState(false)
    const [isBreak, setIsBreak] = useState(false)
    const [adaptiveSessionDuration, setAdaptiveSessionDuration] = useState(BASE_DURATION)

    // Analytics for current session
    const [sessionFocusScores, setSessionFocusScores] = useState<number[]>([])
    const distractionTimer = useRef(0)
    const focusTimer = useRef(0)

    // Interaction fallback (No-Camera Mode)
    const getRealTimeState = () => {
        if (settings?.ai_enabled && currentFocusState !== 'absent') {
            return currentFocusState
        }
        // Fallback: If AI is disabled or absent, check last interaction
        const now = Date.now()
        const idleTime = (now - lastInteraction) / 1000
        if (idleTime < 30) return 'focus' // Active in last 30s
        if (idleTime < 120) return 'distract' // Inactive for 2 mins
        return 'absent' // Absent more than 2 mins
    }

    const currentState = getRealTimeState()

    // Initialization of timeLeft when adaptive duration changes (only if stopped)
    useEffect(() => {
        if (!isActive && !isBreak && timeLeft === BASE_DURATION) {
            setTimeLeft(adaptiveSessionDuration)
        }
    }, [adaptiveSessionDuration])

    useEffect(() => {
        let interval: NodeJS.Timeout

        // Actionable logic: Auto-pause only if truly absent
        if (isActive && currentState === 'absent' && !isBreak) {
            setIsActive(false)
            new Notification('STUDYFLOW', { body: 'Utilisateur absent. Session mise en pause.' })
        }

        // Timer Speed Adaptation (only for work sessions)
        let speed = 1000
        if (isActive && !isBreak && currentState === 'distract') {
            speed = 1500 // Timer runs 50% slower when distracted
            distractionTimer.current += 1.5
        } else if (isActive && !isBreak && currentState === 'focus') {
            focusTimer.current += 1
        }

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)

                if (!isBreak) {
                    const score = currentState === 'focus' ? 100 : (currentState === 'distract' ? 40 : 0)
                    setSessionFocusScores(prev => [...prev.slice(-59), score]) // Keep last 60 entries
                }
            }, speed)
        } else if (timeLeft === 0 && isActive) {
            handleSessionEnd()
        }

        return () => clearInterval(interval)
    }, [isActive, timeLeft, currentState, isBreak])

    const handleSessionEnd = () => {
        setIsActive(false)

        if (!isBreak) {
            // Work session just ended
            const avgScore = sessionFocusScores.length > 0
                ? Math.round(sessionFocusScores.reduce((a, b) => a + b, 0) / sessionFocusScores.length)
                : 100

            // 1. Calculate next session duration (Adaptive)
            let nextDuration = adaptiveSessionDuration
            if (avgScore > 85) nextDuration = Math.min(MAX_DURATION, adaptiveSessionDuration + 5 * 60)
            if (avgScore < 60) nextDuration = Math.max(MIN_DURATION, adaptiveSessionDuration - 5 * 60)

            // 2. Calculate break duration (Fatigue-based)
            // Normal break is 5 min, + 1 min for every 10 mins of total distraction
            const baseBreak = 5 * 60
            const fatigueBonus = Math.floor(distractionTimer.current / 60) * 60
            const breakDuration = baseBreak + fatigueBonus

            setAdaptiveSessionDuration(nextDuration)
            setTimeLeft(breakDuration)
            setIsBreak(true)

            new Notification('STUDYFLOW', {
                body: `Travail terminé! Score: ${avgScore}%. Pause suggérée: ${Math.round(breakDuration / 60)} min.`
            })

            // Save to DB via Store
            const { addSession, selectedTaskId, incrementTaskPomodoro } = useStore.getState()
            addSession({
                profile_id: currentProfileId,
                start_time: new Date().toISOString(),
                duration: Math.round((focusTimer.current + distractionTimer.current) / 60),
                focus_score: avgScore,
                type: 'work'
            })

            // Auto-increment task progress if selected
            if (selectedTaskId) {
                incrementTaskPomodoro(selectedTaskId)
            }

            // Reset timers
            focusTimer.current = 0
            distractionTimer.current = 0
            setSessionFocusScores([])
        } else {
            // Break just ended
            setIsBreak(false)
            setTimeLeft(adaptiveSessionDuration)
            new Notification('STUDYFLOW', { body: 'Pause terminée! Prêt pour une nouvelle session?' })
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const totalDuration = isBreak ? 5 * 60 : adaptiveSessionDuration
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

            {/* Session Type Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
                padding: '8px 20px',
                borderRadius: '30px',
                background: isBreak ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                color: isBreak ? '#10b981' : '#6366f1',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.1em'
            }}>
                {isBreak ? <Coffee size={16} /> : <Zap size={16} />}
                {isBreak ? 'PAUSE RÉCUPÉRATION' : 'SESSION DE CONCENTRATION'}
            </div>

            <div className="timer-display" style={{
                fontSize: '140px',
                fontWeight: 800,
                letterSpacing: '-6px',
                marginBottom: '10px',
                color: !isBreak && currentState === 'distract' ? 'var(--warning)' : 'var(--text-primary)',
                transition: 'color 0.5s ease',
                textShadow: isActive && !isBreak ? '0 0 30px var(--accent-glow)' : 'none'
            }}>
                {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button
                    className="btn-primary"
                    onClick={() => setIsActive(!isActive)}
                    style={{
                        background: isBreak ? '#10b981' : 'var(--accent-color)',
                        border: 'none',
                        padding: '14px 40px',
                        borderRadius: '20px',
                        color: 'white',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: isActive ? 'none' : (isBreak ? '0 10px 30px rgba(16, 185, 129, 0.3)' : '0 10px 30px var(--accent-glow)'),
                        transition: 'all 0.3s'
                    }}
                >
                    {isActive ? <Pause size={24} /> : <Play size={24} />}
                    {isActive ? 'PAUSE' : (isBreak ? 'START BREAK' : 'DÉMARRER')}
                </button>

                <button
                    onClick={() => {
                        setIsBreak(false)
                        setAdaptiveSessionDuration(BASE_DURATION)
                        setTimeLeft(BASE_DURATION)
                        setIsActive(false)
                        setSessionFocusScores([])
                    }}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--glass-border)',
                        padding: '14px',
                        borderRadius: '20px',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <RotateCcw size={24} />
                </button>
            </div>

            {/* Adaptive Badge */}
            {!isBreak && (
                <div style={{
                    marginTop: '25px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '6px 15px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <Zap size={12} fill="var(--accent-color)" color="var(--accent-color)" />
                    TEMPS ADAPTATIF: {Math.round(adaptiveSessionDuration / 60)} MIN
                </div>
            )}

            {/* Mode Indicator */}
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!settings?.ai_enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>
                        <CameraOff size={14} /> MODE SANS CAMÉRA (ACTIVITÉ CLAVIER)
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>
                        <div className={`status-indicator status-${currentState}`}></div>
                        IA {currentState.toUpperCase()}
                    </div>
                )}
            </div>

            {/* Progression Bar */}
            <div style={{ marginTop: '40px', width: '100%', maxWidth: '300px' }}>
                <div style={{ height: '4px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: isBreak ? '#10b981' : 'var(--accent-color)',
                        boxShadow: isBreak ? '0 0 15px rgba(16, 185, 129, 0.5)' : '0 0 15px var(--accent-glow)',
                        transition: 'width 1s linear'
                    }}></div>
                </div>
            </div>
        </div>
    )
}

export default Timer
