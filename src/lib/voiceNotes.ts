// Voice Notes Types
export interface VoiceNote {
  id: string
  audioBlob: Blob
  transcript: string
  duration: number
  createdAt: Date
  contactId: string
}

export interface RecordingState {
  isRecording: boolean
  isProcessing: boolean
  audioLevel: number
  duration: number
  transcript: string
  error: string | null
}

// Web Speech API Types
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Voice Recording Class
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recognition: any = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private stream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0

  constructor() {
    this.audioChunks = []
  }

  // Initialize recording
  async startRecording(
    onStateChange: (state: Partial<RecordingState>) => void,
    onTranscriptUpdate: (transcript: string) => void
  ): Promise<void> {
    try {
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream)
      this.audioChunks = []
      this.startTime = Date.now()

      // Set up audio analysis for level monitoring
      this.audioContext = new AudioContext()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(this.stream)
      this.microphone.connect(this.analyser)
      
      this.analyser.fftSize = 256
      const bufferLength = this.analyser.frequencyBinCount
      this.dataArray = new Uint8Array(bufferLength)

      // Start speech recognition
      this.startSpeechRecognition(onTranscriptUpdate)

      // Start audio recording
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.start(100) // Collect data every 100ms

      // Start audio level monitoring
      this.monitorAudioLevel(onStateChange)

      onStateChange({ 
        isRecording: true, 
        isProcessing: false, 
        error: null,
        duration: 0,
        transcript: ''
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      onStateChange({ 
        isRecording: false, 
        error: 'Failed to access microphone. Please check permissions.' 
      })
    }
  }

  // Stop recording
  async stopRecording(): Promise<{ audioBlob: Blob; transcript: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Stop speech recognition
          if (this.recognition) {
            this.recognition.stop()
          }

          // Stop audio analysis
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop())
          }

          // Create audio blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
          const duration = Date.now() - this.startTime
          const transcript = this.recognition?.transcript || ''

          resolve({ audioBlob, transcript, duration })
        } catch (error) {
          reject(error)
        }
      }

      this.mediaRecorder.stop()
    })
  }

  // Start speech recognition
  private startSpeechRecognition(onTranscriptUpdate: (transcript: string) => void): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onTranscriptUpdate(transcript)
    }

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }

    this.recognition.start()
  }

  // Monitor audio levels
  private monitorAudioLevel(onStateChange: (state: Partial<RecordingState>) => void): void {
    const updateLevel = () => {
      if (!this.analyser || !this.dataArray || !this.isRecording) {
        return
      }

      this.analyser.getByteFrequencyData(this.dataArray)
      
      // Calculate average audio level
      const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length
      const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1

      onStateChange({ 
        audioLevel: normalizedLevel,
        duration: Date.now() - this.startTime
      })

      requestAnimationFrame(updateLevel)
    }

    updateLevel()
  }

  // Check if currently recording
  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  // Clean up resources
  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    if (this.recognition) {
      this.recognition.stop()
    }
  }
}

// Voice Note Storage
export const saveVoiceNote = (contactId: string, voiceNote: VoiceNote): void => {
  try {
    const voiceNotes = getVoiceNotes(contactId)
    voiceNotes.push(voiceNote)
    localStorage.setItem(`voiceNotes_${contactId}`, JSON.stringify(voiceNotes))
  } catch (error) {
    console.error('Error saving voice note:', error)
  }
}

export const getVoiceNotes = (contactId: string): VoiceNote[] => {
  try {
    const stored = localStorage.getItem(`voiceNotes_${contactId}`)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading voice notes:', error)
    return []
  }
}

export const deleteVoiceNote = (contactId: string, voiceNoteId: string): void => {
  try {
    const voiceNotes = getVoiceNotes(contactId)
    const filtered = voiceNotes.filter(note => note.id !== voiceNoteId)
    localStorage.setItem(`voiceNotes_${contactId}`, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting voice note:', error)
  }
}

// Utility functions
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

// Check browser support
export const isVoiceRecordingSupported = (): boolean => {
  return !!(navigator.mediaDevices && 
           'getUserMedia' in navigator.mediaDevices && 
           ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window))
} 