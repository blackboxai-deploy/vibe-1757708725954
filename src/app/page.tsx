"use client";

import { useState } from "react";
import ImageGenerator from "@/components/ImageGenerator";
import ImageGallery from "@/components/ImageGallery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function HomePage() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageGenerated = (imageUrl: string, prompt: string) => {
    const newImage: GeneratedImage = {
      id: crypto.randomUUID(),
      url: imageUrl,
      prompt: prompt,
      timestamp: Date.now(),
    };
    
    setGeneratedImages(prev => [newImage, ...prev]);
    
    // LocalStorage'a kaydet
    const existingImages = JSON.parse(localStorage.getItem('ai-generated-images') || '[]');
    const updatedImages = [newImage, ...existingImages];
    localStorage.setItem('ai-generated-images', JSON.stringify(updatedImages.slice(0, 50))); // Son 50 görseli tut
  };

  const handleGenerationStart = () => {
    setIsGenerating(true);
  };

  const handleGenerationEnd = () => {
    setIsGenerating(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          AI Görsel Üretici
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Gelişmiş yapay zeka teknolojisi ile hayal ettiğiniz görselleri ücretsiz oluşturun
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel - Image Generator */}
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
                🎨 Görsel Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGenerator
                onImageGenerated={handleImageGenerated}
                onGenerationStart={handleGenerationStart}
                onGenerationEnd={handleGenerationEnd}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sağ Panel - Gallery */}
        <div className="lg:col-span-1">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                🖼️ Galeri
                {generatedImages.length > 0 && (
                  <span className="text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                    {generatedImages.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery images={generatedImages} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-12 text-center">
        <Separator className="mb-6" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Güçlü AI teknolojisi ile desteklenen ücretsiz görsel üretim platformu
        </p>
      </div>
    </div>
  );
}