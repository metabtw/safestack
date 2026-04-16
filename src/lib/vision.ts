export async function extractDrugLabel(imageBase64: string) {
  try {
    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
    
    const res = await fetch('/api/extract-label', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64Data })
    });
    
    if (!res.ok) {
      throw new Error('Failed to extract label');
    }
    
    return await res.json();
  } catch (error) {
    console.error("Vision API Error:", error);
    throw error;
  }
}
