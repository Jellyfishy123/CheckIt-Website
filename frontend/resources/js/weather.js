import apiService from './service/weatherService.js';

const showWeather = async () => {
    const weatherData = await apiService.getWeatherData();
    const weatherCondition = weatherData.weather[0].main.toLowerCase();
    const weatherConditions = ['light rain', 'moderate rain', 'rain', 'shower rain', 'thunderstorm'];
    const isWeatherImpacted = weatherConditions.some(condition => weatherCondition.includes(condition));
    
    var imageShown = isWeatherImpacted ? "resources/images/tomorrow_rain.png" : "resources/images/tomorrow_sun.png";
    return imageShown;
}

const currentWeather = await showWeather();
console.log(currentWeather);

var weatherImg = document.getElementById('weatherImg');
weatherImg.src = currentWeather;