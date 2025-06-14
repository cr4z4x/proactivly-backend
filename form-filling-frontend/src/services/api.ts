const API_BASE_URL = 'http://localhost:3000'; // Update with your API URL

interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
}

class ApiService {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  async getMe(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return response.json();
  }

  async createForm(token: string, formData: {
    title: string;
    fields: any[];
    accessEmails: string[];
  }) {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Failed to create form');
    }

    return response.json();
  }

  async getForms(token: string) {
    const response = await fetch(`${API_BASE_URL}/forms`, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch forms');
    }

    return response.json();
  }

  async getForm(token: string, formId: string) {
    const response = await fetch(`${API_BASE_URL}/forms/${formId}`, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch form');
    }

    return response.json();
  }
}

export const apiService = new ApiService();