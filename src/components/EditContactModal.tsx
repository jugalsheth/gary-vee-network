'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
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
import { User, Mail, Phone, MapPin, Heart, Baby, Tag, FileText } from 'lucide-react'

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
}

export function EditContactModal({ open, onOpenChange, contact, onUpdate }: EditContactModalProps) {
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

  // Update form when contact changes
  React.useEffect(() => {
    if (contact) {
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
        notes: contact.notes || '',
      })
    }
  }, [contact, form])

  React.useEffect(() => {
    console.log('EditContactModal received contact:', contact);
    console.log('Contact ID:', contact?.id);
  }, [contact]);

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Contact: {contact.name}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input type="email" placeholder="email@example.com" {...field} />
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
                        <Input placeholder="+1 555-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="relationshipToGary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Gary *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Business Partner, Friend, Mentor" {...field} />
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
                        <Input placeholder="City, State/Country" {...field} />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hasKids"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
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
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
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
                      <Input placeholder="Marketing, Startups, Wine, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about this contact..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Update Contact
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 