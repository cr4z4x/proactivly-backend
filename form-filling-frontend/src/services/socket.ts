import { io, Socket } from 'socket.io-client';
import { FormAnswers, FormField } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    this.socket = io('ws://localhost:3000/formanswer', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinForm(formId: string, callback: (data: { schema: FormField[], answers: FormAnswers, title?: string }) => void) {
    if (!this.socket) return;
    
    this.socket.emit('join-form', { formId });
    this.socket.on('form-init', callback);
  }

  lockField(formId: string, field: string) {
    if (!this.socket) return;
    
    this.socket.emit('lock-field', { formId, field });
  }

  updateAnswer(formId: string, field: string, value: any) {
    if (!this.socket) return;
    
    this.socket.emit('update-answer', { formId, field, value });
  }

  submitForm(formId: string) {
    if (!this.socket) return;
    
    this.socket.emit('submit-form', { formId });
  }

  onFieldLocked(callback: (data: { field: string, userId?: string, by?: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('field-locked', callback);
  }

  onAnswerUpdated(callback: (data: { field: string, value: any }) => void) {
    if (!this.socket) return;
    
    this.socket.on('update-answer', callback);
  }

  onFormSubmitted(callback: (data: { userId: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('submission-notification', callback);
  }

  onUserJoined(callback: (data: { userId: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('user-joined', callback);
  }

  onUserLeft(callback: (data: { userId: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('user-left', callback);
  }
}

export const socketService = new SocketService();