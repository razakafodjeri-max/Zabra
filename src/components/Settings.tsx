import React from 'react'
import { Monitor, Bell, Brain, Timer, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

const Settings: React.FC = () => {
    const { settings, updateSettings } = useStore()

    if (!settings) return null

    const themes = [
        { id: 'indigo', label: 'Indigo', color: '#6366F1' },
        { id: 'emerald', label: 'Émeraude', color: '#10B981' },
        { id: 'midnight', label: 'Minuit', color: '#38BDF8' },
        { id: 'solar', label: 'Solaire', color: '#B58900' }
    ]

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Paramètres</h2>

            <section>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                    <Monitor size={14} /> APPARENCE
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                    {themes.map(theme => (
                        <button
                            key={theme.id}
                            onClick={() => updateSettings({ theme: theme.id as any })}
                            className={`glass ${settings.theme === theme.id ? 'active' : ''}`}
                            style={{
                                padding: '15px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '10px',
                                border: settings.theme === theme.id ? `2px solid ${theme.color}` : '1px solid var(--glass-border)'
                            }}
                        >
                            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: theme.color }}></div>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>{theme.label}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                    <Brain size={14} /> FONCTIONNALITÉS
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Détection IA (Caméra)</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Ajuste le timer selon votre attention</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={settings.ai_enabled} onChange={(e) => updateSettings({ ai_enabled: e.target.checked })} />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontWeight: 600 }}>Notifications</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alertes sonores et visuelles</div>
                    </div>
                    <label className="switch">
                        <input type="checkbox" checked={settings.notifications_enabled} onChange={(e) => updateSettings({ notifications_enabled: e.target.checked })} />
                        <span className="slider round"></span>
                    </label>
                </div>
            </section>

            <section>
                <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                    <Timer size={14} /> POMODORO
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <input
                        type="range" min="5" max="60" step="5"
                        value={settings.pomodoro_duration}
                        onChange={(e) => updateSettings({ pomodoro_duration: parseInt(e.target.value) })}
                        style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                    />
                    <span style={{ fontWeight: 800, minWidth: '60px' }}>{settings.pomodoro_duration} min</span>
                </div>
            </section>

            <style>{`
                .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); transition: .4s; border-radius: 24px; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: var(--accent-color); }
                input:checked + .slider:before { transform: translateX(20px); }
            `}</style>
        </div>
    )
}

export default Settings
