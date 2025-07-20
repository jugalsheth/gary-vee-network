import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { VoiceRecorder } from './VoiceRecorder'
import { VoiceNotePlayer } from './VoiceNotePlayer'
import { showSuccessToast } from '@/lib/toast'
import { type VoiceNote } from '@/lib/voiceNotes'
import { Mic, Volume2, FileText, Database } from 'lucide-react'

export function VoiceNotesDemo() {
  const [demoTranscript, setDemoTranscript] = useState('')
  const [demoVoiceNote, setDemoVoiceNote] = useState<VoiceNote | null>(null)
  const [showStorageInfo, setShowStorageInfo] = useState(false)

  const handleTranscriptionComplete = (text: string) => {
    setDemoTranscript(text)
    showSuccessToast.voiceNoteSaved()
  }

  const handleAudioSaved = (audioBlob: Blob) => {
    const voiceNote: VoiceNote = {
      id: Date.now().toString(),
      audioBlob,
      transcript: demoTranscript,
      duration: 5000, // Demo duration
      createdAt: new Date(),
      contactId: 'demo',
      fileSize: audioBlob.size
    }
    setDemoVoiceNote(voiceNote)
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-blue-600" />
            Voice Notes Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recording Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">🎤 Record Voice Note</h3>
              <VoiceRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
                onAudioSaved={handleAudioSaved}
              />
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">📝 Results</h3>
              
              {/* Transcript Display */}
              {demoTranscript && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Final Transcript</span>
                    </div>
                    <p className="text-sm text-green-700">{demoTranscript}</p>
                  </CardContent>
                </Card>
              )}

              {/* Audio Player */}
              {demoVoiceNote && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">🎵 Audio Playback</h4>
                  <VoiceNotePlayer voiceNote={demoVoiceNote} />
                </div>
              )}
            </div>
          </div>

          {/* Storage Information */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowStorageInfo(!showStorageInfo)}
              className="w-full"
            >
              <Database className="w-4 h-4 mr-2" />
              {showStorageInfo ? 'Hide' : 'Show'} Storage Information
            </Button>

            {showStorageInfo && (
              <Card className="mt-4 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">💾 Storage Architecture</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-800">Current (MVP):</h5>
                      <ul className="list-disc list-inside text-blue-700 ml-4 space-y-1">
                        <li>Audio stored as Blob in localStorage</li>
                        <li>Transcription stored as text</li>
                        <li>Limited by browser storage (~5-10MB)</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-blue-800">Production (Snowflake):</h5>
                      <ul className="list-disc list-inside text-blue-700 ml-4 space-y-1">
                        <li>Audio converted to base64 and stored in Snowflake</li>
                        <li>Transcription stored as TEXT column</li>
                        <li>Unlimited storage capacity</li>
                        <li>Full-text search on transcripts</li>
                      </ul>
                    </div>

                    {demoVoiceNote && (
                      <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
                        <h5 className="font-medium text-blue-800 mb-2">Demo Voice Note Stats:</h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">File Size:</span>
                            <span className="ml-2 font-medium">
                              {(demoVoiceNote.fileSize! / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="ml-2 font-medium">
                              {(demoVoiceNote.duration / 1000).toFixed(1)}s
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Words:</span>
                            <span className="ml-2 font-medium">
                              {demoTranscript.split(' ').length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Characters:</span>
                            <span className="ml-2 font-medium">
                              {demoTranscript.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* How It Works */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3">🔧 How Voice Notes Work</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-orange-600" />
                    <span className="font-medium text-orange-800">1. Recording</span>
                  </div>
                  <p className="text-orange-700">
                    Web Speech API captures audio and converts speech to text in real-time
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">2. Transcription</span>
                  </div>
                  <p className="text-blue-700">
                    Speech recognition provides live transcript that appears as you speak
                  </p>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">3. Storage</span>
                  </div>
                  <p className="text-green-700">
                    Audio and transcript saved together for playback and search
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 