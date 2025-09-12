"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

interface ImageGalleryProps {
  images: GeneratedImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [localImages, setLocalImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  // LocalStorage'dan görselleri yükle
  useEffect(() => {
    const stored = localStorage.getItem('ai-generated-images');
    if (stored) {
      try {
        const parsedImages = JSON.parse(stored);
        setLocalImages(parsedImages);
      } catch (error) {
        console.error('LocalStorage parse error:', error);
      }
    }
  }, []);

  // Yeni görsel eklendiğinde localStorage'ı güncelle
  useEffect(() => {
    if (images.length > 0) {
      const allImages = [...images, ...localImages];
      const uniqueImages = allImages.filter((image, index, self) => 
        index === self.findIndex(i => i.id === image.id)
      );
      setLocalImages(uniqueImages.slice(0, 50)); // Son 50 görseli tut
    }
  }, [images]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadImage = async (image: GeneratedImage) => {
    try {
      toast.loading("Görsel indiriliyor...");
      
      if (image.url.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `ai-image-${image.id}.png`;
        link.click();
      } else {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-image-${image.id}.png`;
        link.click();
        
        window.URL.revokeObjectURL(url);
      }
      
      toast.success("Görsel indirildi!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("İndirme sırasında hata oluştu");
    }
  };

  const clearGallery = () => {
    localStorage.removeItem('ai-generated-images');
    setLocalImages([]);
    setSelectedImage(null);
    toast.success("Galeri temizlendi!");
  };

  const deleteImage = (imageId: string) => {
    const updatedImages = localImages.filter(img => img.id !== imageId);
    setLocalImages(updatedImages);
    localStorage.setItem('ai-generated-images', JSON.stringify(updatedImages));
    
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
    
    toast.success("Görsel silindi!");
  };

  const allImages = [...images, ...localImages].filter((image, index, self) => 
    index === self.findIndex(i => i.id === image.id)
  );

  if (allImages.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">📸</div>
        <p className="text-sm">Henüz görsel oluşturulmadı</p>
        <p className="text-xs mt-1">Oluşturduğunuz görseller burada görünecek</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Galeri Header */}
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-xs">
          {allImages.length} görsel
        </Badge>
        {allImages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearGallery}
            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🗑️ Temizle
          </Button>
        )}
      </div>

      {/* Görsel Listesi */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          {allImages.map((image) => (
            <Card 
              key={image.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedImage?.id === image.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedImage(selectedImage?.id === image.id ? null : image)}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded border"
                      onError={(e) => {
                        console.error('Thumbnail load error:', e);
                        (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=ERROR';
                      }}
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDate(image.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Detay görünümü */}
                {selectedImage?.id === image.id && (
                  <div className="mt-4 pt-3 border-t space-y-3">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-auto rounded max-h-48 object-contain"
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                        className="flex-1 text-xs"
                      >
                        📥 İndir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                      "{image.prompt}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}