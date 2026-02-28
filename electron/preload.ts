import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...rest] = args
        return ipcRenderer.off(channel, ...rest)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...rest] = args
        return ipcRenderer.send(channel, ...rest)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...rest] = args
        return ipcRenderer.invoke(channel, ...rest)
    },

    // Database APIs
    getProfiles: () => ipcRenderer.invoke('db:get-profiles'),
    createProfile: (profile: any) => ipcRenderer.invoke('db:create-profile', profile),
    deleteProfile: (id: string) => ipcRenderer.invoke('db:delete-profile', id),
    getSettings: (profileId: string) => ipcRenderer.invoke('db:get-settings', profileId),
    updateSettings: (settings: any) => ipcRenderer.invoke('db:update-settings', settings),
    getTasks: (profileId: string) => ipcRenderer.invoke('db:get-tasks', profileId),
    saveTask: (task: any) => ipcRenderer.invoke('db:save-task', task),
    deleteTask: (id: string) => ipcRenderer.invoke('db:delete-task', id),
    saveSession: (session: any) => ipcRenderer.invoke('db:save-session', session),
    getSessions: (profileId: string) => ipcRenderer.invoke('db:get-sessions', profileId),
})
