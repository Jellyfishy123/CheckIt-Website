import { weatherAPIConfig } from '../models/weatherConfig.js';
import { getCurrentLocation } from './locationService.js';
const getWeatherData = async () => {
    const apiKey = weatherAPIConfig.apiKey;
    const city = 'Singapore'; //testing with countries that are currently raining

    // const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    //get current location lat and long
    const location = await getCurrentLocation();
    const lat = location.coords.latitude;
    const long = location.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`;
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