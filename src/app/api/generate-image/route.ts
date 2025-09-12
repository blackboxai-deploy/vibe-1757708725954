import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt gereklidir ve metin olmalıdır' },
        { status: 400 }
      );
    }

    // Prompt uzunluk kontrolü
    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt çok uzun. Maksimum 500 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // AI API çağrısı - Custom endpoint (API key gerektirmez)
    const aiResponse = await fetch('https://oi-server.onrender.com/chat/completions', {
      method: 'POST',
      headers: {
        'customerId': 'cus_SxoVc9tWKuAgXe',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx'
      },
      body: JSON.stringify({
        model: 'replicate/black-forest-labs/flux-1.1-pro',
        messages: [
          {
            role: 'user',
            content: `Generate a high-quality image: ${prompt}`
          }
        ]
      }),
      // 5 dakika timeout - image generation için
      signal: AbortSignal.timeout(300000)
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', {
        status: aiResponse.status,
        statusText: aiResponse.statusText,
        error: errorText
      });

      return NextResponse.json(
        { 
          error: 'Görsel oluşturulamadı. Lütfen tekrar deneyin.',
          details: `API Error: ${aiResponse.status} - ${aiResponse.statusText}`
        },
        { status: 500 }
      );
    }

    const aiData = await aiResponse.json();
    
    // AI response yapısını kontrol et
    if (!aiData || !aiData.choices || !aiData.choices[0]) {
      console.error('Invalid AI Response Structure:', aiData);
      return NextResponse.json(
        { error: 'AI yanıt formatı geçersiz' },
        { status: 500 }
      );
    }

    // Image URL'i AI response'undan çıkar
    const imageContent = aiData.choices[0].message?.content;
    
    if (!imageContent) {
      console.error('No image content in AI response:', aiData);
      return NextResponse.json(
        { error: 'AI yanıtında görsel bulunamadı' },
        { status: 500 }
      );
    }

    // Image URL veya base64 data olabilir
    let imageUrl = imageContent;
    
    // Eğer response base64 formatında ise, data URL'e çevir
    if (imageContent.includes('base64') || imageContent.startsWith('data:image')) {
      imageUrl = imageContent;
    } else if (imageContent.startsWith('http')) {
      imageUrl = imageContent;
    } else {
      // Eğer sadece base64 string ise, data URL formatına çevir
      imageUrl = `data:image/png;base64,${imageContent}`;
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: prompt,
      timestamp: Date.now()
    });

  } catch (error: any) {
    console.error('Image Generation Error:', error);

    // Timeout error'ı kontrol et
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      return NextResponse.json(
        { error: 'İstek zaman aşımına uğradı. Görsel oluşturma çok uzun sürdü.' },
        { status: 408 }
      );
    }

    // Network error kontrol et
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}