import { create } from 'zustand'

interface Task {
    id: string
    profile_id: string
    title: string
    completed: boolean
    pomodoros: number
}

interface Profile {
    id: string
    name: string
    avatar: string
    created_at: string
}

interface Settings {
    profile_id: string
    theme: 'indigo' | 'emerald' | 'solar' | 'midnight'
    ai_enabled: boolean
    notifications_enabled: boolean
    pomodoro_duration: number
}

interface AppState {
    // Auth / Profile
    profiles: Profile[]
    currentProfileId: string
    settings: Settings | null
    selectedTaskId: string | null

    // Domain Data
    tasks: Task[]
    sessions: any[]

    // UI / AI State
    activeTab: 'focus' | 'stats' | 'profile' | 'settings' | 'brain'
    currentFocusState: 'focus' | 'distract' | 'absent'
    lastInteraction: number

    // Actions
    setProfiles: (profiles: Profile[]) => void
    setCurrentProfile: (id: string) => Promise<void>
    addProfile: (name: string) => Promise<void>
    removeProfile: (id: string) => Promise<void>

    updateSettings: (settings: Partial<Settings>) => Promise<void>

    setTasks: (tasks: Task[]) => void
    addTask: (title: string) => Promise<void>
    toggleTask: (id: string) => Promise<void>
    removeTask: (id: string) => Promise<void>

    setActiveTab: (tab: AppState['activeTab']) => void
    setFocusState: (state: AppState['currentFocusState']) => void
    recordInteraction: () => void

    loadSessions: (profileId: string) => Promise<void>
    addSession: (session: any) => Promise<void>
    setSelectedTask: (id: string | null) => void
    incrementTaskPomodoro: (id: string) => Promise<void>
    loadInitialData: () => Promise<void>
}

const getIpc = () => (window as any).ipcRenderer || {
    getProfiles: async () => [],
    createProfile: async () => { },
    deleteProfile: async () => { },
    getSettings: async () => ({ theme: 'indigo', ai_enabled: true, notifications_enabled: true, pomodoro_duration: 25 }),
    updateSettings: async () => { },
    getTasks: async () => [],
    saveTask: async () => { },
    deleteTask: async () => { },
    getSessions: async () => [],
    saveSession: async () => { }
}

export const useStore = create<AppState>((set, get) => ({
    profiles: [],
    currentProfileId: 'default',
    settings: null,
    selectedTaskId: null,
    tasks: [],
    sessions: [],
    activeTab: 'focus',
    currentFocusState: 'focus',
    lastInteraction: Date.now(),

    setProfiles: (profiles) => set({ profiles }),

    setCurrentProfile: async (id) => {
        const settings = await getIpc().getSettings(id)
        const tasks = await getIpc().getTasks(id)
        const sessions = await getIpc().getSessions(id)
        set({ currentProfileId: id, settings, tasks, sessions, selectedTaskId: null })
        // Apply theme
        if (settings?.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme)
        }
    },

    addProfile: async (name) => {
        const id = Date.now().toString()
        const newProfile = { id, name, avatar: '', created_at: new Date().toISOString() }
        await getIpc().createProfile(newProfile)
        const profiles = await getIpc().getProfiles()
        set({ profiles })
        await get().setCurrentProfile(id)
    },

    removeProfile: async (id) => {
        if (id === 'default') return // Protect default
        await getIpc().deleteProfile(id)
        const profiles = await getIpc().getProfiles()
        set({ profiles })
        if (get().currentProfileId === id) {
            await get().setCurrentProfile('default')
        }
    },

    updateSettings: async (newSettings) => {
        const currentSettings = get().settings
        if (!currentSettings) return
        const updated = { ...currentSettings, ...newSettings }
        await getIpc().updateSettings(updated)
        set({ settings: updated })

        if (newSettings.theme) {
            document.documentElement.setAttribute('data-theme', newSettings.theme)
        }
    },

    setTasks: (tasks) => set({ tasks }),

    addTask: async (title) => {
        const profile_id = get().currentProfileId
        const newTask = { id: Date.now().toString(), profile_id, title, completed: false, pomodoros: 0 }
        await getIpc().saveTask(newTask)
        set((state) => ({ tasks: [...state.tasks, newTask] }))
    },

    toggleTask: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (task) {
            const updatedTask = { ...task, completed: !task.completed }
            await getIpc().saveTask(updatedTask)
            set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
            }))
        }
    },

    removeTask: async (id) => {
        await getIpc().deleteTask(id)
        set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id)
        }))
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setFocusState: (state) => set({ currentFocusState: state }),
    recordInteraction: () => set({ lastInteraction: Date.now() }),

    loadSessions: async (profileId) => {
        const sessions = await getIpc().getSessions(profileId)
        set({ sessions })
    },

    addSession: async (session) => {
        await getIpc().saveSession(session)
        const sessions = await getIpc().getSessions(session.profile_id)
        set({ sessions })
    },

    setSelectedTask: (id) => set({ selectedTaskId: id }),

    incrementTaskPomodoro: async (id) => {
        const task = get().tasks.find(t => t.id === id)
        if (task) {
            const updatedTask = { ...task, pomodoros: (task.pomodoros || 0) + 1 }
            await getIpc().saveTask(updatedTask)
            set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
            }))
        }
    },

    loadInitialData: async () => {
        const profiles = await getIpc().getProfiles()
        set({ profiles })
        const profileId = get().currentProfileId
        await get().setCurrentProfile(profileId)
    }
}))
