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
    webkitAudioContext: typeof AudioContext
  }
}

// Web Speech API types for TypeScript
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  state: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
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
  private isRecording: boolean = false

  constructor() {
    this.audioChunks = []
  }

  // Initialize recording
  async startRecording(
    onStateChange: (state: Partial<RecordingState>) => void,
    onTranscriptUpdate: (transcript: string) => void
  ): Promise<void> {
    try {
      // Check if already recording
      if (this.isRecording) {
        console.warn('Already recording, stopping previous session')
        await this.cleanup()
      }

      // Reset state
      this.audioChunks = []
      this.startTime = Date.now()
      this.currentTranscript = ''
      this.isRecording = true

      // Get microphone access with better error handling
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        })
      } catch (mediaError) {
        console.error('Microphone access error:', mediaError)
        throw new Error('Microphone access denied. Please allow microphone permissions and try again.')
      }

      // Initialize MediaRecorder with error handling
      try {
        this.mediaRecorder = new MediaRecorder(this.stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        })
      } catch (recorderError) {
        console.error('MediaRecorder initialization error:', recorderError)
        throw new Error('Audio recording not supported in this browser.')
      }

      // Set up audio analysis for level monitoring (optional)
      try {
        this.audioContext = new AudioContext()
        this.analyser = this.audioContext.createAnalyser()
        this.microphone = this.audioContext.createMediaStreamSource(this.stream)
        this.microphone.connect(this.analyser)
        
        this.analyser.fftSize = 256
        const bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(bufferLength)
      } catch (audioError) {
        console.warn('Audio context not available, continuing without level monitoring')
        this.analyser = null
        this.dataArray = null
      }

      // Start speech recognition (optional - recording continues even if this fails)
      try {
        this.startSpeechRecognition(onTranscriptUpdate)
      } catch (recognitionError) {
        console.warn('Speech recognition failed, continuing with audio recording only')
        this.recognition = null
      }

      // Start audio recording
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        onStateChange({ 
          isRecording: false, 
          error: 'Audio recording failed. Please try again.' 
        })
      }

      this.mediaRecorder.start(100) // Collect data every 100ms

      // Start audio level monitoring (if available)
      if (this.analyser) {
        this.monitorAudioLevel(onStateChange)
      }

      onStateChange({ 
        isRecording: true, 
        isProcessing: false, 
        error: null,
        duration: 0,
        transcript: ''
      })

    } catch (error) {
      console.error('Error starting recording:', error)
      this.isRecording = false
      await this.cleanup()
      onStateChange({ 
        isRecording: false, 
        error: error instanceof Error ? error.message : 'Failed to start recording. Please check microphone permissions.' 
      })
    }
  }

  // Stop recording
  async stopRecording(): Promise<{ audioBlob: Blob; transcript: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'))
        return
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Stop speech recognition gracefully
          if (this.recognition) {
            try {
              if (this.recognition.state === 'recording') {
                this.recognition.stop()
              }
            } catch (error) {
              console.warn('Error stopping speech recognition:', error)
            }
          }

          // Stop audio analysis
          if (this.stream) {
            this.stream.getTracks().forEach(track => {
              try {
                track.stop()
              } catch (error) {
                console.warn('Error stopping audio track:', error)
              }
            })
          }

          // Create audio blob
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
          const duration = Date.now() - this.startTime
          
          // Preserve transcript even if speech recognition aborted
          const transcript = this.currentTranscript || 'No transcript available'
          
          console.log('Recording completed:', {
            duration,
            transcriptLength: transcript.length,
            audioSize: audioBlob.size,
            hasTranscript: !!transcript
          })

          this.isRecording = false
          resolve({ audioBlob, transcript, duration })
        } catch (error) {
          this.isRecording = false
          reject(error)
        }
      }

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder stop error:', event)
        this.isRecording = false
        reject(new Error('Failed to stop recording'))
      }

      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error)
        this.isRecording = false
        reject(error)
      }
    })
  }

  // Start speech recognition
  private startSpeechRecognition(onTranscriptUpdate: (transcript: string) => void): void {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported')
      return
    }

    try {
      // Create new instance each time to avoid conflicts
      this.recognition = new (SpeechRecognition as any)();
      
      if (!this.recognition) {
        console.warn('Failed to create speech recognition instance')
        return
      }

      this.recognition.continuous = true
      this.recognition.interimResults = true
      this.recognition.lang = 'en-US'

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        try {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          this.currentTranscript = transcript
          onTranscriptUpdate(transcript)
        } catch (error) {
          console.error('Speech recognition result error:', error)
        }
      }

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Handle different error types appropriately
        switch (event.error) {
          case 'aborted':
            // 'aborted' is normal and expected - don't log as error
            console.log('Speech recognition aborted (normal behavior)')
            // Don't clear transcript - keep what we have so far
            break
          case 'not-allowed':
            console.warn('Microphone permission denied')
            break
          case 'network':
            console.warn('Network error in speech recognition')
            break
          case 'no-speech':
            console.log('No speech detected (normal behavior)')
            break
          default:
            console.warn('Speech recognition error:', event.error)
        }
        
        // Don't stop recording for any speech recognition errors
        // Audio recording should continue regardless
      }

      this.recognition.onend = (event: Event) => {
        console.log('Speech recognition ended')
        
        // Try to restart speech recognition if we're still recording
        // This helps capture more of the transcript
        if (this.isRecording && this.recognition) {
          setTimeout(() => {
            try {
              if (this.isRecording && this.recognition) {
                console.log('Restarting speech recognition...')
                this.recognition.start()
              }
            } catch (error) {
              console.warn('Failed to restart speech recognition:', error)
            }
          }, 100) // Small delay to avoid conflicts
        }
      }

      this.recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      // Continue without speech recognition
      this.recognition = null
    }
  }

  // Monitor audio levels
  private monitorAudioLevel(onStateChange: (state: Partial<RecordingState>) => void): void {
    const updateLevel = () => {
      if (!this.analyser || !this.dataArray || !this.isRecording) {
        return
      }

      try {
        this.analyser.getByteFrequencyData(this.dataArray)
        
        // Calculate average audio level
        const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length
        const normalizedLevel = Math.min(average / 128, 1) // Normalize to 0-1

        onStateChange({ 
          audioLevel: normalizedLevel,
          duration: Date.now() - this.startTime
        })

        if (this.isRecording) {
          requestAnimationFrame(updateLevel)
        }
      } catch (error) {
        console.warn('Audio level monitoring error:', error)
        // Stop monitoring on error
      }
    }

    updateLevel()
  }

  // Check if currently recording
  get isCurrentlyRecording(): boolean {
    return this.isRecording && this.mediaRecorder?.state === 'recording'
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    this.isRecording = false

    try {
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          try {
            track.stop()
          } catch (error) {
            console.warn('Error stopping track:', error)
          }
        })
        this.stream = null
      }
    } catch (error) {
      console.warn('Error cleaning up stream:', error)
    }

    try {
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close()
        this.audioContext = null
      }
    } catch (error) {
      console.warn('Error closing audio context:', error)
    }

    try {
      if (this.recognition) {
        // Don't call stop() if it's already stopped to avoid conflicts
        if (this.recognition.state === 'recording') {
          this.recognition.stop()
        }
        this.recognition = null
      }
    } catch (error) {
      console.warn('Error stopping recognition:', error)
    }

    this.mediaRecorder = null
    this.analyser = null
    this.microphone = null
    this.dataArray = null
    this.audioChunks = []
    this.currentTranscript = ''
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
  // Check for MediaRecorder support
  if (!window.MediaRecorder) {
    console.warn('MediaRecorder not supported')
    return false
  }

  // Check for getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.warn('getUserMedia not supported')
    return false
  }

  // Check for Web Speech API support
  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    console.warn('Speech Recognition not supported')
    return false
  }

  // Check for AudioContext support
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('AudioContext not supported')
    return false
  }

  return true
}

export const getBrowserCompatibilityInfo = (): {
  mediaRecorder: boolean
  getUserMedia: boolean
  speechRecognition: boolean
  audioContext: boolean
  overall: boolean
} => {
  const mediaRecorder = !!window.MediaRecorder
  const getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const speechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const audioContext = !!(window.AudioContext || window.webkitAudioContext)
  
  return {
    mediaRecorder,
    getUserMedia,
    speechRecognition,
    audioContext,
    overall: mediaRecorder && getUserMedia && speechRecognition && audioContext
  }
}

export const getBrowserRecommendations = (): string[] => {
  const compatibility = getBrowserCompatibilityInfo()
  const recommendations: string[] = []

  if (!compatibility.mediaRecorder) {
    recommendations.push('Your browser does not support audio recording. Try using Chrome, Firefox, or Safari.')
  }

  if (!compatibility.getUserMedia) {
    recommendations.push('Your browser does not support microphone access. Try using a modern browser.')
  }

  if (!compatibility.speechRecognition) {
    recommendations.push('Your browser does not support speech recognition. Try using Chrome or Edge.')
  }

  if (!compatibility.audioContext) {
    recommendations.push('Your browser does not support audio processing. Try using a modern browser.')
  }

  if (recommendations.length === 0) {
    recommendations.push('Your browser should support voice recording. Make sure to allow microphone permissions.')
  }

  return recommendations
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