'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { TIER_COLORS } from '@/lib/constants'
import type { Tier, Contact } from '@/lib/types'
import { saveContacts, getContacts } from '@/lib/storage'
import { Plus, Camera, FileText } from 'lucide-react'
import { ImageUpload } from './ImageUpload'
import { ExtractedDataPreview } from './ExtractedDataPreview'
import { ContactAvatar } from './ContactAvatar'
import { LoadingButton } from './LoadingButton'
import { SuccessButton } from './SuccessButton'
import { VoiceRecorder } from './VoiceRecorder'
import { showSuccessToast, showErrorToast } from '@/lib/toast'
import type { ExtractedData } from '@/lib/ocr'
import { generateUniqueId } from '@/lib/utils'

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  tier: z.enum(['tier1', 'tier2', 'tier3']),
  relationshipToGary: z.string().min(1, 'Relationship is required'),
  location: z.string().optional(),
  hasKids: z.boolean(), // not optional
  isMarried: z.boolean(), // not optional
  interests: z.string().optional(),
  notes: z.string().min(1, 'Notes are required'),
})

type ContactFormValues = z.infer<typeof ContactSchema>

interface AddContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (contact: Contact) => void
}

export function AddContactModal({ open, onOpenChange, onAdd }: AddContactModalProps) {
  const [entryMode, setEntryMode] = React.useState<'manual' | 'ocr'>('manual')
  const [extractedData, setExtractedData] = React.useState<ExtractedData | null>(null)
  const [showDataPreview, setShowDataPreview] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

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

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setEntryMode('manual')
    setExtractedData(null)
    setShowDataPreview(false)
    setError(null)
    setIsSubmitting(false)
    setIsSuccess(false)
  }

  const handleDataExtracted = (data: ExtractedData) => {
    setExtractedData(data)
    setShowDataPreview(true)
  }

  const handleApplyExtractedData = (data: ExtractedData) => {
    form.setValue('name', data.name || '')
    form.setValue('email', data.email || '')
    form.setValue('phone', data.phone || '')
    form.setValue('location', data.location || '')
    form.setValue('relationshipToGary', data.businessInfo || '')
    form.setValue('interests', data.interests?.join(', ') || '')
    form.setValue('notes', data.bio || '')
    
    setShowDataPreview(false)
    setEntryMode('manual')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setTimeout(() => setError(null), 5000)
  }

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true)
    setIsSuccess(false)
    
    try {
      // Simulate realistic save time
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const newContact: Contact = {
        id: generateUniqueId(),
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
        socialHandles: {},
        connections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        addedBy: 'gary',
      }
      
      const contacts = getContacts()
      saveContacts([newContact, ...contacts])
      onAdd(newContact)
      
      // Show success state
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Show success toast
      showSuccessToast.contactAdded(values.name)
      
      // Close modal after success animation
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      setIsSubmitting(false)
      showErrorToast.contactAddFailed()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
          </DialogHeader>

          {/* Entry Mode Selection */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={entryMode === 'manual' ? 'default' : 'outline'}
              onClick={() => setEntryMode('manual')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Manual Entry
            </Button>
            <Button
              type="button"
              variant={entryMode === 'ocr' ? 'default' : 'outline'}
              onClick={() => setEntryMode('ocr')}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Upload Screenshot
            </Button>
          </div>

          {/* Avatar Preview */}
          {(entryMode === 'manual' || showDataPreview) && form.watch('name') && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
              <ContactAvatar 
                name={form.watch('name')} 
                tier={form.watch('tier')} 
                size="lg" 
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {form.watch('name')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {form.watch('tier') === 'tier1' ? 'Tier 1 (Pink)' : 
                   form.watch('tier') === 'tier2' ? 'Tier 2 (Yellow)' : 'Tier 3 (Green)'}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* OCR Mode */}
          {entryMode === 'ocr' && !showDataPreview && (
            <ImageUpload
              onDataExtracted={handleDataExtracted}
              onError={handleError}
            />
          )}

          {/* Extracted Data Preview */}
          {showDataPreview && extractedData && (
            <ExtractedDataPreview
              data={extractedData}
              onApply={handleApplyExtractedData}
              onEdit={(field, value) => {
                setExtractedData(prev => prev ? { ...prev, [field]: value } : null)
              }}
              onCancel={() => {
                setShowDataPreview(false)
                setEntryMode('manual')
              }}
            />
          )}

          {/* Manual Entry Form */}
          {(entryMode === 'manual' || showDataPreview) && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input {...field} placeholder="Full name" />
                      {field.value && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Avatar:</span>
                          <ContactAvatar 
                            name={field.value} 
                            tier={form.watch('tier')} 
                            size="sm" 
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  {form.formState.errors.name && <span className="text-red-500 dark:text-red-400 text-xs transition-colors duration-300">{form.formState.errors.name.message}</span>}
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Email address" type="email" />
                  </FormControl>
                  {form.formState.errors.email && <span className="text-red-500 dark:text-red-400 text-xs transition-colors duration-300">{form.formState.errors.email.message}</span>}
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone number" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="tier" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tier *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(['tier1', 'tier2', 'tier3'] as Tier[]).map(tier => (
                          <SelectItem key={tier} value={tier} className="flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2`} style={{ background: TIER_COLORS[tier].primary }} />
                            {tier === 'tier1' ? 'Tier 1 (Pink)' : tier === 'tier2' ? 'Tier 2 (Yellow)' : 'Tier 3 (Green)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="relationshipToGary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to Gary *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Business Partner" />
                  </FormControl>
                  {form.formState.errors.relationshipToGary && <span className="text-red-500 dark:text-red-400 text-xs transition-colors duration-300">{form.formState.errors.relationshipToGary.message}</span>}
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="City, State" />
                  </FormControl>
                </FormItem>
              )} />
              <div className="flex gap-4">
                <FormField control={form.control} name="hasKids" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="accent-pink-500 w-4 h-4" />
                    </FormControl>
                    <FormLabel className="mb-0">Has Kids</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isMarried" render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} className="accent-pink-500 w-4 h-4" />
                    </FormControl>
                    <FormLabel className="mb-0">Is Married</FormLabel>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="interests" render={({ field }) => (
                <FormItem>
                  <FormLabel>Interests</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Comma separated (e.g. Marketing, Startups)" />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes *</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Add notes/context for this contact" rows={3} />
                  </FormControl>
                  {form.formState.errors.notes && <span className="text-red-500 text-xs">{form.formState.errors.notes.message}</span>}
                  <VoiceRecorder
                    onTranscriptionComplete={(text) => {
                      const currentNotes = field.value || ''
                      const separator = currentNotes ? '\n\n' : ''
                      field.onChange(currentNotes + separator + `🎤 Voice Note: ${text}`)
                    }}
                    className="mt-3"
                  />
                </FormItem>
              )} />
              <div className="flex justify-end">
                <SuccessButton 
                  type="submit" 
                  loading={isSubmitting}
                  success={isSuccess}
                  loadingText="Saving..."
                  successText="Saved!"
                  className="bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                >
                  Save Contact
                </SuccessButton>
              </div>
            </form>
          </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 