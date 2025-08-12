import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Mic, Square, X, Play, Pause, Volume2, AlertTriangle, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showSuccessToast } from '@/lib/toast'
import { 
  VoiceRecorder as VoiceRecorderClass, 
  type RecordingState, 
  formatDuration,
  isVoiceRecordingSupported,
  getBrowserCompatibilityInfo,
  getBrowserRecommendations
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
  const [compatibilityInfo, setCompatibilityInfo] = useState(getBrowserCompatibilityInfo())
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualTranscript, setManualTranscript] = useState('')
  const [isSendingTranscript, setIsSendingTranscript] = useState(false)
  const voiceRecorderRef = useRef<VoiceRecorderClass | null>(null)

  useEffect(() => {
    const supported = isVoiceRecordingSupported()
    setIsSupported(supported)
    setCompatibilityInfo(getBrowserCompatibilityInfo())
    setRecommendations(getBrowserRecommendations())
  }, [])

  const handleStartRecording = async () => {
    console.log('🎤 handleStartRecording called')
    console.log('🎤 onTranscriptionComplete callback exists:', typeof onTranscriptionComplete === 'function')
    
    if (!isSupported) {
      setRecordingState(prev => ({ ...prev, error: 'Voice recording not supported in this browser' }))
      return
    }

    // Clear any previous errors and manual input
    setRecordingState(prev => ({ ...prev, error: null }))
    setShowManualInput(false)
    setManualTranscript('')

    try {
      console.log('🎤 Starting voice recording...')
      
      // Clean up any existing recorder
      if (voiceRecorderRef.current) {
        console.log('🧹 Cleaning up previous recorder...')
        await voiceRecorderRef.current.cleanup()
        voiceRecorderRef.current = null
      }

      voiceRecorderRef.current = new VoiceRecorderClass()
      console.log('🎯 VoiceRecorder instance created')
      
      await voiceRecorderRef.current.startRecording(
        (state) => {
          console.log('📊 Recording state update:', state)
          setRecordingState(prev => ({ ...prev, ...state }))
        },
        (transcript) => {
          console.log('📝 Transcript update:', transcript)
          setRecordingState(prev => ({ ...prev, transcript }))
        }
      )
      
      console.log('✅ Voice recording started successfully')
    } catch (error) {
      console.error('❌ Error starting recording:', error)
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Failed to start recording. Please check microphone permissions.' 
      }))
      
      // Clean up on error
      if (voiceRecorderRef.current) {
        await voiceRecorderRef.current.cleanup()
        voiceRecorderRef.current = null
      }
    }
  }

  const handleManualTranscriptSubmit = () => {
    if (manualTranscript.trim()) {
      onTranscriptionComplete(manualTranscript.trim())
      setManualTranscript('')
      setShowManualInput(false)
      showSuccessToast.voiceNoteSaved()
    }
  }

  const handleStopRecording = async () => {
    console.log('🛑 handleStopRecording called')
    console.log('🛑 onTranscriptionComplete callback exists:', typeof onTranscriptionComplete === 'function')
    
    if (!voiceRecorderRef.current) return

    try {
      console.log('🛑 Stopping voice recording...')
      setRecordingState(prev => ({ ...prev, isProcessing: true }))
      
      const { audioBlob, transcript, duration } = await voiceRecorderRef.current.stopRecording()
      
      console.log('🎯 Voice recording completed:', {
        transcript,
        duration,
        audioSize: audioBlob.size,
        hasTranscript: !!transcript
      })

      // Create voice note
      const voiceNote = {
        id: Date.now().toString(),
        audioBlob,
        transcript,
        duration,
        createdAt: new Date(),
        contactId: 'temp'
      }

      // Call callbacks with the transcript
      if (transcript && transcript !== 'No transcript available') {
        console.log('📝 Saving transcript to notes:', transcript)
        console.log('🎯 Calling onTranscriptionComplete callback...')
        
        setIsSendingTranscript(true)
        
        // Only send the final transcript, not intermediate ones
        const finalTranscript = transcript.trim()
        if (finalTranscript.length > 0) {
          console.log('🎯 Final transcript to send:', finalTranscript)
          // Call the callback immediately without delay
          try {
            onTranscriptionComplete(finalTranscript)
            console.log('✅ onTranscriptionComplete callback executed successfully')
          } catch (error) {
            console.error('❌ Error in onTranscriptionComplete callback:', error)
          } finally {
            setIsSendingTranscript(false)
          }
        } else {
          console.warn('⚠️ Empty transcript, not sending')
          setIsSendingTranscript(false)
        }
      } else if (recordingState.transcript && recordingState.transcript.trim().length > 0) {
        // If no transcript from stopRecording, try to use the current transcript from state
        console.log('📝 Using current transcript from state:', recordingState.transcript)
        console.log('🎯 Calling onTranscriptionComplete callback with state transcript...')
        
        setIsSendingTranscript(true)
        
        const stateTranscript = recordingState.transcript.trim()
        try {
          onTranscriptionComplete(stateTranscript)
          console.log('✅ onTranscriptionComplete callback executed successfully with state transcript')
        } catch (error) {
          console.error('❌ Error in onTranscriptionComplete callback:', error)
        } finally {
          setIsSendingTranscript(false)
        }
      } else {
        console.warn('⚠️ No transcript available, offering manual input')
        // Show manual input option if no transcript
        setShowManualInput(true)
        setManualTranscript('')
      }

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
      await voiceRecorderRef.current.cleanup()
      voiceRecorderRef.current = null
      
      console.log('✅ Voice recording cleanup completed')

    } catch (error) {
      console.error('❌ Error stopping recording:', error)
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false,
        error: 'Failed to process recording. Please try again.' 
      }))
      
      // Clean up on error
      if (voiceRecorderRef.current) {
        await voiceRecorderRef.current.cleanup()
        voiceRecorderRef.current = null
      }
    }
  }

  const handleCancelRecording = async () => {
    // Save any existing transcript before canceling
    if (recordingState.transcript && recordingState.transcript.trim().length > 0) {
      console.log('📝 Saving transcript before canceling:', recordingState.transcript)
      try {
        onTranscriptionComplete(recordingState.transcript.trim())
        console.log('✅ Transcript saved before canceling')
      } catch (error) {
        console.error('❌ Error saving transcript before canceling:', error)
      }
    }
    
    if (voiceRecorderRef.current) {
      await voiceRecorderRef.current.cleanup()
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
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Voice recording not supported</span>
            </div>
            
            <div className="text-xs text-orange-600 space-y-1">
              <p><strong>Browser Compatibility:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>MediaRecorder: {compatibilityInfo.mediaRecorder ? '✅' : '❌'}</li>
                <li>Microphone Access: {compatibilityInfo.getUserMedia ? '✅' : '❌'}</li>
                <li>Speech Recognition: {compatibilityInfo.speechRecognition ? '✅' : '❌'}</li>
                <li>Audio Processing: {compatibilityInfo.audioContext ? '✅' : '❌'}</li>
              </ul>
            </div>

            <div className="text-xs text-orange-600">
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border-blue-200", className)}>
      <CardContent 
        className="p-4"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
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
              <Button 
                onClick={() => setRecordingState(prev => ({ ...prev, error: null }))}
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}

          {/* Manual Transcript Input */}
          {showManualInput && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2 mb-3">
                <Edit3 className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Manual Transcript Input
                </span>
              </div>
              <p className="text-xs text-yellow-700 mb-3">
                Speech recognition didn't capture the transcript. Please type what was said:
              </p>
              <div className="space-y-2">
                <Input
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                  placeholder="Type the transcript here..."
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleManualTranscriptSubmit()
                    }}
                    size="sm"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    Save Transcript
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowManualInput(false)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
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
                {isSendingTranscript && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-700">
                      Sending to notes...
                    </span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex space-x-2">
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleStopRecording()
                  }}
                  disabled={recordingState.isProcessing}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCancelRecording()
                  }}
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleStartRecording()
                }}
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
        </div>
      </CardContent>
    </Card>
  )
} 