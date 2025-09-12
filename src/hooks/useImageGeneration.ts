"use client";

import { useState, useCallback } from 'react';

interface GenerateImageParams {
  prompt: string;
}

interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
  timestamp?: number;
}

interface UseImageGenerationReturn {
  generateImage: (params: GenerateImageParams) => Promise<GenerateImageResponse>;
  isGenerating: boolean;
  error: string | null;
  lastGeneratedImage: string | null;
}

export function useImageGeneration(): UseImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedImage, setLastGeneratedImage] = useState<string | null>(null);

  const generateImage = useCallback(async ({ prompt }: GenerateImageParams): Promise<GenerateImageResponse> => {
    if (!prompt.trim()) {
      const errorMsg = 'Prompt gereklidir';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP Error: ${response.status}`);
      }

      if (data.success && data.imageUrl) {
        setLastGeneratedImage(data.imageUrl);
        setError(null);
        
        return {
          success: true,
          imageUrl: data.imageUrl,
          prompt: data.prompt || prompt,
          timestamp: data.timestamp || Date.now()
        };
      } else {
        throw new Error(data.error || 'Geçersiz yanıt formatı');
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Görsel oluşturulamadı';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateImage,
    isGenerating,
    error,
    lastGeneratedImage
  };
}