/**
 * Mock response for enhanced API testing
 * Use this when backend is not available
 */

export const mockEnhancedResponse = {
  script: `Opening with a dramatic close-up of the sleek wireless headphones, camera slowly pulls back revealing the premium matte black finish with subtle gold accents. Soft studio lighting creates elegant reflections across the curved ear cups, emphasizing the luxurious texture.

The headphones rotate smoothly 360°, showcasing the ergonomic design and premium materials. Quick cut to detail shots: the precision-engineered hinges, the plush memory foam ear cushions, and the intuitive touch controls seamlessly integrated into the surface.

Transition to a lifestyle shot - the headphones worn by a young professional in a modern workspace, demonstrating the active noise cancellation as the busy environment fades to silence. The LED indicator pulses gently, signaling the ANC activation.

Final shot frames the headphones against a minimalist backdrop, floating gracefully with a subtle glow effect. The brand logo appears with understated elegance. Modern, sophisticated aesthetic throughout with emphasis on premium quality and technological innovation.`,

  enhanced_image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1280&h=720&fit=crop",

  enhancement_details: {
    mode: "professional",
    original_size_kb: 2456.8,
    enhanced_size_kb: 1923.4,
    original_dimensions: "1920x1080",
    enhanced_dimensions: "1280x720",
    adjustments: [
      "brightness +8%",
      "contrast +15%",
      "color +15%",
      "sharpness +10%",
      "unsharp mask",
      "auto-contrast +15%"
    ],
    size_reduction: "21.7%",
    resized: true,
    auto_oriented: true
  },

  product_analysis: {
    product_type: "Premium Wireless Headphones",
    key_features: [
      "Active Noise Cancellation (ANC)",
      "Premium matte black finish with gold accents",
      "Touch controls",
      "Memory foam ear cushions",
      "40-hour battery life"
    ],
    target_audience: "Young professionals and audiophiles aged 25-45",
    unique_selling_points: [
      "Industry-leading noise cancellation",
      "Premium design and materials",
      "Exceptional comfort for extended use",
      "Intuitive touch controls"
    ],
    market_position: "premium",
    emotional_appeal: "Sophistication and technological excellence"
  },

  style: "modern, sophisticated, minimalist, premium",
  camera: "close-up, pull back, 360° rotation, detail shots",
  lighting: "soft studio, elegant reflections, subtle glow",
  tokens_used: 1450,
  processing_time: 4.23,
  user_input_used: true
};

/**
 * Mock function to simulate API delay
 */
export async function getMockEnhancedResponse(delay: number = 2000) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockEnhancedResponse);
    }, delay);
  });
}

/**
 * Instructions for using mock response:
 *
 * In HeroSection.tsx, add this at the top:
 * import { mockEnhancedResponse, getMockEnhancedResponse } from '@/lib/api/mock-enhanced-response';
 *
 * Then in generateScriptFromImage function, add after line 231:
 *
 * // FOR TESTING ONLY - Remove in production
 * const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
 * if (USE_MOCK) {
 *   console.log("🧪 Using MOCK response for testing");
 *   result = await getMockEnhancedResponse(3000);
 * } else if (useEnhancedAPI || hasUserInput || enhancementMode !== 'standard') {
 *   // ... existing enhanced API call
 * }
 *
 * To enable mock mode, set in .env.local:
 * NEXT_PUBLIC_USE_MOCK=true
 */