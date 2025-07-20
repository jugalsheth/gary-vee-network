'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { extractTextFromImage, validateImageFile, type ExtractedData, type OCRResult } from '@/lib/ocr'
import { Upload, X, FileImage, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'

interface ImageUploadProps {
  onDataExtracted: (data: ExtractedData) => void
  onError: (error: string) => void
}

export function ImageUpload({ onDataExtracted, onError }: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([])
  const [processingFile, setProcessingFile] = React.useState<File | null>(null)
  const [processingProgress, setProcessingProgress] = React.useState(0)
  const [ocrResults, setOcrResults] = React.useState<OCRResult[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      const validation = validateImageFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      onError(errors.join('\n'))
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles.slice(0, 3 - prev.length)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setOcrResults(prev => prev.filter((_, i) => i !== index))
  }

  const processImages = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setProcessingProgress(0)

    const results: OCRResult[] = []

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i]
      setProcessingFile(file)
      setProcessingProgress((i / uploadedFiles.length) * 100)

      try {
        const result = await extractTextFromImage(file)
        results.push(result)

        if (result.success && result.data) {
          // Use the first successful result
          onDataExtracted(result.data)
          break
        }
      } catch (error) {
        console.error('OCR processing error:', error)
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Processing failed'
        })
      }
    }

    setOcrResults(results)
    setIsProcessing(false)
    setProcessingFile(null)
    setProcessingProgress(100)

    // Check if any processing was successful
    const successfulResults = results.filter(r => r.success)
    if (successfulResults.length === 0) {
      onError('Could not extract text from any uploaded images. Please try with a clearer image.')
    }
  }

  const getFilePreview = (file: File) => {
    return URL.createObjectURL(file)
  }

  React.useEffect(() => {
    return () => {
      // Clean up object URLs
      uploadedFiles.forEach(file => {
        URL.revokeObjectURL(getFilePreview(file))
      })
    }
  }, [uploadedFiles])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        <CardContent className="p-6">
          <div
            className="flex flex-col items-center justify-center space-y-4 text-center"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Upload Instagram Screenshot
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag & drop or click to upload profile screenshots
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports JPG, PNG, WebP, HEIC (max 10MB)
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="mt-2"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Uploaded Images ({uploadedFiles.length}/3)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-3">
                  <div className="relative">
                    <img
                      src={getFilePreview(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Processing {processingFile?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Extracting text with OCR...
                </p>
                <Progress value={processingProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OCR Results */}
      {ocrResults.length > 0 && !isProcessing && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            Processing Results
          </h4>
          {ocrResults.map((result, index) => (
            <Card key={index} className={`${
              result.success 
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20' 
                : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {uploadedFiles[index]?.name}
                      </span>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                      {result.confidence && (
                        <Badge variant="outline">
                          {Math.round(result.confidence)}% confidence
                        </Badge>
                      )}
                    </div>
                    {result.success && result.data && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {result.data.name && <p><strong>Name:</strong> {result.data.name}</p>}
                        {result.data.email && <p><strong>Email:</strong> {result.data.email}</p>}
                        {result.data.location && <p><strong>Location:</strong> {result.data.location}</p>}
                        {result.data.bio && <p><strong>Bio:</strong> {result.data.bio.substring(0, 100)}...</p>}
                      </div>
                    )}
                    {result.error && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && !isProcessing && (
        <div className="flex gap-2">
          <Button
            onClick={processImages}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Extract Contact Data
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setUploadedFiles([])
              setOcrResults([])
            }}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  )
} 