import apiService from './service/weatherService.js';

const showWeather = async () => {
    const weatherData = await apiService.getWeatherData();
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherConditions = ['drizzle', 'light rain', 'moderate rain', 'rain', 'shower rain', 'thunderstorm'];
    const isWeatherImpacted = weatherConditions.some(condition => weatherCondition.includes(condition));
    console.log(weatherCondition);

    var textShown = isWeatherImpacted ? "Bring an umbrella!" : "Go out and have fun!";

    var weatherImg = document.getElementById('weatherImg');
    weatherImg.src = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`;
    var weatherText = document.getElementById('weatherText');
    weatherText.textContent = textShown;
    var weatherCond = document.getElementById('weatherCondition');
    weatherCond.textContent = weatherData.weather[0].description;
    
    return isWeatherImpacted;
}

const currentWeatherContainer = await showWeather();
