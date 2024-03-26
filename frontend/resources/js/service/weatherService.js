import { weatherAPIConfig } from '../models/weatherConfig.js';

const getWeatherData = async () => {
    const apiKey = weatherAPIConfig.apiKey;
    const city = 'Nairobi'; //testing with countries that are currently raining

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
}

export default {
    getWeatherData
}