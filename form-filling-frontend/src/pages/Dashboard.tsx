import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { Form } from "../types";
import {
  Plus,
  Edit,
  ExternalLink,
  Calendar,
  Users,
  FileText,
  Copy,
  Check,
} from "lucide-react";
import Layout from "../components/Layout";

const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    if (!token) return;

    try {
      const response = await apiService.getForms(token);
      setForms(response.forms || []);
    } catch (error) {
      console.error("Failed to fetch forms:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyFormUrl = async (formId: string) => {
    const url = `${window.location.origin}/form/${formId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFormId(formId);
      setTimeout(() => setCopiedFormId(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your forms and collaborate in real-time
            </p>
          </div>
          <Link
            to="/forms/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No forms yet
            </h3>
            <p className="mt-1 text-gray-500">
              Get started by creating your first collaborative form.
            </p>
            <div className="mt-6">
              <Link
                to="/forms/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first form
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {form.title}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyFormUrl(form.id)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy form URL"
                      >
                        {copiedFormId === form.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        to={`/forms/${form.id}/edit`}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Edit form"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/form/${form.id}`}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Open form"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      Created {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-2" />
                      {form.accessEmails.length} collaborator
                      {form.accessEmails.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      {form.fields.length} field
                      {form.fields.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {form.submissions?.length || 0} submission
                        {(form.submissions?.length || 0) !== 1 ? "s" : ""}
                      </div>
                      <Link
                        to={`/form/${form.id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        Open Form
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
