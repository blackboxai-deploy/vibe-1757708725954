"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GeneratingLoader from "./GeneratingLoader";
import { toast } from "sonner";

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  onGenerationStart: () => void;
  onGenerationEnd: () => void;
  isGenerating: boolean;
}

const PRESET_PROMPTS = [
  "Güzel doğa manzarası, dağlar ve göl",
  "Modern şehir manzarası, gece ışıkları",
  "Soyut sanat eseri, renkli ve dinamik",
  "Sevimli kediler, bahçede oynuyor",
  "Fantastik ejder, bulutların üzerinde uçuyor",
  "Minimalist iç mekan tasarımı",
  "Vintage arabalar, nostaljik sokak",
  "Uzay ve yıldızlar, galaksi manzarası"
];

export default function ImageGenerator({
  onImageGenerated,
  onGenerationStart,
  onGenerationEnd,
  isGenerating
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Lütfen bir açıklama girin!");
      return;
    }

    if (prompt.length > 500) {
      toast.error("Açıklama çok uzun! Maksimum 500 karakter olmalıdır.");
      return;
    }

    onGenerationStart();
    setCurrentImageUrl("");
    setCurrentPrompt(prompt);

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
        throw new Error(data.error || 'Görsel oluşturulamadı');
      }

      if (data.success && data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        onImageGenerated(data.imageUrl, prompt);
        toast.success("Görsel başarıyla oluşturuldu! 🎉");
      } else {
        throw new Error('Geçersiz yanıt formatı');
      }

    } catch (error: any) {
      console.error('Generation error:', error);
      const errorMessage = error.message || 'Beklenmeyen bir hata oluştu';
      toast.error(`Hata: ${errorMessage}`);
    } finally {
      onGenerationEnd();
    }
  };

  const handlePresetClick = (presetPrompt: string) => {
    setPrompt(presetPrompt);
  };

  const downloadImage = async () => {
    if (!currentImageUrl) return;

    try {
      toast.loading("Görsel indiriliyor...");
      
      // Base64 formatındaysa direkt indir
      if (currentImageUrl.startsWith('data:image')) {
        const link = document.createElement('a');
        link.href = currentImageUrl;
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
      } else {
        // URL formatındaysa fetch ile al ve indir
        const response = await fetch(currentImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
        
        window.URL.revokeObjectURL(url);
      }
      
      toast.success("Görsel başarıyla indirildi!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("İndirme sırasında hata oluştu");
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            🎨 Görsel Açıklaması
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Oluşturmak istediğiniz görseli detaylı olarak açıklayın... (örn: 'Güzel bir doğa manzarası, dağlar ve gökyüzü')"
            className="min-h-[100px] resize-none text-base"
            maxLength={500}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {prompt.length}/500 karakter
            </span>
            {prompt.length > 450 && (
              <span className="text-xs text-orange-500 font-medium">
                Karakter limitine yaklaşıyorsunuz
              </span>
            )}
          </div>
        </div>

        {/* Preset Prompts */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            💡 Hızlı Örnekler
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROMPTS.map((presetPrompt, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-200 transition-colors"
                onClick={() => handlePresetClick(presetPrompt)}
              >
                {presetPrompt}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          {isGenerating ? "🎨 Görsel Oluşturuluyor..." : "✨ Görsel Oluştur"}
        </Button>
      </div>

      {/* Preview Area */}
      <Card className="bg-gray-50 dark:bg-gray-800">
        <CardContent className="p-6">
          {isGenerating && (
            <div className="space-y-4">
              <GeneratingLoader />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Görsel oluşturuluyor...
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  "{currentPrompt}"
                </p>
              </div>
            </div>
          )}

          {!isGenerating && currentImageUrl && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={currentImageUrl}
                  alt={currentPrompt}
                  className="w-full h-auto rounded-lg shadow-lg max-h-96 object-contain mx-auto"
                  onError={(e) => {
                    console.error('Image load error:', e);
                    toast.error("Görsel yüklenirken hata oluştu");
                  }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="flex-1"
                >
                  📥 İndir
                </Button>
                <Button
                  onClick={() => {
                    setPrompt("");
                    setCurrentImageUrl("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  🔄 Yeni Görsel
                </Button>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center italic">
                "{currentPrompt}"
              </p>
            </div>
          )}

          {!isGenerating && !currentImageUrl && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg font-medium mb-2">Görsel oluşturulmaya hazır!</p>
              <p className="text-sm">Yukarıdaki alana açıklama girin ve "Görsel Oluştur" butonuna tıklayın</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}