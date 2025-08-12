'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
// @ts-ignore: No type definitions for '@hookform/resolvers/zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { getTierBadge } from '@/lib/constants'
import type { Contact, Tier } from '@/lib/types'
import { User, Mail, Phone, MapPin, Heart, Baby, Tag, FileText, Mic } from 'lucide-react'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { toast } from 'sonner'

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  tier: z.enum(['tier1', 'tier2', 'tier3']),
  relationshipToGary: z.string().min(1, 'Relationship to Gary is required'),
  location: z.string().optional(),
  hasKids: z.boolean(),
  isMarried: z.boolean(),
  interests: z.string(),
  notes: z.string(),
})

type ContactFormValues = z.infer<typeof ContactSchema>

export interface EditContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
  onUpdate: (contactId: string, updates: Partial<Contact>) => void
  viewMode?: boolean
}

export function EditContactModal({ open, onOpenChange, contact, onUpdate, viewMode = false }: EditContactModalProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      tier: 'tier3',
      relationshipToGary: '',
      location: '',
      hasKids: false,
      isMarried: false,
      interests: '',
      notes: '',
    },
    mode: 'onChange',
  })

  const [isProcessingVoice, setIsProcessingVoice] = React.useState(false)
  const [notesUpdateTrigger, setNotesUpdateTrigger] = React.useState(0)
  const [notesValue, setNotesValue] = React.useState('')
  const [lastTranscription, setLastTranscription] = React.useState('')
  const [autoSaveVoiceNotes, setAutoSaveVoiceNotes] = React.useState(true)

  // Update form when contact changes
  React.useEffect(() => {
    if (contact) {
      const notes = contact.notes || ''
      setNotesValue(notes)
      form.reset({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        tier: contact.tier,
        relationshipToGary: contact.relationshipToGary,
        location: contact.location || '',
        hasKids: contact.hasKids,
        isMarried: contact.isMarried,
        interests: (contact.interests || []).join(', '),
        notes: notes,
      })
    }
  }, [contact, form])

  // Synchronize notesValue with form state
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'notes' && value.notes !== notesValue) {
        console.log('🔄 Form notes changed, updating notesValue:', value.notes)
        setNotesValue(value.notes || '')
      }
    })
    return () => subscription.unsubscribe()
  }, [form]) // Removed notesValue dependency to prevent infinite loop

  React.useEffect(() => {
    console.log('EditContactModal received contact:', contact);
    console.log('Contact ID:', contact?.id);
  }, [contact]);

  // Force re-render when notes are updated
  React.useEffect(() => {
    if (notesUpdateTrigger > 0) {
      console.log('🔄 Notes update trigger activated, forcing re-render')
      // Force a small delay to ensure the form state is updated
      setTimeout(() => {
        if (form && form.trigger) {
          form.trigger('notes')
        }
      }, 100)
    }
  }, [notesUpdateTrigger, form]) // Removed notesValue dependency

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  // Handle voice transcription completion
  const handleVoiceTranscription = (transcript: string) => {
    console.log('🎯 Voice transcription received:', transcript)
    console.log('🎯 Current notesValue:', notesValue)
    console.log('🎯 Form ready:', !!form && !!form.setValue)
    
    // Prevent duplicate processing
    if (lastTranscription === transcript) {
      console.log('🔄 Duplicate transcription detected, skipping')
      return
    }
    
    // Check if form is ready
    if (!form || !form.setValue) {
      console.error('❌ Form not ready for voice transcription')
      return
    }
    
    setIsProcessingVoice(true)
    setLastTranscription(transcript)
    
    try {
      const currentNotes = notesValue || ''
      const timestamp = new Date().toLocaleString()
      const voiceNoteEntry = `\n\n[Voice Note - ${timestamp}]:\n${transcript}`
      
      // Append the voice note to existing notes
      const updatedNotes = currentNotes + voiceNoteEntry
      console.log('📝 Updating notes field with:', updatedNotes)
      
      // Update both the form and the local state
      setNotesValue(updatedNotes)
      form.setValue('notes', updatedNotes, { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true 
      })
      
      // Force a re-render by triggering form validation and updating trigger
      form.trigger('notes')
      setNotesUpdateTrigger(prev => prev + 1)
      
      console.log('✅ Voice transcription processed successfully')
      setIsProcessingVoice(false)
      
      // Auto-save if enabled
      if (autoSaveVoiceNotes && contact) {
        console.log('🔄 Auto-saving contact with voice note...')
        try {
          const updatedContact = {
            ...contact,
            notes: updatedNotes,
            updatedAt: new Date()
          }
          onUpdate(contact.id, updatedContact)
          toast.success('Voice note saved automatically!')
        } catch (error) {
          console.error('❌ Auto-save failed:', error)
          toast.error('Auto-save failed. Please save manually.')
        }
      } else {
        // Show success message to user
        toast.success('Voice note added! Click "Update Contact" to save.')
      }
    } catch (error) {
      console.error('❌ Error processing voice transcription:', error)
      setIsProcessingVoice(false)
    }
  }

  // Handle clearing notes
  const handleClearNotes = () => {
    form.setValue('notes', '')
  }

  // Handle clearing only voice notes (remove lines starting with [Voice Note)
  const handleClearVoiceNotes = () => {
    const currentNotes = form.getValues('notes')
    const lines = currentNotes.split('\n')
    const filteredLines = lines.filter(line => !line.trim().startsWith('[Voice Note'))
    const cleanedNotes = filteredLines.join('\n').trim()
    form.setValue('notes', cleanedNotes)
  }

  const onSubmit = (values: ContactFormValues) => {
    if (!contact || !contact.id) {
      console.error('Contact or Contact ID is missing');
      return;
    }

    const updatedContact: Contact = {
      ...contact,
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      tier: values.tier,
      relationshipToGary: values.relationshipToGary,
      location: values.location || undefined,
      hasKids: values.hasKids,
      isMarried: values.isMarried,
      interests: values.interests ? values.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
      notes: values.notes,
      updatedAt: new Date(),
    }

    // CRITICAL: Pass contact.id and only the updated fields
    const updateFields = {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      tier: values.tier,
      relationshipToGary: values.relationshipToGary,
      location: values.location || undefined,
      hasKids: values.hasKids,
      isMarried: values.isMarried,
      interests: values.interests ? values.interests.split(',').map(i => i.trim()).filter(Boolean) : [],
      notes: values.notes,
      updatedAt: new Date(),
    };
    onUpdate(contact.id, updateFields);
    handleClose()
  }

  const getTierDescription = (tier: Tier) => {
    switch (tier) {
      case 'tier1': return 'Closest to Gary'
      case 'tier2': return 'Important contacts'
      case 'tier3': return 'General network'
      default: return ''
    }
  }

  if (!contact) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {viewMode ? 'Contact Details' : 'Edit Contact'}: {contact.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} readOnly={viewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tier *</FormLabel>
                                              <Select onValueChange={field.onChange} value={field.value} disabled={viewMode}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tier1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-pink-500 text-white">Tier 1</Badge>
                              <span>Closest to Gary</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="tier2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-yellow-500 text-white">Tier 2</Badge>
                              <span>Important contacts</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="tier3">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500 text-white">Tier 3</Badge>
                              <span>General network</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} readOnly={viewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-1234" {...field} readOnly={viewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="relationshipToGary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Gary *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business Partner, Friend, Mentor" {...field} readOnly={viewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="City, State/Country" {...field} readOnly={viewMode} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Details</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hasKids"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={viewMode ? undefined : field.onChange}
                          disabled={viewMode}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Baby className="w-4 h-4" />
                          Has Kids
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isMarried"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={viewMode ? undefined : field.onChange}
                          disabled={viewMode}
                        />
                      </FormControl>
                      <div className="space-y-0 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          Married
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Interests & Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      Interests (comma-separated)
                    </FormLabel>
                    <FormControl>
                                              <Input placeholder="Marketing, Startups, Wine, etc." {...field} readOnly={viewMode} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Voice Notes Section */}
              {!viewMode && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Voice Notes</h4>
                    {form.getValues('notes')?.includes('[Voice Note') && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        Voice notes present
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Record voice notes to quickly add meeting insights, follow-ups, or observations about this contact. 
                    Voice notes will be automatically appended to the notes field with timestamps.
                  </div>
                  <VoiceRecorder 
                    key={`voice-recorder-${notesValue?.length || 0}-${notesUpdateTrigger}`}
                    onTranscriptionComplete={handleVoiceTranscription}
                    existingNotes={notesValue}
                    className="border-blue-200 bg-blue-50/50"
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => {
                  console.log('📝 Notes field render - current value:', field.value)
                  return (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Notes
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes about this contact... Voice notes will be automatically appended here."
                          className="min-h-[120px]"
                          value={notesValue}
                          onChange={(e) => {
                            if (viewMode) return; // Prevent changes in view mode
                            const newValue = e.target.value
                            console.log('📝 Notes field onChange:', newValue)
                            setNotesValue(newValue)
                            field.onChange(e)
                          }}
                          onBlur={() => {
                            if (viewMode) return; // Prevent changes in view mode
                            // Ensure form state is synchronized on blur
                            if (form && form.setValue) {
                              form.setValue('notes', notesValue, { 
                                shouldValidate: true, 
                                shouldDirty: true,
                                shouldTouch: true 
                              })
                            }
                          }}
                          readOnly={viewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    
                    {/* Voice Processing Indicator */}
                    {isProcessingVoice && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-xs text-blue-700">
                            Processing voice transcription...
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Debug Info (remove in production) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="grid grid-cols-2 gap-2">
                            <div>Notes: {notesValue?.length || 0}</div>
                            <div>Trigger: {notesUpdateTrigger}</div>
                            <div>Form: {!!form && !!form.setValue ? 'Yes' : 'No'}</div>
                            <div>Processing: {isProcessingVoice ? 'Yes' : 'No'}</div>
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Last: {lastTranscription || 'None'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={autoSaveVoiceNotes}
                                onChange={(e) => setAutoSaveVoiceNotes(e.target.checked)}
                                className="w-3 h-3"
                              />
                              <span>Auto-save</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Notes Management Buttons */}
                    {!viewMode && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearVoiceNotes}
                          className="text-xs px-2 py-1"
                        >
                          Clear Voice
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClearNotes}
                          className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                        >
                          Clear All
                        </Button>
                        {process.env.NODE_ENV === 'development' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVoiceTranscription('Test transcription from button')}
                            className="text-xs bg-green-600 text-white hover:bg-green-700 px-2 py-1"
                          >
                            Test Trans
                          </Button>
                        )}
                        {process.env.NODE_ENV === 'development' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('🧪 Testing callback connection...')
                              console.log('✅ handleVoiceTranscription function exists:', typeof handleVoiceTranscription)
                              handleVoiceTranscription('Test callback connection')
                            }}
                            className="text-xs bg-purple-600 text-white hover:bg-purple-700 px-2 py-1"
                          >
                            Test Call
                          </Button>
                        )}
                        {process.env.NODE_ENV === 'development' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log('🧪 Testing modal close prevention...')
                              toast.success('Modal close prevention test - this should not close the modal')
                            }}
                            className="text-xs bg-orange-600 text-white hover:bg-orange-700 px-2 py-1"
                          >
                            Test Modal
                          </Button>
                        )}
                      </div>
                    )}
                  </FormItem>
                )
              }}
              />
            </div>

            {/* Current Tier Display */}
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
              <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-300">Current Contact Details</h4>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTierBadge(contact.tier)}>
                  {contact.tier === 'tier1' ? 'Tier 1' : contact.tier === 'tier2' ? 'Tier 2' : 'Tier 3'}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{getTierDescription(contact.tier)}</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                <p>Created: {new Date(contact.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(contact.updatedAt).toLocaleDateString()}</p>
                <p>Added by: {contact.createdBy}</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                {viewMode ? 'Close' : 'Cancel'}
              </Button>
              {!viewMode && (
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                  {lastTranscription ? '💾 Update Contact (Voice Note Added)' : 'Update Contact'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 