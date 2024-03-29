import apiService from './service/weatherService.js';

const showWeather = async () => {
    const weatherData = await apiService.getWeatherData();
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherConditions = ['light rain', 'moderate rain', 'rain', 'shower rain', 'thunderstorm'];
    const isWeatherImpacted = weatherConditions.some(condition => weatherCondition.includes(condition));
    console.log(weatherCondition);
    
    return isWeatherImpacted;
}

const isWeatherImpacted = await showWeather();


var imageShown = isWeatherImpacted ? "resources/images/tomorrow_rain.png" : "resources/images/tomorrow_sun.png";
var textShown = isWeatherImpacted ? "Bring an umbrella!" : "Stay hydrated!";

var weatherImg = document.getElementById('weatherImg');
weatherImg.src = imageShown;
var weatherText = document.getElementById('weatherText');
weatherText.textContent = textShown;
