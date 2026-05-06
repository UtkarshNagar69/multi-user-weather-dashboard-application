import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createAIResponse, generateSmartInsights, handleCityAction, ChatMessage } from '../services/ai.service';
import UserDashboard from '../models/UserDashboard';
import { geocodeCity } from '../services/weather.service';

// ─── Chat endpoint ───
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as { message: string; history?: ChatMessage[] };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ message: 'Message is required.' });
      return;
    }

    if (message.trim().length > 500) {
      res.status(400).json({ message: 'Message is too long (max 500 characters).' });
      return;
    }

    const userId = req.userId!;

    // Check if the user wants to add/remove a city via natural language
    const cityAction = await handleCityAction(message, userId);

    if (cityAction.action === 'add' && cityAction.cityName) {
      const geo = await geocodeCity(cityAction.cityName);
      if (geo) {
        const dashboard = await UserDashboard.findOne({ userId });
        if (dashboard) {
          const exists = dashboard.cities.find(
            (c) => c.cityName.toLowerCase() === geo.name.toLowerCase()
          );
          if (!exists) {
            dashboard.cities.push({
              cityName: geo.name,
              countryCode: geo.country_code,
              latitude: geo.latitude,
              longitude: geo.longitude,
              isFavorite: false,
              addedAt: new Date(),
            });
            await dashboard.save();
            res.status(200).json({
              reply: `✅ Done! I've added **${geo.name}, ${geo.country_code}** to your dashboard. Refresh to see the weather data!`,
              action: 'city_added',
              cityName: geo.name,
            });
            return;
          } else {
            res.status(200).json({
              reply: `📍 **${geo.name}** is already on your dashboard!`,
            });
            return;
          }
        }
      } else {
        res.status(200).json({
          reply: `❌ I couldn't find a city called "${cityAction.cityName}". Please check the spelling.`,
        });
        return;
      }
    }

    if (cityAction.action === 'remove' && cityAction.cityName) {
      const dashboard = await UserDashboard.findOne({ userId });
      if (dashboard) {
        const initialLen = dashboard.cities.length;
        dashboard.cities = dashboard.cities.filter(
          (c) => c.cityName.toLowerCase() !== cityAction.cityName!.toLowerCase()
        ) as typeof dashboard.cities;

        if (dashboard.cities.length < initialLen) {
          await dashboard.save();
          res.status(200).json({
            reply: `🗑️ Done! I've removed **${cityAction.cityName}** from your dashboard.`,
            action: 'city_removed',
            cityName: cityAction.cityName,
          });
          return;
        }
      }
    }

    // Regular AI chat response
    const conversationHistory = Array.isArray(history) ? history : [];
    const reply = await createAIResponse(message.trim(), userId, conversationHistory);

    res.status(200).json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ message: 'AI service error.' });
  }
};

// ─── Smart Insights endpoint ───
export const insights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const raw = await generateSmartInsights(userId);

    if (!raw) {
      res.status(200).json({ insights: null });
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      res.status(200).json({ insights: parsed });
    } catch {
      res.status(200).json({ insights: { tip: raw } });
    }
  } catch (err) {
    console.error('Insights error:', err);
    res.status(200).json({ insights: null });
  }
};
