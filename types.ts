
export interface PromptItem {
  id: string;
  imageURL: string;
  promptText: string;
  modelName: string;
  author: string;
  tags: string[];
  aspectRatio: 'square' | 'portrait' | 'landscape';
}

export type Category = string;

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}
