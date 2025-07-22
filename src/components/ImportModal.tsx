'use client'

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (count: number) => void;
}

export function ImportModal({ isOpen, onClose, onImportComplete }: ImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { id: 1, title: 'Upload File', description: 'Choose CSV file' },
    { id: 2, title: 'Preview Data', description: 'Review your data' },
    { id: 3, title: 'Map Fields', description: 'Match columns to fields' },
    { id: 4, title: 'Import', description: 'Save to database' },
    { id: 5, title: 'Complete', description: 'Import finished' }
  ];

  const dbFields = [
    { key: 'name', label: 'Name *', required: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'tier', label: 'Tier (tier1/tier2/tier3)' },
    { key: 'contactType', label: 'Contact Type' },
    { key: 'location', label: 'Location' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'instagram', label: 'Instagram Handle' },
    { key: 'instagramLink', label: 'Instagram Link' },
    { key: 'followerCount', label: 'Follower Count' },
    { key: 'biography', label: 'Biography' },
    { key: 'relationshipToGary', label: 'Relationship to Gary' },
    { key: 'notes', label: 'Notes' },
    { key: 'team', label: 'Team' },
    { key: 'skip', label: '— Skip this column —' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('📁 File selected:', file.name);
    }
  };

  const readFileAlternative = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleAnalyzeFile = async () => {
    if (!selectedFile) {
      console.error('❌ No file selected');
      alert('Please select a file first');
      return;
    }
    setIsProcessing(true);
    console.log('🔄 Starting CSV analysis...', selectedFile.name);
    console.log('📁 File size:', selectedFile.size, 'bytes');
    console.log('📁 File type:', selectedFile.type);
    try {
      // Step 1: Read file with detailed logging
      console.log('📖 Step 1: Reading file...');
      let text;
      try {
        text = await selectedFile.text();
      } catch (textError) {
        console.warn('⚠️ .text() method failed, trying FileReader...');
        text = await readFileAlternative(selectedFile);
      }
      console.log('✅ File read successfully, length:', text.length);
      console.log('📄 First 200 characters:', text.substring(0, 200));
      console.log('📄 Last 200 characters:', text.substring(text.length - 200));
      if (!text || text.length === 0) {
        throw new Error('File is empty or could not be read');
      }
      // Step 2: Import Papa Parse with error handling
      console.log('📦 Step 2: Importing Papa Parse...');
      let Papa;
      try {
        Papa = (await import('papaparse')).default;
        console.log('✅ Papa Parse imported successfully');
      } catch (importError) {
        console.error('❌ Failed to import Papa Parse:', importError);
        throw new Error('CSV parsing library not available');
      }
      // Step 3: Parse CSV with robust options
      console.log('🔧 Step 3: Parsing CSV...');
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings initially
        delimitersToGuess: [',', '\t', '|', ';'],
        encoding: 'UTF-8',
        transformHeader: (header) => {
          return header.trim().replace(/[^\w\s]/g, '');
        }
      });
      console.log('✅ CSV parsing completed');
      console.log('📊 Parse result summary:', {
        totalRows: result.data.length,
        headers: result.meta.fields,
        delimiter: result.meta.delimiter,
        errorCount: result.errors.length
      });
      if (result.errors.length > 0) {
        console.warn('⚠️ Parse warnings:', result.errors);
      }
      // Step 4: Validate parsed data
      console.log('🔍 Step 4: Validating data...');
      if (!result.data || result.data.length === 0) {
        throw new Error('No data rows found in CSV file');
      }
      if (!result.meta.fields || result.meta.fields.length === 0) {
        throw new Error('No column headers found in CSV file');
      }
      console.log('✅ Data validation passed');
      console.log('📋 Headers found:', result.meta.fields);
      console.log('📊 Sample data (first row):', result.data[0]);
      // Step 5: Auto-suggest field mappings
      console.log('🗺️ Step 5: Creating field mappings...');
      const autoMapping = {};
      result.meta.fields.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        if (lowerHeader.includes('name') && !lowerHeader.includes('user')) {
          autoMapping[header] = 'name';
        } else if (lowerHeader.includes('email')) {
          autoMapping[header] = 'email';
        } else if (lowerHeader.includes('phone')) {
          autoMapping[header] = 'phone';
        } else if (lowerHeader.includes('tier')) {
          autoMapping[header] = 'tier';
        } else if (lowerHeader.includes('location') || lowerHeader.includes('city')) {
          autoMapping[header] = 'location';
        } else if (lowerHeader.includes('instagram')) {
          autoMapping[header] = 'instagram';
        } else if (lowerHeader.includes('note')) {
          autoMapping[header] = 'notes';
        } else {
          autoMapping[header] = 'skip';
        }
      });
      console.log('🗺️ Auto-mapping created:', autoMapping);
      // Step 6: Set state and move to next step
      console.log('📝 Step 6: Updating state...');
      setPreviewData(result.data.slice(0, 10));
      setHeaders(result.meta.fields);
      setFieldMapping(autoMapping);
      console.log('🎯 Moving to step 2 (Data Preview)');
      setCurrentStep(2);
      console.log('✅ CSV analysis complete!');
    } catch (error) {
      console.error('❌ CSV analysis failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size
      });
      const errorMessage = error.message || 'Unknown error occurred';
      alert(`Failed to analyze CSV file: ${errorMessage}\n\nPlease check the browser console for detailed error information.`);
    } finally {
      setIsProcessing(false);
      console.log('🔄 CSV analysis process completed');
    }
  };

  const handleImportData = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setCurrentStep(4);
    console.log('🚀 Starting data import...');
    try {
      const text = await selectedFile.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      });
      const contacts = result.data
        .filter((row: any) => {
          const nameField = Object.keys(fieldMapping).find(key => fieldMapping[key] === 'name');
          return nameField && row[nameField];
        })
        .map((row: any, index: number) => {
          const contact: any = {};
          Object.entries(fieldMapping).forEach(([csvField, dbField]) => {
            if (dbField !== 'skip' && row[csvField]) {
              if (dbField === 'tier') {
                const tierValue = String(row[csvField]).toLowerCase();
                if (tierValue.includes('1') || tierValue === 'tier1') contact[dbField] = 'tier1';
                else if (tierValue.includes('2') || tierValue === 'tier2') contact[dbField] = 'tier2';
                else if (tierValue.includes('3') || tierValue === 'tier3') contact[dbField] = 'tier3';
                else contact[dbField] = 'tier3';
              } else if (dbField === 'followerCount') {
                contact[dbField] = parseInt(row[csvField]) || 0;
              } else {
                contact[dbField] = String(row[csvField]).trim();
              }
            }
          });
          if (!contact.tier) contact.tier = 'tier3';
          if (!contact.contactType) contact.contactType = 'business';
          if (!contact.team) contact.team = 'TeamG';
          return contact;
        });
      console.log('📊 Prepared', contacts.length, 'contacts for import');
      let imported = 0;
      const batchSize = 10;
      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);
        for (const contact of batch) {
          try {
            const response = await fetch('/api/contacts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(contact)
            });
            if (response.ok) {
              imported++;
              setImportProgress(Math.round((imported / contacts.length) * 100));
            } else {
              const error = await response.json();
              console.warn('⚠️ Failed to import contact:', contact.name, error);
            }
          } catch (error) {
            console.warn('⚠️ Import error for:', contact.name, error);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setImportResults({
        total: contacts.length,
        imported: imported,
        failed: contacts.length - imported
      });
      setCurrentStep(5);
      if (onImportComplete) {
        onImportComplete(imported);
      }
      console.log('✅ Import completed:', imported, 'contacts imported');
    } catch (error) {
      console.error('❌ Import failed:', error);
      alert('Import failed: ' + (error instanceof Error ? error.message : error));
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setPreviewData([]);
    setHeaders([]);
    setFieldMapping({});
    setImportProgress(0);
    setImportResults(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Contacts</DialogTitle>
        </DialogHeader>
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id < currentStep
                    ? 'bg-green-500 text-white'
                    : step.id === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-4" />
              )}
            </div>
          ))}
        </div>
        {/* Step 1: File Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Choose a CSV file to import</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="text-green-600 font-medium">
                      ✅ Selected: {selectedFile.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                    <div className="flex space-x-4 justify-center">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                      >
                        Change File
                      </Button>
                      <Button
                        onClick={handleAnalyzeFile}
                        disabled={isProcessing}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze File'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-lg">Drop your CSV file here or click to browse</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Data Preview */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Data Preview</h3>
              <div className="text-sm text-gray-600">
                {previewData.length} rows shown (first 10 of total)
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {headers.slice(0, 8).map((header, index) => (
                      <th key={index} className="text-left p-2 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index} className="border-b">
                      {headers.slice(0, 8).map((header, cellIndex) => (
                        <td key={cellIndex} className="p-2 truncate max-w-32">
                          {String(row[header] || '').substring(0, 50)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Continue to Mapping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        {/* Step 3: Field Mapping */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Map CSV columns to database fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {headers.map((header, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{header}</div>
                    <div className="text-xs text-gray-500 truncate">
                      Sample: {String(previewData[0]?.[header] || '').substring(0, 30)}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <select
                    value={fieldMapping[header] || 'skip'}
                    onChange={(e) => setFieldMapping(prev => ({
                      ...prev,
                      [header]: e.target.value
                    }))}
                    className="w-48 p-2 border rounded text-sm"
                  >
                    {dbFields.map(field => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleImportData}
                className="bg-green-500 hover:bg-green-600"
                disabled={!Object.values(fieldMapping).includes('name')}
              >
                Start Import
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {!Object.values(fieldMapping).includes('name') && (
              <div className="text-red-500 text-sm text-center">
                ⚠️ Please map at least one column to "Name" (required field)
              </div>
            )}
          </div>
        )}
        {/* Step 4: Import Progress */}
        {currentStep === 4 && (
          <div className="space-y-6 text-center">
            <h3 className="text-lg font-medium">Importing contacts...</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              ></div>
            </div>
            <div className="text-lg font-medium">{importProgress}% Complete</div>
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          </div>
        )}
        {/* Step 5: Complete */}
        {currentStep === 5 && importResults && (
          <div className="space-y-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-medium">Import Complete!</h3>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {importResults.imported}
                  </div>
                  <div className="text-sm text-gray-600">Imported</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">
                    {importResults.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {importResults.failed}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>
            </div>
            <Button
              onClick={handleClose}
              className="bg-green-500 hover:bg-green-600"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 