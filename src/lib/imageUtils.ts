/**
 * Image utility fonksiyonları
 */

export interface ImageData {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  size?: number;
  format?: string;
}

/**
 * Base64 string'ini blob'a çevirir
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Görsel URL'ini download için hazırlar
 */
export function prepareImageForDownload(imageUrl: string): { url: string; filename: string; cleanup?: () => void } {
  const timestamp = Date.now();
  const filename = `ai-image-${timestamp}.png`;
  
  if (imageUrl.startsWith('data:image')) {
    // Base64 data URL - direkt kullanılabilir
    return { url: imageUrl, filename };
  } else if (imageUrl.startsWith('http')) {
    // HTTP URL - fetch ile blob'a çevrilmesi gerekiyor
    return { url: imageUrl, filename };
  } else {
    // Base64 string - data URL'e çevir
    const dataUrl = `data:image/png;base64,${imageUrl}`;
    return { url: dataUrl, filename };
  }
}

/**
 * Görseli indir
 */
export async function downloadImage(imageUrl: string, filename?: string): Promise<void> {
  try {
    const downloadData = prepareImageForDownload(imageUrl);
    const finalFilename = filename || downloadData.filename;
    
    if (imageUrl.startsWith('data:image')) {
      // Base64 data URL - direkt indir
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // HTTP URL - fetch ile indir
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Görsel indirilemedi');
  }
}

/**
 * Görsel boyutunu hesapla (approximate)
 */
export function estimateImageSize(imageUrl: string): number {
  if (imageUrl.startsWith('data:image')) {
    // Base64 data URL - boyutu tahmin et
    const base64Length = imageUrl.split(',')[1]?.length || 0;
    return Math.round((base64Length * 3) / 4); // Base64 to bytes conversion
  }
  return 0; // HTTP URL için boyut bilinmiyor
}

/**
 * Görsel formatını belirle
 */
export function detectImageFormat(imageUrl: string): string {
  if (imageUrl.includes('data:image/jpeg') || imageUrl.includes('data:image/jpg')) {
    return 'JPEG';
  } else if (imageUrl.includes('data:image/png')) {
    return 'PNG';
  } else if (imageUrl.includes('data:image/webp')) {
    return 'WebP';
  } else if (imageUrl.includes('data:image/gif')) {
    return 'GIF';
  }
  return 'PNG'; // Default
}

/**
 * LocalStorage'da görsel verilerini yönet
 */
export const LocalStorageManager = {
  STORAGE_KEY: 'ai-generated-images',
  MAX_IMAGES: 50,
  
  /**
   * Görselleri localStorage'dan yükle
   */
  loadImages(): ImageData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('LocalStorage load error:', error);
      return [];
    }
  },
  
  /**
   * Görselleri localStorage'a kaydet
   */
  saveImages(images: ImageData[]): void {
    try {
      const limitedImages = images.slice(0, this.MAX_IMAGES);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedImages));
    } catch (error) {
      console.error('LocalStorage save error:', error);
      // Storage quota exceeded - eski görselleri temizle
      this.clearOldImages();
    }
  },
  
  /**
   * Yeni görsel ekle
   */
  addImage(imageData: ImageData): void {
    const existingImages = this.loadImages();
    const newImages = [imageData, ...existingImages].slice(0, this.MAX_IMAGES);
    this.saveImages(newImages);
  },
  
  /**
   * Görsel sil
   */
  removeImage(imageId: string): void {
    const existingImages = this.loadImages();
    const filteredImages = existingImages.filter(img => img.id !== imageId);
    this.saveImages(filteredImages);
  },
  
  /**
   * Eski görselleri temizle (storage quota için)
   */
  clearOldImages(): void {
    try {
      const images = this.loadImages();
      const recentImages = images.slice(0, Math.floor(this.MAX_IMAGES / 2));
      this.saveImages(recentImages);
    } catch (error) {
      console.error('Clear old images error:', error);
    }
  },
  
  /**
   * Tüm görselleri temizle
   */
  clearAll(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('LocalStorage clear error:', error);
    }
  }
};

/**
 * Görsel boyutunu format et (human readable)
 */
export function formatImageSize(bytes: number): string {
  if (bytes === 0) return 'Bilinmiyor';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Prompt'u temizle ve optimize et
 */
export function optimizePrompt(prompt: string): string {
  return prompt
    .trim()
    .replace(/\s+/g, ' ') // Çoklu boşlukları tek boşluk yap
    .replace(/[^\w\s.,!?-]/g, '') // Özel karakterleri temizle
    .slice(0, 500); // Max 500 karakter
}