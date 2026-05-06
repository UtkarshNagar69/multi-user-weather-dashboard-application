import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import UserDashboard from '../models/UserDashboard';
import { fetchWeather, geocodeCity } from '../services/weather.service';

export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dashboard = await UserDashboard.findOne({ userId: req.userId });
    if (!dashboard) {
      res.status(404).json({ message: 'Dashboard not found.' });
      return;
    }

    // Fetch weather concurrently for all saved cities
    const weatherResults = await Promise.allSettled(
      dashboard.cities.map((city) =>
        fetchWeather(city.cityName, city.latitude, city.longitude)
      )
    );

    const cities = dashboard.cities.map((city, index) => {
      const result = weatherResults[index];
      const weather = result.status === 'fulfilled' ? result.value : null;
      return {
        cityName: city.cityName,
        countryCode: city.countryCode,
        latitude: city.latitude,
        longitude: city.longitude,
        isFavorite: city.isFavorite,
        addedAt: city.addedAt,
        weather: weather || null,
        weatherUnavailable: weather === null,
      };
    });

    // Sort: favorites first
    cities.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

    res.status(200).json({ cities });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const addCity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cityName } = req.body;
    if (!cityName || typeof cityName !== 'string') {
      res.status(400).json({ message: 'City name is required.' });
      return;
    }

    // Geocode city first to validate it exists
    const geo = await geocodeCity(cityName.trim());
    if (!geo) {
      res.status(404).json({ message: `City "${cityName}" not found. Please check the spelling.` });
      return;
    }

    const dashboard = await UserDashboard.findOne({ userId: req.userId });
    if (!dashboard) {
      res.status(404).json({ message: 'Dashboard not found.' });
      return;
    }

    // Check if city already exists (case-insensitive)
    const already = dashboard.cities.find(
      (c) => c.cityName.toLowerCase() === geo.name.toLowerCase()
    );
    if (already) {
      res.status(409).json({ message: `"${geo.name}" is already on your dashboard.` });
      return;
    }

    dashboard.cities.push({
      cityName: geo.name,
      countryCode: geo.country_code,
      latitude: geo.latitude,
      longitude: geo.longitude,
      isFavorite: false,
      addedAt: new Date(),
    });
    await dashboard.save();

    res.status(201).json({
      message: `${geo.name}, ${geo.country_code} added to dashboard.`,
      city: {
        cityName: geo.name,
        countryCode: geo.country_code,
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    });
  } catch (err) {
    console.error('addCity error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cityName } = req.params;

    const dashboard = await UserDashboard.findOne({ userId: req.userId });
    if (!dashboard) {
      res.status(404).json({ message: 'Dashboard not found.' });
      return;
    }

    const city = dashboard.cities.find(
      (c) => c.cityName.toLowerCase() === decodeURIComponent(cityName).toLowerCase()
    );
    if (!city) {
      res.status(404).json({ message: 'City not found on your dashboard.' });
      return;
    }

    city.isFavorite = !city.isFavorite;
    await dashboard.save();

    res.status(200).json({
      message: city.isFavorite
        ? `${city.cityName} added to favorites.`
        : `${city.cityName} removed from favorites.`,
      isFavorite: city.isFavorite,
    });
  } catch (err) {
    console.error('toggleFavorite error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const removeCity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { cityName } = req.params;

    const dashboard = await UserDashboard.findOne({ userId: req.userId });
    if (!dashboard) {
      res.status(404).json({ message: 'Dashboard not found.' });
      return;
    }

    const initialLength = dashboard.cities.length;
    dashboard.cities = dashboard.cities.filter(
      (c) => c.cityName.toLowerCase() !== decodeURIComponent(cityName).toLowerCase()
    ) as typeof dashboard.cities;

    if (dashboard.cities.length === initialLength) {
      res.status(404).json({ message: 'City not found on your dashboard.' });
      return;
    }

    await dashboard.save();
    res.status(200).json({ message: `${decodeURIComponent(cityName)} removed from dashboard.` });
  } catch (err) {
    console.error('removeCity error:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
