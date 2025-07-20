import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Mic, Square, X, Play, Pause, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showSuccessToast } from '@/lib/toast'
import { 
  VoiceRecorder as VoiceRecorderClass, 
  type RecordingState, 
  formatDuration,
  isVoiceRecordingSupported 
} from '@/lib/voiceNotes'

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void
  onAudioSaved?: (audioBlob: Blob) => void
  existingNotes?: string
  className?: string
}

export function VoiceRecorder({ 
  onTranscriptionComplete, 
  onAudioSaved, 
  existingNotes,
  className 
}: VoiceRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isProcessing: false,
    audioLevel: 0,
    duration: 0,
    transcript: '',
    error: null
  })
  
  const [isSupported, setIsSupported] = useState(true)
  const voiceRecorderRef = useRef<VoiceRecorderClass | null>(null)

  useEffect(() => {
    setIsSupported(isVoiceRecordingSupported())
  }, [])

  const handleStartRecording = async () => {
    if (!isSupported) {
      setRecordingState(prev => ({ ...prev, error: 'Voice recording not supported in this browser' }))
      return
    }

    try {
      voiceRecorderRef.current = new VoiceRecorderClass()
      
      await voiceRecorderRef.current.startRecording(
        (state) => setRecordingState(prev => ({ ...prev, ...state })),
        (transcript) => setRecordingState(prev => ({ ...prev, transcript }))
      )
    } catch (error) {
      console.error('Error starting recording:', error)
      setRecordingState(prev => ({ 
        ...prev, 
        error: 'Failed to start recording. Please check microphone permissions.' 
      }))
    }
  }

  const handleStopRecording = async () => {
    if (!voiceRecorderRef.current) return

    try {
      setRecordingState(prev => ({ ...prev, isProcessing: true }))
      
      const { audioBlob, transcript, duration } = await voiceRecorderRef.current.stopRecording()
      
      // Create voice note
      const voiceNote = {
        id: Date.now().toString(),
        audioBlob,
        transcript,
        duration,
        createdAt: new Date(),
        contactId: 'temp'
      }

      // Call callbacks
      onTranscriptionComplete(transcript)
      if (onAudioSaved) {
        onAudioSaved(audioBlob)
      }

      // Show success toast
      showSuccessToast.voiceNoteSaved()

      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false,
        transcript: ''
      }))

      // Clean up
      voiceRecorderRef.current.cleanup()
      voiceRecorderRef.current = null

    } catch (error) {
      console.error('Error stopping recording:', error)
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false,
        error: 'Failed to process recording' 
      }))
    }
  }

  const handleCancelRecording = () => {
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.cleanup()
      voiceRecorderRef.current = null
    }
    
    setRecordingState({
      isRecording: false,
      isProcessing: false,
      audioLevel: 0,
      duration: 0,
      transcript: '',
      error: null
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceRecorderRef.current) {
        voiceRecorderRef.current.cleanup()
      }
    }
  }, [])

  if (!isSupported) {
    return (
      <Card className={cn("border-orange-200 bg-orange-50", className)}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-orange-700">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">Voice recording not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-blue-200", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Voice Notes</h3>
          </div>

          {/* Error Display */}
          {recordingState.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{recordingState.error}</p>
            </div>
          )}

          {/* Recording Interface */}
          {recordingState.isRecording ? (
            <div className="space-y-3">
              {/* Recording Status */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-700">
                  Recording... {formatDuration(recordingState.duration)}
                </span>
              </div>

              {/* Audio Level Meter */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Audio Level</span>
                </div>
                <Progress 
                  value={recordingState.audioLevel * 100} 
                  className="h-2"
                />
              </div>

              {/* Live Transcript */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800 font-medium mb-1">
                  {recordingState.transcript ? 'Live Transcript:' : 'Listening...'}
                </p>
                <p className="text-sm text-blue-700">
                  {recordingState.transcript || 'Start speaking to see transcription...'}
                </p>
              </div>

              {/* Recording Controls */}
              <div className="flex space-x-2">
                <Button 
                  onClick={handleStopRecording}
                  disabled={recordingState.isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
                <Button 
                  onClick={handleCancelRecording}
                  variant="outline"
                  disabled={recordingState.isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* Idle State */
            <div className="space-y-3">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Record voice note</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Speak clearly for better transcription
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleStartRecording}
                disabled={recordingState.isProcessing}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>

              {/* Tips */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Speak clearly and at a normal pace for the best transcription results.
                </p>
              </div>
            </div>
          )}

          {/* Processing State */}
          {recordingState.isProcessing && (
            <div className="flex items-center space-x-2 text-blue-700">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Processing recording...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 