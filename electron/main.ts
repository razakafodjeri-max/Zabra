import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import { initDatabase, dbService } from './database.js'

// Fix for Windows Camera "Resource Busy" / 0xC00D3704 error
// This forces use of DirectShow instead of MediaFoundation which is often buggy
app.commandLine.appendSwitch('disable-features', 'MediaFoundationVideoCapture')
app.commandLine.appendSwitch('disable-gpu-vsync')
app.commandLine.appendSwitch('do-not-force-msaa')

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null
let isQuitting = false

function createTray() {
    const iconPath = path.join(process.env.VITE_PUBLIC!, 'vite.svg')
    const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 })
    tray = new Tray(icon)

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Ouvrir STUDYFLOW', click: () => win?.show() },
        { type: 'separator' },
        {
            label: 'Quitter', click: () => {
                isQuitting = true
                app.quit()
            }
        }
    ])

    tray.setToolTip('STUDYFLOW')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        win?.isVisible() ? win.hide() : win?.show()
    })
}

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC!, 'electron-vite.svg'),
        width: 1100,
        height: 850,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: false,
            contextIsolation: true
        },
        titleBarStyle: 'hidden',
        backgroundColor: '#0F1115',
        show: !process.argv.includes('--hidden')
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }

    win.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault()
            win?.hide()
        }
        return false
    })
}

// IPC Handlers
ipcMain.handle('db:get-profiles', async () => {
    try {
        console.log('IPC: db:get-profiles')
        return dbService.getProfiles()
    } catch (e: any) {
        console.error('IPC Error (get-profiles):', e.message)
        return []
    }
})
ipcMain.handle('db:create-profile', async (_, profile) => {
    try {
        console.log('IPC: db:create-profile', profile.name)
        return dbService.createProfile(profile)
    } catch (e: any) {
        console.error('IPC Error (create-profile):', e.message)
    }
})
ipcMain.handle('db:delete-profile', async (_, id) => {
    try {
        console.log('IPC: db:delete-profile', id)
        return dbService.deleteProfile(id)
    } catch (e: any) {
        console.error('IPC Error (delete-profile):', e.message)
    }
})
ipcMain.handle('db:get-settings', async (_, profileId) => {
    try {
        console.log('IPC: db:get-settings', profileId)
        return dbService.getSettings(profileId)
    } catch (e: any) {
        console.error('IPC Error (get-settings):', e.message)
    }
})
ipcMain.handle('db:update-settings', async (_, settings) => {
    try {
        console.log('IPC: db:update-settings', settings.profile_id)
        return dbService.updateSettings(settings)
    } catch (e: any) {
        console.error('IPC Error (update-settings):', e.message)
    }
})
ipcMain.handle('db:get-tasks', async (_, profileId) => {
    try {
        console.log('IPC: db:get-tasks', profileId)
        return dbService.getTasks(profileId)
    } catch (e: any) {
        console.error('IPC Error (get-tasks):', e.message)
        return []
    }
})
ipcMain.handle('db:save-task', async (_, task) => {
    try {
        console.log('IPC: db:save-task', task.title)
        return dbService.saveTask(task)
    } catch (e: any) {
        console.error('IPC Error (save-task):', e.message)
    }
})
ipcMain.handle('db:delete-task', async (_, id) => {
    try {
        console.log('IPC: db:delete-task', id)
        return dbService.deleteTask(id)
    } catch (e: any) {
        console.error('IPC Error (delete-task):', e.message)
    }
})
ipcMain.handle('db:save-session', async (_, session) => {
    try {
        console.log('IPC: db:save-session', session.duration)
        return dbService.saveSession(session)
    } catch (e: any) {
        console.error('IPC Error (save-session):', e.message)
    }
})
ipcMain.handle('db:get-sessions', async (_, profileId) => {
    try {
        console.log('IPC: db:get-sessions', profileId)
        return dbService.getSessions(profileId)
    } catch (e: any) {
        console.error('IPC Error (get-sessions):', e.message)
        return []
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    try {
        initDatabase()
        createTray()
        createWindow()
    } catch (err) {
        console.error('Failed to initialize:', err)
        createWindow()
    }
})
