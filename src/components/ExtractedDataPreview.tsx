'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Edit3, User, Mail, MapPin, Globe, Building, Heart } from 'lucide-react'
import type { ExtractedData } from '@/lib/ocr'

interface ExtractedDataPreviewProps {
  data: ExtractedData
  onApply: (data: ExtractedData) => void
  onEdit: (field: keyof ExtractedData, value: string) => void
  onCancel: () => void
}

export function ExtractedDataPreview({ data, onApply, onEdit, onCancel }: ExtractedDataPreviewProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedData, setEditedData] = React.useState<ExtractedData>(data)

  React.useEffect(() => {
    setEditedData(data)
  }, [data])

  const handleEdit = (field: keyof ExtractedData, value: string) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApply = () => {
    onApply(editedData)
  }

  const handleCancel = () => {
    setEditedData(data)
    setIsEditing(false)
  }

  const renderField = (field: keyof ExtractedData, label: string, icon: React.ReactNode, type: 'text' | 'textarea' = 'text') => {
    const value = editedData[field] as string || ''
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </Label>
          {type === 'textarea' ? (
            <Textarea
              value={value}
              onChange={(e) => handleEdit(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="min-h-[80px]"
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => handleEdit(field, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
        </div>
      )
    }

    return (
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 text-gray-400 dark:text-gray-500 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100 break-words">
            {value || 'Not detected'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
              Extracted Contact Data
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
            AI Enhanced
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Review and edit the extracted information before adding to your network
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField('name', 'Name', <User className="w-4 h-4" />)}
          {renderField('email', 'Email', <Mail className="w-4 h-4" />)}
          {renderField('location', 'Location', <MapPin className="w-4 h-4" />)}
          {renderField('website', 'Website', <Globe className="w-4 h-4" />)}
        </div>

        {/* Business Information */}
        {renderField('businessInfo', 'Business Info', <Building className="w-4 h-4" />)}

        {/* Bio/Notes */}
        {renderField('bio', 'Bio/Notes', <User className="w-4 h-4" />, 'textarea')}

        {/* Interests */}
        {editedData.interests && editedData.interests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interests
              </Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {editedData.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Raw Text Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Raw Extracted Text
          </Label>
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap">
              {data.rawText}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isEditing ? (
            <>
              <Button onClick={handleApply} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Apply Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Data
              </Button>
              <Button onClick={handleApply} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Apply to Form
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 