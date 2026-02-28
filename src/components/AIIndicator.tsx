import React, { useRef, useEffect, useState } from 'react'
import { useStore } from '../store/useStore'
import { AIDetectionService } from '../services/aiDetection'
import { Camera, CameraOff, Loader2, CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react'

const AIIndicator: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const aiService = useRef(new AIDetectionService())
    const { setFocusState, currentFocusState, settings } = useStore()

    const [status, setStatus] = useState<'loading' | 'camera-ready' | 'ai-active' | 'error' | 'disabled'>('loading')
    const [statusText, setStatusText] = useState('Démarrage...')

    useEffect(() => {
        // 1. Handle Disabled State
        if (settings && !settings.ai_enabled) {
            setStatus('disabled')
            setStatusText('Désactivé')
            aiService.current.stopStream()
            return
        }

        let isMounted = true
        let detectionInterval: NodeJS.Timeout

        const startSystem = async () => {
            try {
                if (!videoRef.current) return

                // --- PHASE 1: Camera First ---
                setStatus('loading')
                setStatusText('Accès Caméra...')
                aiService.current.setVideo(videoRef.current)

                try {
                    await aiService.current.startStream()
                    if (isMounted) {
                        setStatus('camera-ready')
                        setStatusText('Caméra OK')
                    }
                } catch (camErr) {
                    if (isMounted) {
                        setStatus('error')
                        setStatusText('Caméra Bloquée')
                    }
                    return
                }

                // --- PHASE 2: AI Loading (Background) ---
                if (isMounted) {
                    setStatusText('Chargement IA...')
                    await aiService.current.loadModel()

                    const modelReady = aiService.current.getIsModelReady()
                    if (isMounted) {
                        if (modelReady) {
                            setStatus('ai-active')
                            setStatusText('IA Active')

                            // Start detection loop
                            detectionInterval = setInterval(async () => {
                                try {
                                    const state = await aiService.current.detect()
                                    if (state && isMounted) setFocusState(state)
                                } catch (e) {
                                    console.error('Detection frame error:', e)
                                }
                            }, 2000)
                        } else {
                            setStatus('camera-ready')
                            setStatusText('Mode Vidéo')
                        }
                    }
                }

            } catch (err) {
                console.error('AI System critical fail:', err)
                if (isMounted) {
                    setStatus('error')
                    setStatusText('Erreur Système')
                }
            }
        }

        startSystem()

        return () => {
            isMounted = false
            if (detectionInterval) clearInterval(detectionInterval)
            aiService.current.stopStream()
        }
    }, [settings?.ai_enabled])

    const handleRetry = () => {
        // Trigger re-render of effect
        const current = settings?.ai_enabled
        useStore.getState().updateSettings({ ai_enabled: !current })
        setTimeout(() => useStore.getState().updateSettings({ ai_enabled: !!current }), 10)
    }

    const getStatusIcon = () => {
        switch (status) {
            case 'loading': return <Loader2 size={16} className="animate-spin" color="var(--accent-color)" />
            case 'camera-ready': return <Camera size={16} color="#f59e0b" />
            case 'ai-active': return <CheckCircle2 size={16} color="#10b981" />
            case 'error': return <CameraOff size={16} color="#ef4444" />
            case 'disabled': return <CameraOff size={16} color="var(--text-secondary)" />
        }
    }

    return (
        <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.02)',
            minWidth: '180px'
        }}>
            <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: 'scaleX(-1)',
                        opacity: (status === 'camera-ready' || status === 'ai-active') ? 1 : 0
                    }}
                    muted
                    autoPlay
                    playsInline
                />
                {(status !== 'camera-ready' && status !== 'ai-active') && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getStatusIcon()}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>MOTEUR IA</span>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: status === 'error' ? '#ef4444' : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {statusText.toUpperCase()}
                </span>
            </div>

            {status === 'error' && (
                <button onClick={handleRetry} style={{ background: 'var(--accent-glow)', border: 'none', color: 'var(--accent-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                    RESAISIR
                </button>
            )}

            <div className={`status-indicator status-${currentFocusState}`} style={{ marginLeft: '4px', flexShrink: 0 }} />
        </div>
    )
}

export default AIIndicator
