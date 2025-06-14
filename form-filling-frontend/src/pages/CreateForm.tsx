import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FormField } from '../types';
import { Plus, Trash2, Save, ArrowLeft, Type, Hash, Mail, AlignLeft, List } from 'lucide-react';
import Layout from '../components/Layout';

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  email: Mail,
  textarea: AlignLeft,
  select: List,
};

const CreateForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [accessEmails, setAccessEmails] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const addField = () => {
    setFields([...fields, { label: '', type: 'text', required: false }]);
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    setAccessEmails([...accessEmails, '']);
  };

  const updateEmail = (index: number, email: string) => {
    const updatedEmails = [...accessEmails];
    updatedEmails[index] = email;
    setAccessEmails(updatedEmails);
  };

  const removeEmail = (index: number) => {
    setAccessEmails(accessEmails.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError('');
    setLoading(true);

    try {
      const validFields = fields.filter(field => field.label.trim());
      const validEmails = accessEmails.filter(email => email.trim());

      if (validFields.length === 0) {
        setError('Please add at least one field');
        return;
      }

      await apiService.createForm(token, {
        title,
        fields: validFields,
        accessEmails: validEmails,
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Form</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Form Details</h2>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Form Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter form title"
              />
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Form Fields</h2>
              <button
                type="button"
                onClick={addField}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const IconComponent = fieldTypeIcons[field.type];
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-2">
                        <IconComponent className="h-5 w-5 text-gray-400" />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Label
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(index, { label: e.target.value })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Field label"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateField(index, { type: e.target.value as FormField['type'] })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="textarea">Textarea</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => updateField(index, { required: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Required</span>
                          </label>
                          
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {field.type === 'number' && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Min Value
                          </label>
                          <input
                            type="number"
                            value={field.min || ''}
                            onChange={(e) => updateField(index, { min: parseInt(e.target.value) || undefined })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Minimum value"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Max Value
                          </label>
                          <input
                            type="number"
                            value={field.max || ''}
                            onChange={(e) => updateField(index, { max: parseInt(e.target.value) || undefined })}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Maximum value"
                          />
                        </div>
                      </div>
                    )}

                    {field.type === 'select' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Options (one per line)
                        </label>
                        <textarea
                          value={(field.options || []).join('\n')}
                          onChange={(e) => updateField(index, { options: e.target.value.split('\n').filter(opt => opt.trim()) })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          rows={3}
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Type className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">No fields added yet. Click "Add Field" to get started.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Collaborator Access</h2>
              <button
                type="button"
                onClick={addEmail}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Email
              </button>
            </div>

            <div className="space-y-3">
              {accessEmails.map((email, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="colleague@example.com"
                  />
                  {accessEmails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Create Form
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateForm;