/// <reference types="vite/client" />

interface Window {
    ipcRenderer: {
        on: (channel: string, listener: (...args: any[]) => void) => void
        off: (channel: string, listener: (...args: any[]) => void) => void
        send: (channel: string, ...args: any[]) => void
        invoke: (channel: string, ...args: any[]) => Promise<any>
        getTasks: () => Promise<any[]>
        saveTask: (task: any) => Promise<any>
        deleteTask: (id: string) => Promise<any>
        saveSession: (session: any) => Promise<any>
        getSessions: () => Promise<any[]>
    }
}
