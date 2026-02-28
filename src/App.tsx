import React, { useEffect } from 'react'
import { LayoutDashboard, Settings as SettingsIcon, UserCircle, Target, Brain, Timer as TimerIcon, Sparkles } from 'lucide-react'
import Timer from './components/Timer'
import TaskList from './components/TaskList'
import Dashboard from './components/Dashboard'
import AIIndicator from './components/AIIndicator'
import ProfileView from './components/Profile'
import SettingsView from './components/Settings'
import { useStore } from './store/useStore'

const App: React.FC = () => {
    const {
        activeTab,
        setActiveTab,
        currentFocusState,
        loadInitialData,
        profiles,
        currentProfileId,
        settings
    } = useStore()

    useEffect(() => {
        loadInitialData()
    }, [])

    const renderContent = () => {
        switch (activeTab) {
            case 'focus': return <Timer />
            case 'stats': return <Dashboard />
            case 'profile': return <ProfileView />
            case 'settings': return <SettingsView />
            case 'brain': return <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <div style={{ padding: '12px', background: 'var(--accent-glow)', borderRadius: '15px' }}>
                        <Brain size={32} color="var(--accent-color)" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Intelligence Focus</h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Analyse de vos schémas cognitifs</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px' }}>RYTHME CIRCADIEN</div>
                        <p style={{ fontSize: '13px', margin: 0 }}>Votre fenêtre de focus maximal semble être entre <b>09h00 et 11h30</b>.</p>
                    </div>
                    <div className="glass" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '10px' }}>FATIGUE DÉTECTÉE</div>
                        <p style={{ fontSize: '13px', margin: 0 }}>Sessions après 16h : <b>-25%</b> de focus moyen. Privilégiez les tâches simples.</p>
                    </div>
                </div>

                <div className="glass" style={{ padding: '20px', background: 'var(--accent-glow)', opacity: 0.9 }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} /> RECOMMANDATION DU JOUR
                    </h4>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                        Aujourd'hui, l'IA suggère d'alterner des sessions de <b>40 min</b> avec des pauses "mouvements" de <b>7 min</b> pour compenser la fatigue visuelle détectée hier.
                    </p>
                </div>
            </div>
            default: return <Timer />
        }
    }

    return (
        <div className="app-container">
            {/* Header */}
            <header className="header">
                <div className="logo" onClick={() => setActiveTab('focus')} style={{ cursor: 'pointer' }}>STUDYFLOW</div>
                <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="status-badge glass" style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', gap: '8px', borderRadius: '12px' }}>
                        <span className={`status-indicator status-${currentFocusState}`}></span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                            {currentFocusState.toUpperCase()}
                        </span>
                    </div>
                    <AIIndicator />
                </div>
            </header>

            {/* Main Content */}
            <main style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flex: 1, minHeight: 0, overflow: 'hidden' }}>

                {/* Primary View */}
                <section className="glass" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                    alignItems: activeTab === 'stats' ? 'flex-start' : 'center',
                    justifyContent: activeTab === 'stats' ? 'flex-start' : 'center',
                    minHeight: '0'
                }}>
                    {renderContent()}

                    {/* View Decorations */}
                    <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-glow)', filter: 'blur(60px)', opacity: 0.1, pointerEvents: 'none' }}></div>
                </section>

                {/* Sidebar */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, height: '100%', overflow: 'hidden' }}>

                    <div className="glass" style={{
                        padding: '20px',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.01)'
                    }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.08em' }}>
                            <Target size={14} /> TÂCHES PRIORITAIRES
                        </h3>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                            <TaskList />
                        </div>
                    </div>

                    <div className="glass" style={{
                        padding: '8px',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        gap: '2px',
                        flexShrink: 0,
                        width: '100%',
                        height: '70px',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 10
                    }}>
                        <button className={`nav-btn ${activeTab === 'focus' ? 'active' : ''}`} onClick={() => setActiveTab('focus')} title="Focus">
                            <TimerIcon size={18} />
                            <span className="nav-label">Focus</span>
                        </button>
                        <button className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} title="Stats">
                            <LayoutDashboard size={18} />
                            <span className="nav-label">Stats</span>
                        </button>
                        <button className={`nav-btn ${activeTab === 'brain' ? 'active' : ''}`} onClick={() => setActiveTab('brain')} title="Intelligence">
                            <Brain size={18} />
                            <span className="nav-label">Brain</span>
                        </button>
                        <button className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} title="Réglages">
                            <SettingsIcon size={18} />
                            <span className="nav-label">Params</span>
                        </button>
                        <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} title="Profil">
                            <UserCircle size={18} />
                            <span className="nav-label">Profil</span>
                        </button>
                    </div>

                </aside>
            </main>

            {/* Background Decorative Element */}
            <div style={{
                position: 'fixed',
                bottom: '-150px',
                left: '10%',
                width: '600px',
                height: '600px',
                background: 'var(--accent-glow)',
                filter: 'blur(120px)',
                zIndex: -1,
                borderRadius: '50%',
                opacity: 0.1
            }}></div>
        </div>
    )
}

export default App
