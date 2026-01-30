/**
 * Service API pour communiquer avec le backend Flask
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Message {
  id: number;
  conversation_id: number;
  contenu: string;
  type: 'user' | 'ai' | 'system';
  date_creation: string;
}

export interface Conversation {
  id: number;
  titre: string;
  date_creation: string;
  date_modification: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  conversation?: Conversation;
}

export interface BDDFile {
  id: number;
  nom_fichier: string;
  date_upload: string;
  taille: number;
}

export interface BDDFilesResponse {
  success: boolean;
  fichiers: BDDFile[];
}

/**
 * Vérifier l'état du serveur
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

/**
 * Envoyer un message texte avec conversation_id
 */
export async function sendTextMessage(message: string, conversationId: number, type: string = 'user'): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversation_id: conversationId, type }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending text message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Envoyer un fichier audio pour transcription et traitement avec conversation_id
 */
export async function sendAudioMessage(audioBlob: Blob, conversationId: number): Promise<ApiResponse<Message>> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('conversation_id', conversationId.toString());

    const response = await fetch(`${API_BASE_URL}/api/message`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending audio message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupérer tous les messages
 */
export async function getMessages(): Promise<MessagesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      messages: [],
    };
  }
}

/**
 * Envoyer un message depuis le modèle IA
 */
export async function sendFromModel(message: string): Promise<ApiResponse<Message>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send-from-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending from model:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Upload un fichier SQL
 */
export async function uploadSQLFile(file: File): Promise<ApiResponse<BDDFile>> {
  try {
    console.log('[API] uploadSQLFile - Debut:', file.name);
    console.log('[API] API_BASE_URL:', API_BASE_URL);
    
    const formData = new FormData();
    formData.append('file', file);
    console.log('[API] FormData créé avec le fichier');

    const url = `${API_BASE_URL}/api/upload-sql`;
    console.log('[API] URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);

    const data = await response.json();
    console.log('[API] Response data:', data);
    
    if (!response.ok) {
      console.error('[API] Erreur HTTP:', response.status, data);
      return {
        success: false,
        error: data.error || `Erreur HTTP ${response.status}`,
      };
    }
    
    return data;
  } catch (error) {
    console.error('[API] Exception lors upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupérer la liste des fichiers SQL uploadés
 */
export async function getBDDFiles(): Promise<BDDFilesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bdd/files`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching BDD files:', error);
    return {
      success: false,
      fichiers: [],
    };
  }
}

/**
 * Hook pour enregistrer l'audio
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No media recorder'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioChunks = [];
        
        // Arrêter tous les tracks du stream
        this.mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

/**
 * Récupérer toutes les conversations
 */
export async function getConversations(): Promise<ConversationsResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      success: false,
      conversations: [],
    };
  }
}

/**
 * Créer une nouvelle conversation
 */
export async function createConversation(titre: string): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titre }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Récupérer une conversation avec ses messages
 */
export async function getConversation(conversationId: number): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Mettre à jour le titre d'une conversation
 */
export async function updateConversation(conversationId: number, titre: string): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ titre }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Supprimer une conversation
 */
export async function deleteConversation(conversationId: number): Promise<ApiResponse<Conversation>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
