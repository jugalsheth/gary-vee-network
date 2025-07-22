// Voice Notes Types
export interface VoiceNote {
  id: string
  audioUrl?: string // URL to audio file (for production)
  audioBlob?: Blob // Blob for MVP/localStorage
  transcript: string
  duration: number
  createdAt: Date
  contactId: string
  fileSize?: number // For storage tracking
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
    SpeechRecognition: SpeechRecognition
    webkitSpeechRecognition: SpeechRecognition
  }
}

// Web Speech API types for TypeScript
interface SpeechRecognition extends EventTarget {
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
  [key: string]: unknown;
}
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

// Voice Recording Class
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recognition: SpeechRecognition | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private stream: MediaStream | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private currentTranscript: string = ''

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
      this.currentTranscript = ''

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
          const transcript = this.currentTranscript || ''

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

    // Replace instantiation with a type-safe constructor cast
    const SpeechRecognitionConstructor = (window.SpeechRecognition || window.webkitSpeechRecognition) as unknown as new () => SpeechRecognition;
    this.recognition = new SpeechRecognitionConstructor();
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      this.currentTranscript = transcript
      onTranscriptUpdate(transcript)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
    }

    this.recognition.start()
  }

  // Monitor audio levels
  private monitorAudioLevel(onStateChange: (state: Partial<RecordingState>) => void): void {
    const updateLevel = () => {
      if (!this.analyser || !this.dataArray || this.mediaRecorder?.state !== 'recording') {
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

// Production-ready voice note storage (Snowflake compatible)
export interface VoiceNoteStorage {
  // For MVP (localStorage)
  saveVoiceNoteLocal: (contactId: string, voiceNote: VoiceNote) => void
  getVoiceNotesLocal: (contactId: string) => VoiceNote[]
  deleteVoiceNoteLocal: (contactId: string, voiceNoteId: string) => void
  
  // For Production (Snowflake)
  saveVoiceNoteToCloud: (contactId: string, voiceNote: VoiceNote) => Promise<void>
  getVoiceNotesFromCloud: (contactId: string) => Promise<VoiceNote[]>
  deleteVoiceNoteFromCloud: (contactId: string, voiceNoteId: string) => Promise<void>
}

// MVP Storage (localStorage)
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

// Production Storage (Snowflake-ready)
export const saveVoiceNoteToCloud = async (contactId: string, voiceNote: VoiceNote): Promise<void> => {
  try {
    // Convert Blob to base64 for storage
    if (voiceNote.audioBlob) {
      const base64Audio = await blobToBase64(voiceNote.audioBlob)
      
      // Create Snowflake-compatible record
      const snowflakeRecord = {
        id: voiceNote.id,
        contact_id: contactId,
        transcript: voiceNote.transcript,
        duration: voiceNote.duration,
        audio_data: base64Audio, // Store as base64 string
        file_size: voiceNote.audioBlob.size,
        created_at: voiceNote.createdAt.toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // TODO: Replace with actual Snowflake API call
      console.log('Saving to Snowflake:', snowflakeRecord)
      
      // For now, also save locally
      saveVoiceNote(contactId, voiceNote)
    }
  } catch (error) {
    console.error('Error saving voice note to cloud:', error)
    throw error
  }
}

export const getVoiceNotesFromCloud = async (contactId: string): Promise<VoiceNote[]> => {
  try {
    // TODO: Replace with actual Snowflake API call
    console.log('Fetching voice notes from Snowflake for contact:', contactId)
    
    // For now, return local storage
    return getVoiceNotes(contactId)
  } catch (error) {
    console.error('Error loading voice notes from cloud:', error)
    return []
  }
}

// Utility functions
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const base64ToBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64.split(',')[1])
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: 'audio/wav' })
}

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

// Snowflake Schema for Voice Notes
export const SNOWFLAKE_VOICE_NOTES_SCHEMA = `
CREATE TABLE voice_notes (
  id VARCHAR(36) PRIMARY KEY,
  contact_id VARCHAR(36) NOT NULL,
  transcript TEXT,
  duration INTEGER, -- milliseconds
  audio_data TEXT, -- base64 encoded audio
  file_size INTEGER, -- bytes
  created_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP(),
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Index for fast lookups
CREATE INDEX idx_voice_notes_contact_id ON voice_notes(contact_id);
CREATE INDEX idx_voice_notes_created_at ON voice_notes(created_at);
` 