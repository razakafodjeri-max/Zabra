import React, { useEffect, useState } from 'react'
import { TrendingUp, Clock, Target, Calendar, Lightbulb, BarChart3 } from 'lucide-react'
import { useStore } from '../store/useStore'

const Dashboard: React.FC = () => {
    const { sessions } = useStore()

    const totalFocusTime = sessions.reduce((acc, s) => acc + s.duration, 0)
    const avgScore = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + s.focus_score, 0) / sessions.length)
        : 0

    // Weekly data calculation (last 7 days)
    const getWeeklyData = () => {
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
        const now = new Date()
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(now.getDate() - (6 - i))
            return {
                day: days[d.getDay()],
                date: d.toISOString().split('T')[0],
                duration: 0
            }
        })

        sessions.forEach(s => {
            if (!s.start_time) return
            try {
                const sDate = new Date(s.start_time).toISOString().split('T')[0]
                const dayEntry = last7Days.find(d => d.date === sDate)
                if (dayEntry) dayEntry.duration += (s.duration || 0)
            } catch (e) {
                console.warn('Invalid session date:', s.start_time)
            }
        })

        const maxDuration = Math.max(...last7Days.map(d => d.duration), 60)
        return last7Days.map(d => ({ ...d, height: (d.duration / maxDuration) * 100 }))
    }

    const weeklyData = getWeeklyData()

    // AI Recommendations Logic
    const getRecommendations = () => {
        if (sessions.length < 3) return ["Continuez comme ça ! Plus de données permettront une analyse plus fine."]

        const recs = []
        if (avgScore < 70) recs.push("Priorité : Environnement. Votre score de focus est bas, essayez de réduire les distractions visuelles.")
        if (totalFocusTime > 120) recs.push("Bravo pour l'endurance ! Pensez à des pauses de 10 min pour éviter la fatigue cognitive.")

        // Analyze morning vs afternoon
        const morningSessions = sessions.filter(s => new Date(s.start_time).getHours() < 13)
        const afternoonSessions = sessions.filter(s => new Date(s.start_time).getHours() >= 13)

        if (morningSessions.length > afternoonSessions.length && sessions.length > 5) {
            recs.push("Insight : Vous êtes plus productif le matin. Planifiez vos tâches complexes avant midi.")
        }

        return recs.length > 0 ? recs.slice(0, 2) : ["Bon rythme de travail détecté."]
    }

    const recommendations = getRecommendations()

    return (
        <div style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '10px 0' }}>Tableau de Bord</h2>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> TOTAL FOCUS
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>{totalFocusTime} <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>min</span></div>
                </div>
                <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <TrendingUp size={12} /> FOCUS MOYEN
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-color)' }}>{avgScore}%</div>
                </div>
                <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Target size={12} /> SESSIONS
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800 }}>{sessions.length}</div>
                </div>
            </div>

            {/* Weekly Trends Chart */}
            <div className="glass" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={15} /> TENDANCES HEBDOMADAIRES
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', gap: '10px', padding: '0 10px' }}>
                    {weeklyData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '100%',
                                height: `${d.height}%`,
                                minHeight: '4px',
                                background: 'var(--accent-color)',
                                borderRadius: '4px',
                                opacity: d.height > 0 ? (0.3 + (d.height / 100) * 0.7) : 0.1,
                                boxShadow: d.height > 50 ? '0 0 15px var(--accent-glow)' : 'none',
                                transition: 'height 1s ease'
                            }}></div>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass" style={{ padding: '20px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
                    <Lightbulb size={15} /> CONSEILS IA
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recommendations.map((rec, i) => (
                        <div key={i} style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'flex', gap: '10px' }}>
                            <div style={{ minWidth: '4px', height: '100%', background: 'var(--accent-color)', borderRadius: '2px' }}></div>
                            <p style={{ margin: 0, lineHeight: '1.4' }}>{rec}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* History List */}
            <div className="glass" style={{ padding: '24px', flex: 1, minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} /> HISTORIQUE DES SESSIONS
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sessions.slice(0, 5).map((session, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: 600 }}>Session Focus</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                                    {new Date(session.start_time).toLocaleDateString()} à {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)' }}>{session.focus_score}%</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{session.duration} min</div>
                            </div>
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                            Aucune donnée disponible.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
