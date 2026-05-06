import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import UserDashboard from '../models/UserDashboard';
import { fetchWeather, geocodeCity, WeatherData } from './weather.service';

// ─── Types ───
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CityWithWeather {
  cityName: string;
  countryCode: string;
  isFavorite: boolean;
  weather: (WeatherData & { humidity?: number; feelsLike?: number }) | null;
}

// ─── Helper: Gather all weather data for a user ───
export async function gatherUserWeatherContext(userId: string): Promise<CityWithWeather[]> {
  const dashboard = await UserDashboard.findOne({ userId });
  if (!dashboard || dashboard.cities.length === 0) return [];

  const results = await Promise.allSettled(
    dashboard.cities.map((c) => fetchWeather(c.cityName, c.latitude, c.longitude))
  );

  return dashboard.cities.map((city, i) => ({
    cityName: city.cityName,
    countryCode: city.countryCode,
    isFavorite: city.isFavorite,
    weather: results[i].status === 'fulfilled' ? results[i].value : null,
  }));
}

// ─── Format weather context into a string for the LLM ───
function formatWeatherContext(cities: CityWithWeather[]): string {
  if (cities.length === 0) return 'The user has no cities on their dashboard yet.';

  return cities
    .map((c) => {
      if (!c.weather) return `• ${c.cityName} (${c.countryCode}): Weather data unavailable`;
      const w = c.weather;
      return [
        `• ${c.cityName} (${c.countryCode})${c.isFavorite ? ' ⭐ FAVORITE' : ''}:`,
        `  Temperature: ${w.temperature}°C (Feels like: ${(w as any).feelsLike ?? 'N/A'}°C)`,
        `  Condition: ${w.condition}`,
        `  Humidity: ${(w as any).humidity ?? 'N/A'}%`,
        `  Wind: ${w.windspeed} km/h`,
        `  Time of day: ${w.isDay ? 'Day' : 'Night'}`,
      ].join('\n');
    })
    .join('\n\n');
}

// ─── System Prompt ───
const SYSTEM_PROMPT = `You are WeatherBot, an AI weather assistant embedded in a multi-city weather dashboard called WeatherBoard.

ROLE: You help users understand their weather data, make decisions, and get personalized recommendations.

CAPABILITIES:
- Analyze and compare weather across all the user's tracked cities
- Give activity, outfit, and travel recommendations based on current conditions
- Answer questions about weather patterns and conditions
- Provide safety alerts when conditions are extreme (>40°C, <-10°C, storms, heavy rain)
- Add or remove cities from the user's dashboard when asked

PERSONALITY: Friendly, concise, and practical. Use weather emojis naturally. Give specific, actionable advice.

RULES:
- Always base answers on the ACTUAL weather data provided — never make up numbers
- Keep responses under 200 words unless the user asks for detail
- When comparing cities, use a clear format
- For outfit recommendations, be specific (e.g., "light cotton t-shirt and sunglasses" not just "dress light")
- If the user asks about a city not on their dashboard, suggest they add it first`;

// ─── LangChain Agent Setup ───
export async function createAIResponse(
  userMessage: string,
  userId: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return '⚙️ AI features require an OpenAI API key. Please add `OPENAI_API_KEY` to your backend `.env` file.';
  }

  try {
    // Gather current weather context
    const cities = await gatherUserWeatherContext(userId);
    const weatherContext = formatWeatherContext(cities);

    // Build message chain
    const messages = [
      new SystemMessage(`${SYSTEM_PROMPT}\n\n--- CURRENT DASHBOARD WEATHER DATA ---\n${weatherContext}\n--- END DATA ---`),
      ...conversationHistory.slice(-8).map((m) =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
      new HumanMessage(userMessage),
    ];

    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: apiKey,
      temperature: 0.7,
      maxTokens: 500,
    });

    const response = await model.invoke(messages);
    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content);

    return content || 'I couldn\'t generate a response. Please try again.';
  } catch (err: any) {
    console.error('AI response error:', err?.message || err);
    if (err?.message?.includes('API key') || err?.message?.includes('Incorrect API key')) {
      return '⚙️ Invalid OpenAI API key. Please check your `OPENAI_API_KEY` in the `.env` file.';
    }
    if (err?.message?.includes('Quota exceeded') || err?.message?.includes('429') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      return '⏳ AI rate limit reached. Please wait a moment and try again.';
    }
    return '❌ Something went wrong with the AI service. Please try again in a moment.';
  }
}

// ─── Smart Insights Generator ───
export async function generateSmartInsights(userId: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return '';
  }

  try {
    const cities = await gatherUserWeatherContext(userId);
    if (cities.length === 0) return '';

    const weatherContext = formatWeatherContext(cities);

    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: apiKey,
      temperature: 0.6,
      maxTokens: 400,
    });

    const prompt = `You are a weather insights AI. Analyze this weather data and provide a brief, helpful summary.

${weatherContext}

Generate a JSON response with this exact structure (no markdown, just raw JSON):
{
  "bestCity": "The city with the best weather right now for outdoor activities and why (1 sentence)",
  "alerts": ["Array of any weather alerts or warnings - empty if none"],
  "outfit": "What to wear if going outside right now based on the overall weather conditions (1 sentence, be specific)",
  "tip": "One practical, creative tip based on the current weather patterns across all cities (1 sentence)"
}`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      JSON.parse(jsonMatch[0]); // validate it parses
      return jsonMatch[0];
    }
    return content;
  } catch (err: any) {
    console.error('Smart insights error:', err?.message || err);
    return '';
  }
}

// ─── AI-Powered City Action (add/remove via natural language) ───
export async function handleCityAction(
  userMessage: string,
  userId: string
): Promise<{ action: 'add' | 'remove' | 'none'; cityName?: string }> {
  const lower = userMessage.toLowerCase();

  // Simple pattern matching for common phrases (no LLM needed)
  const addMatch = lower.match(/(?:add|track|include|monitor)\s+(?:the\s+city\s+)?(.+?)(?:\s+to|\s+on|\s+please|$)/i);
  const removeMatch = lower.match(/(?:remove|delete|drop|untrack)\s+(?:the\s+city\s+)?(.+?)(?:\s+from|\s+please|$)/i);

  if (addMatch) {
    const cityName = addMatch[1].trim().replace(/[.,!?]/g, '');
    if (cityName.length > 1 && cityName.length < 50) {
      return { action: 'add', cityName };
    }
  }

  if (removeMatch) {
    const cityName = removeMatch[1].trim().replace(/[.,!?]/g, '');
    if (cityName.length > 1 && cityName.length < 50) {
      return { action: 'remove', cityName };
    }
  }

  return { action: 'none' };
}
