import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'

export class AIDetectionService {
    private model: blazeface.BlazeFaceModel | null = null
    private video: HTMLVideoElement | null = null
    private stream: MediaStream | null = null
    private isDetecting = false
    private isModelLoading = false

    setVideo(videoElement: HTMLVideoElement) {
        this.video = videoElement
    }

    getIsModelReady() {
        return !!this.model
    }

    getIsModelLoading() {
        return this.isModelLoading
    }

    async loadModel() {
        if (this.model || this.isModelLoading) return
        this.isModelLoading = true

        try {
            console.log('AI Service: Waiting for TensorFlow...')
            await tf.ready()
            console.log('AI Service: TensorFlow ready, loading BlazeFace...')

            const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))

            this.model = await Promise.race([
                blazeface.load(),
                timeout(10000) // Increased to 10s for slower hardware
            ]) as blazeface.BlazeFaceModel

            console.log('AI Service: BlazeFace loaded successfully')
        } catch (e: any) {
            console.error('AI Service: Model load failed:', e.message)
            this.model = null
        } finally {
            this.isModelLoading = false
        }
    }

    async startStream() {
        if (!this.video) throw new Error('Vidéo non initialisée')
        if (this.stream) this.stopStream()

        console.log('AI Service: Requesting camera stream...')

        const constraints = [
            { video: { facingMode: 'user' }, audio: false },
            { video: true, audio: false },
            { video: { width: 1280, height: 720 }, audio: false },
            { video: { width: 640, height: 480 }, audio: false }
        ]

        // Small delay to let hardware release from previous attempts
        await new Promise(r => setTimeout(r, 500))

        for (const constraint of constraints) {
            try {
                console.log(`AI Service: Trying constraint:`, constraint)
                this.stream = await navigator.mediaDevices.getUserMedia(constraint)
                console.log('AI Service: Stream obtained')
                this.video.srcObject = this.stream

                // Wait for video to be ready before playing
                await new Promise((resolve) => {
                    if (this.video) this.video.onloadedmetadata = () => resolve(true)
                    else resolve(false)
                })

                await this.video.play()
                this.isDetecting = true
                return true // Success
            } catch (e) {
                console.warn(`AI Service: Constraint failed:`, e)
            }
        }

        throw new Error('Impossible d\'accéder à la caméra.')
    }

    stopStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop()
                this.stream?.removeTrack(track)
            })
            this.stream = null
        }
        this.isDetecting = false
        if (this.video) {
            this.video.srcObject = null
            this.video.load() // Force reset
        }
    }

    async detect() {
        if (!this.model || !this.video || !this.isDetecting || this.video.paused) return null

        try {
            const predictions = await this.model.estimateFaces(this.video, false)

            if (predictions.length === 0) {
                return 'absent'
            }

            const face = predictions[0] as any
            const landmarks = face.landmarks

            const rightEye = landmarks[0]
            const leftEye = landmarks[1]
            const nose = landmarks[2]

            const eyeCenter = (rightEye[0] + leftEye[0]) / 2
            const noseX = nose[0]
            const noseOffset = Math.abs(noseX - eyeCenter)

            const eyeDistance = Math.abs(rightEye[0] - leftEye[0])
            const offsetThreshold = eyeDistance * 0.25

            if (noseOffset > offsetThreshold) {
                return 'distract'
            }

            const videoWidth = this.video.videoWidth || 640
            const videoHeight = this.video.videoHeight || 480
            const box = face.topLeft as [number, number]
            const size = face.bottomRight as [number, number]

            const centerX = (box[0] + size[0]) / 2
            const centerY = (box[1] + size[1]) / 2

            if (centerX < videoWidth * 0.2 || centerX > videoWidth * 0.8 ||
                centerY < videoHeight * 0.2 || centerY > videoHeight * 0.8) {
                return 'distract'
            }

            return 'focus'
        } catch (e) {
            console.error('Detection frame error:', e)
            return null
        }
    }
}
