import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Volume2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration, formatDate, type VoiceNote } from '@/lib/voiceNotes'

interface VoiceNotePlayerProps {
  voiceNote: VoiceNote
  onDelete?: (voiceNoteId: string) => void
  className?: string
}

export function VoiceNotePlayer({ voiceNote, onDelete, className }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current
      
      const updateTime = () => setCurrentTime(audio.currentTime)
      const updateDuration = () => setDuration(audio.duration)
      const handleEnded = () => setIsPlaying(false)
      
      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      audio.addEventListener('ended', handleEnded)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
        audio.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    
    const newTime = parseFloat(event.target.value)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(voiceNote.id)
    }
  }

  return (
    <Card className={cn("border-blue-200 bg-blue-50", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Voice Note</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatDate(voiceNote.createdAt)}
              </span>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="space-y-2">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, #bfdbfe ${(currentTime / (duration || 1)) * 100}%, #bfdbfe 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatDuration(currentTime * 1000)}</span>
                <span>{formatDuration(duration * 1000)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={togglePlayback}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {formatDuration(voiceNote.duration)}
                </p>
                <p className="text-xs text-gray-500">
                  {voiceNote.transcript ? 'Transcription available' : 'No transcription'}
                </p>
              </div>
            </div>
          </div>

          {/* Transcript */}
          {voiceNote.transcript && (
            <div className="p-3 bg-white border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 font-medium mb-1">Transcript:</p>
              <p className="text-sm text-gray-700">{voiceNote.transcript}</p>
            </div>
          )}

          {/* Hidden Audio Element */}
          <audio
            ref={audioRef}
            src={URL.createObjectURL(voiceNote.audioBlob)}
            preload="metadata"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Custom slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`

// Add styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = sliderStyles
  document.head.appendChild(style)
} 