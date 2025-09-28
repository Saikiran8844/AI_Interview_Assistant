import React, { useState } from 'react';
import { User, Mail, Phone, ArrowRight, Loader2 } from 'lucide-react';

interface InfoCollectionProps {
  missingFields: string[];
  currentInfo: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onInfoSubmit: (info: { name: string; email: string; phone: string }) => void;
  isGeneratingQuestions?: boolean;
}

const InfoCollection: React.FC<InfoCollectionProps> = ({
  missingFields,
  currentInfo,
  onInfoSubmit,
  isGeneratingQuestions = false,
}) => {
  const [formData, setFormData] = useState({
    name: currentInfo.name || '',
    email: currentInfo.email || '',
    phone: currentInfo.phone || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        return value.length < 2 ? 'Name must be at least 2 characters long' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return !phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) 
          ? 'Please enter a valid phone number' : '';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGeneratingQuestions) return;
    
    const newErrors: { [key: string]: string } = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onInfoSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'name':
        return <User className="w-5 h-5 text-gray-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-gray-400" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Complete Your Information
        </h2>
        <p className="text-gray-600">
          We need a few more details before we can start your interview.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(['name', 'email', 'phone'] as const).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.charAt(0).toUpperCase() + field.slice(1)}
              {missingFields.includes(field) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getFieldIcon(field)}
              </div>
              <input
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                value={formData[field]}
                onChange={(e) => handleInputChange(field, e.target.value)}
                disabled={isGeneratingQuestions}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors[field] 
                    ? 'border-red-500 bg-red-50' 
                    : missingFields.includes(field)
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-300'
                } ${isGeneratingQuestions ? 'opacity-50 cursor-not-allowed' : ''}`}
                }`}
                placeholder={
                  field === 'name' ? 'Enter your full name' :
                  field === 'email' ? 'Enter your email address' :
                  'Enter your phone number'
                }
              />
            </div>
            {errors[field] && (
              <p className="text-red-600 text-sm mt-1">{errors[field]}</p>
            )}
            {!missingFields.includes(field) && formData[field] && (
              <p className="text-green-600 text-sm mt-1">
                ✓ Already extracted from resume
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isGeneratingQuestions}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
            isGeneratingQuestions
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isGeneratingQuestions ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              Start Interview
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>What to expect:</strong> You'll have 6 questions total - 2 easy (20s each), 
          2 medium (60s each), and 2 hard (120s each). Answer as completely as you can within the time limit.
        </p>
      </div>
    </div>
  );
};

export default InfoCollection;