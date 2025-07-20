'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Download,
  Users,
  MapPin,
  Mail,
  Phone,
  User,
  Heart,
  Home,
  Tag,
  FileEdit
} from 'lucide-react'
import type { Contact } from '@/lib/types'
import type { 
  ImportResult, 
  ImportError, 
  DuplicateContact, 
  FieldMapping 
} from '@/lib/importExport'
import { 
  parseCSVFile, 
  validateContactData, 
  convertCSVToContacts, 
  detectDuplicates, 
  autoDetectFieldMapping 
} from '@/lib/importExport'

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (contacts: Contact[]) => void
  existingContacts: Contact[]
}

interface ImportStep {
  step: 'upload' | 'mapping' | 'validation' | 'preview' | 'complete'
  data?: any[]
  headers?: string[]
  fieldMapping?: FieldMapping
  errors?: ImportError[]
  duplicates?: DuplicateContact[]
  validContacts?: Partial<Contact>[]
}

export function ImportModal({ open, onOpenChange, onImport, existingContacts }: ImportModalProps) {
  const [currentStep, setCurrentStep] = React.useState<ImportStep>({ step: 'upload' })
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [duplicateResolution, setDuplicateResolution] = React.useState<Record<number, 'skip' | 'update' | 'create'>>({})
  const [importResult, setImportResult] = React.useState<ImportResult | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsProcessing(true)

    try {
      const { data, headers } = await parseCSVFile(file)
      const autoMapping = autoDetectFieldMapping(headers)
      
      setCurrentStep({
        step: 'mapping',
        data,
        headers,
        fieldMapping: autoMapping
      })
    } catch (error) {
      console.error('File parsing error:', error)
      alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFieldMappingChange = (field: keyof FieldMapping, value: string) => {
    if (!currentStep.fieldMapping) return

    setCurrentStep({
      ...currentStep,
      fieldMapping: {
        ...currentStep.fieldMapping,
        [field]: value
      }
    })
  }

  const handleContinueToValidation = () => {
    if (!currentStep.data || !currentStep.fieldMapping) return

    setIsProcessing(true)

    try {
      // Convert and validate data
      const contacts = convertCSVToContacts(currentStep.data, currentStep.fieldMapping)
      const errors: ImportError[] = []
      
      contacts.forEach((contact, index) => {
        const rowErrors = validateContactData(contact, index + 1)
        errors.push(...rowErrors)
      })

      // Detect duplicates
      const duplicates = detectDuplicates(contacts, existingContacts)

      // Filter out contacts with errors
      const validContacts = contacts.filter((_, index) => 
        !errors.some(error => error.row === index + 1)
      )

      setCurrentStep({
        step: 'validation',
        data: currentStep.data,
        headers: currentStep.headers,
        fieldMapping: currentStep.fieldMapping,
        errors,
        duplicates,
        validContacts
      })
    } catch (error) {
      console.error('Validation error:', error)
      alert(`Error during validation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleContinueToPreview = () => {
    if (!currentStep.validContacts) return

    setCurrentStep({
      ...currentStep,
      step: 'preview'
    })
  }

  const handleDuplicateResolution = (row: number, action: 'skip' | 'update' | 'create') => {
    setDuplicateResolution(prev => ({
      ...prev,
      [row]: action
    }))
  }

  const handleImport = () => {
    if (!currentStep.validContacts) return

    setIsProcessing(true)

    try {
      const contactsToImport: Contact[] = []
      let imported = 0
      let skipped = 0

      currentStep.validContacts.forEach((contact, index) => {
        const row = index + 1
        const duplicate = currentStep.duplicates?.find(d => d.row === row)
        
        if (duplicate) {
          const resolution = duplicateResolution[row] || 'skip'
          
          switch (resolution) {
            case 'skip':
              skipped++
              break
            case 'update':
              // Update existing contact
              const updatedContact: Contact = {
                ...duplicate.existingContact,
                ...contact,
                updatedAt: new Date()
              }
              contactsToImport.push(updatedContact)
              imported++
              break
            case 'create':
              // Create new contact with unique ID
              const newContact: Contact = {
                ...contact as Contact,
                id: `import-${Date.now()}-${index}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                addedBy: 'import'
              }
              contactsToImport.push(newContact)
              imported++
              break
          }
        } else {
          // No duplicate, create new contact
          const newContact: Contact = {
            ...contact as Contact,
            id: `import-${Date.now()}-${index}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            addedBy: 'import'
          }
          contactsToImport.push(newContact)
          imported++
        }
      })

      // Import contacts
      onImport(contactsToImport)

      const result: ImportResult = {
        success: true,
        imported,
        skipped,
        errors: currentStep.errors || [],
        duplicates: currentStep.duplicates || []
      }

      setImportResult(result)
      setCurrentStep({ step: 'complete' })
    } catch (error) {
      console.error('Import error:', error)
      alert(`Error during import: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setCurrentStep({ step: 'upload' })
    setSelectedFile(null)
    setDuplicateResolution({})
    setImportResult(null)
  }

  const getFieldIcon = (field: keyof FieldMapping) => {
    switch (field) {
      case 'name': return <User className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      case 'tier': return <Users className="w-4 h-4" />
      case 'relationshipToGary': return <Heart className="w-4 h-4" />
      case 'hasKids': return <Users className="w-4 h-4" />
      case 'isMarried': return <Heart className="w-4 h-4" />
      case 'location': return <MapPin className="w-4 h-4" />
      case 'interests': return <Tag className="w-4 h-4" />
      case 'notes': return <FileEdit className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getFieldLabel = (field: keyof FieldMapping) => {
    switch (field) {
      case 'name': return 'Name'
      case 'email': return 'Email'
      case 'phone': return 'Phone'
      case 'tier': return 'Tier'
      case 'relationshipToGary': return 'Relationship to Gary'
      case 'hasKids': return 'Has Kids'
      case 'isMarried': return 'Is Married'
      case 'location': return 'Location'
      case 'interests': return 'Interests'
      case 'notes': return 'Notes'
      default: return field
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Contacts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {['upload', 'mapping', 'validation', 'preview', 'complete'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep.step === step 
                    ? 'bg-blue-500 text-white' 
                    : index < ['upload', 'mapping', 'validation', 'preview', 'complete'].indexOf(currentStep.step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    index < ['upload', 'mapping', 'validation', 'preview', 'complete'].indexOf(currentStep.step)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Upload Step */}
          {currentStep.step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Choose a CSV file to import</p>
                    <p className="text-sm text-gray-500">
                      Supported formats: CSV, Excel (.xlsx)
                    </p>
                    <Button variant="outline" className="mt-4">
                      Select File
                    </Button>
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Field Mapping Step */}
          {currentStep.step === 'mapping' && currentStep.headers && currentStep.fieldMapping && (
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Map CSV columns to contact fields</h3>
                <p className="text-sm text-gray-600">
                  Select which CSV column corresponds to each contact field. Required fields are marked with *.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentStep.fieldMapping).map(([field, value]) => (
                  <div key={field} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {getFieldIcon(field as keyof FieldMapping)}
                      {getFieldLabel(field as keyof FieldMapping)}
                      {['name', 'tier', 'relationshipToGary'].includes(field) && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Select value={value} onValueChange={(newValue) => handleFieldMappingChange(field as keyof FieldMapping, newValue)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {currentStep.headers?.map(header => (
                          <SelectItem key={header} value={header}>{header}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleContinueToValidation} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Continue to Validation'}
                </Button>
              </div>
            </div>
          )}

          {/* Validation Step */}
          {currentStep.step === 'validation' && (
            <div className="space-y-4">
              <Tabs defaultValue="errors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="errors">
                    Errors ({currentStep.errors?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="duplicates">
                    Duplicates ({currentStep.duplicates?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="preview">
                    Preview ({currentStep.validContacts?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="errors" className="space-y-4">
                  {currentStep.errors && currentStep.errors.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {currentStep.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="w-4 h-4" />
                          <AlertDescription>
                            Row {error.row}: {error.field} - {error.message}
                            {error.value && ` (Value: "${error.value}")`}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">No validation errors found!</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="duplicates" className="space-y-4">
                  {currentStep.duplicates && currentStep.duplicates.length > 0 ? (
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {currentStep.duplicates.map((duplicate, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="font-medium">Row {duplicate.row}</span>
                              <Badge variant="outline">
                                {duplicate.conflictType === 'email' ? 'Email Conflict' : 'Name Conflict'}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={duplicateResolution[duplicate.row] === 'skip' ? 'default' : 'outline'}
                                onClick={() => handleDuplicateResolution(duplicate.row, 'skip')}
                              >
                                Skip
                              </Button>
                              <Button
                                size="sm"
                                variant={duplicateResolution[duplicate.row] === 'update' ? 'default' : 'outline'}
                                onClick={() => handleDuplicateResolution(duplicate.row, 'update')}
                              >
                                Update
                              </Button>
                              <Button
                                size="sm"
                                variant={duplicateResolution[duplicate.row] === 'create' ? 'default' : 'outline'}
                                onClick={() => handleDuplicateResolution(duplicate.row, 'create')}
                              >
                                Create New
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-700">Existing Contact:</p>
                              <p>{duplicate.existingContact.name}</p>
                              <p className="text-gray-500">{duplicate.existingContact.email}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-700">New Contact:</p>
                              <p>{duplicate.newContact.name}</p>
                              <p className="text-gray-500">{duplicate.newContact.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">No duplicates found!</span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  {currentStep.validContacts && currentStep.validContacts.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {currentStep.validContacts.slice(0, 10).map((contact, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-gray-500">{contact.email}</p>
                            </div>
                            <Badge variant="outline">{contact.tier}</Badge>
                          </div>
                        </div>
                      ))}
                      {currentStep.validContacts.length > 10 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {currentStep.validContacts.length - 10} more contacts
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <span className="text-yellow-700">No valid contacts to import</span>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep({ ...currentStep, step: 'mapping' })}>
                  Back to Mapping
                </Button>
                <Button 
                  onClick={handleContinueToPreview} 
                  disabled={!currentStep.validContacts || currentStep.validContacts.length === 0}
                >
                  Continue to Preview
                </Button>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {currentStep.step === 'preview' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ready to Import</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{currentStep.validContacts?.length || 0}</p>
                    <p className="text-sm text-blue-700">Total Contacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {currentStep.validContacts?.filter((_, index) => {
                        const row = index + 1
                        const duplicate = currentStep.duplicates?.find(d => d.row === row)
                        if (!duplicate) return true
                        return duplicateResolution[row] !== 'skip'
                      }).length || 0}
                    </p>
                    <p className="text-sm text-green-700">Will Import</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {currentStep.duplicates?.filter(d => duplicateResolution[d.row] === 'skip').length || 0}
                    </p>
                    <p className="text-sm text-yellow-700">Will Skip</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{currentStep.errors?.length || 0}</p>
                    <p className="text-sm text-red-700">Errors</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep({ ...currentStep, step: 'validation' })}>
                  Back to Validation
                </Button>
                <Button onClick={handleImport} disabled={isProcessing}>
                  {isProcessing ? 'Importing...' : 'Import Contacts'}
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep.step === 'complete' && importResult && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-xl font-medium">Import Complete!</h3>
                <p className="text-gray-600">
                  Successfully imported {importResult.imported} contacts
                  {importResult.skipped > 0 && `, skipped ${importResult.skipped} duplicates`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-gray-600">Imported</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{importResult.skipped}</p>
                  <p className="text-sm text-gray-600">Skipped</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleReset}>
                  Import Another File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 