import React, { useState } from 'react'
import { UserPlus, Trash2, Check, User, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'

const Profile: React.FC = () => {
    const { profiles, currentProfileId, setCurrentProfile, addProfile, removeProfile } = useStore()
    const [isCreating, setIsCreating] = useState(false)
    const [newName, setNewName] = useState('')

    const handleCreate = async () => {
        if (newName.trim()) {
            await addProfile(newName.trim())
            setNewName('')
            setIsCreating(false)
        }
    }

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Gestion des Profils</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="nav-btn active"
                    style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <UserPlus size={16} /> Nouveau
                </button>
            </div>

            {isCreating && (
                <div className="glass" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid var(--accent-color)' }}>
                    <input
                        autoFocus
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nom du profil..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', padding: '12px', borderRadius: '8px', color: 'white', outline: 'none' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    />
                    <button onClick={handleCreate} className="nav-btn active" style={{ padding: '12px' }}><Check size={18} /></button>
                    <button onClick={() => setIsCreating(false)} className="nav-btn" style={{ padding: '12px' }}><Trash2 size={18} /></button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        className={`glass ${currentProfileId === profile.id ? 'active' : ''}`}
                        onClick={() => setCurrentProfile(profile.id)}
                        style={{
                            padding: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '15px',
                            border: currentProfileId === profile.id ? '2px solid var(--accent-color)' : '1px solid var(--glass-border)',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: currentProfileId === profile.id ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <User size={30} color={currentProfileId === profile.id ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                        </div>
                        <span style={{ fontWeight: 700 }}>{profile.name}</span>
                        {profile.id !== 'default' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); removeProfile(profile.id); }}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.5 }}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Profile
