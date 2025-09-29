import { Card, CardHeader, CardTitle } from '@components/ui/card';
import { ExtractDataFromUploadedFile, UploadFile } from '@integrations/Core';

export default function ResumeUpload({ onDataExtracted, onError }) {
  // ...existing state declarations...

  const handleFileUpload = async (file) => {
    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      onError('Please upload a PDF or Word document.');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      const extractResult = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Full name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' }
          }
        }
      });

      if (extractResult.status === 'success') {
        const data = { ...extractResult.output, resume_url: file_url };
        setExtractedData(data);
        
        // ...existing missing fields check...
      } else {
        onError('Could not extract data from resume. Please try again.');
      }
    } catch (error) {
      onError('Error uploading resume. Please try again.');
    }
    setIsUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleManualSubmit = () => {
    if (!extractedData) return;
    
    const completeData = {
      ...extractedData,
      ...manualData
    };
    
    if (!completeData.name || !completeData.email) {
      onError('Name and email are required fields.');
      return;
    }
    
    onDataExtracted(completeData);
  };

  const updateManualData = (field, value) => {
    setManualData(prev => ({ ...prev, [field]: value }));
  };

  if (missingFields.length > 0) {
    return (
      <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Complete Your Information
          </CardTitle>
          <p className="text-slate-600 mt-2">We need a few more details to continue</p>
        </CardHeader>
        {/* ...rest of the JSX remains the same but with proper quotes and brackets... */}
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
      {/* ...rest of the JSX remains the same but with proper quotes and brackets... */}
    </Card>
  );
}