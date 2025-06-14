import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { socketService } from '../services/socket';
import { FormField, FormAnswers, FieldLock } from '../types';
import { ArrowLeft, Send, Lock, Users, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

const FillForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [schema, setSchema] = useState<FormField[]>([]);
  const [answers, setAnswers] = useState<FormAnswers>({});
  const [locks, setLocks] = useState<FieldLock[]>([]);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !formId) return;

    const socket = socketService.connect(token);
    
    socketService.joinForm(formId, (data) => {
      setSchema(data.schema);
      setAnswers(data.answers);
      setLoading(false);
    });

    socketService.onFieldLocked((data) => {
      if (data.by && data.by !== user?.id) {
        setLocks(prev => [...prev.filter(l => l.field !== data.field), {
          field: data.field,
          userId: data.by,
          lockedAt: Date.now()
        }]);
      } else if (data.userId) {
        setLocks(prev => prev.filter(l => l.field !== data.field));
      }
    });

    socketService.onAnswerUpdated((data) => {
      setAnswers(prev => ({ ...prev, [data.field]: data.value }));
    });

    socketService.onFormSubmitted((data) => {
      if (data.userId === user?.id) {
        setSubmitted(true);
      }
    });

    socketService.onUserJoined((data) => {
      setActiveUsers(prev => [...new Set([...prev, data.userId])]);
    });

    socketService.onUserLeft((data) => {
      setActiveUsers(prev => prev.filter(id => id !== data.userId));
    });

    return () => {
      socketService.disconnect();
    };
  }, [token, formId, user?.id]);

  const isFieldLocked = (fieldLabel: string) => {
    const lock = locks.find(l => l.field === fieldLabel);
    return lock && lock.userId !== user?.id;
  };

  const handleFieldFocus = (fieldLabel: string) => {
    if (!formId || isFieldLocked(fieldLabel)) return;
    socketService.lockField(formId, fieldLabel);
  };

  const handleFieldChange = (fieldLabel: string, value: any) => {
    if (!formId || isFieldLocked(fieldLabel)) return;
    
    setAnswers(prev => ({ ...prev, [fieldLabel]: value }));
    socketService.updateAnswer(formId, fieldLabel, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;

    setSubmitting(true);
    socketService.submitForm(formId);
  };

  const renderField = (field: FormField) => {
    const value = answers[field.label] || '';
    const locked = isFieldLocked(field.label);
    
    const baseClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      locked ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300'
    }`;

    const fieldElement = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.label, e.target.value)}
              onFocus={() => handleFieldFocus(field.label)}
              disabled={locked}
              className={`${baseClasses} resize-none`}
              rows={4}
              required={field.required}
            />
          );
        
        case 'select':
          return (
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.label, e.target.value)}
              onFocus={() => handleFieldFocus(field.label)}
              disabled={locked}
              className={baseClasses}
              required={field.required}
            >
              <option value="">Select an option</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        
        case 'number':
          return (
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.label, parseFloat(e.target.value) || '')}
              onFocus={() => handleFieldFocus(field.label)}
              disabled={locked}
              min={field.min}
              max={field.max}
              className={baseClasses}
              required={field.required}
            />
          );
        
        default:
          return (
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.label, e.target.value)}
              onFocus={() => handleFieldFocus(field.label)}
              disabled={locked}
              className={baseClasses}
              required={field.required}
            />
          );
      }
    })();

    return (
      <div key={field.label} className="space-y-1">
        <label className="flex items-center text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
          {locked && (
            <div className="ml-2 flex items-center text-xs text-amber-600">
              <Lock className="h-3 w-3 mr-1" />
              Editing by another user
            </div>
          )}
        </label>
        {fieldElement}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Form Submitted!</h2>
          <p className="mt-2 text-gray-600">
            Thank you for your submission. Your responses have been recorded.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Fill Form</h1>
          </div>
          
          {activeUsers.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {schema.map(renderField)}
            
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default FillForm;