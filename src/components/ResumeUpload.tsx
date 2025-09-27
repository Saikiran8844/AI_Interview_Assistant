import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { extractResumeInfo } from '../utils/resumeParser';

interface ResumeUploadProps {
  onUploadSuccess: (file: File, extractedInfo: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      if (!file) return;

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or DOCX file only.');
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB.');
      }

      const extractedInfo = await extractResumeInfo(file);
      onUploadSuccess(file, extractedInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Your Interview
        </h2>
        <p className="text-lg text-gray-600">
          Let's start by uploading your resume. We'll extract your information and begin the interview process.
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={loading}
        />

        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}

          <div>
            <p className="text-xl font-semibold text-gray-700 mb-2">
              {loading ? 'Processing your resume...' : 'Upload your resume'}
            </p>
            <p className="text-gray-500">
              {loading 
                ? 'Please wait while we extract your information'
                : 'Drag and drop your file here, or click to browse'
              }
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              PDF, DOCX
            </span>
            <span>Max 10MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Upload Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">What happens next?</p>
            <ul className="text-blue-700 text-sm mt-1 space-y-1">
              <li>• We'll extract your name, email, and phone number</li>
              <li>• If any information is missing, we'll ask you to provide it</li>
              <li>• Then we'll start your timed technical interview</li>
              <li>• You'll answer 6 questions of increasing difficulty</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;