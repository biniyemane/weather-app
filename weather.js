const apiKey = '877074ff7144deddb55bef37d70aba49'; 
let isCelsius = false;
let currentTempF = null;
let feelsLikeTempF = null;



async function getWeatherByZip() {
    const zipCode = document.getElementById('zipCode').value;
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},US&appid=${apiKey}`);
    const geoData = await geoResponse.json();
    console.log(geoData)
    const { lat, lon, name: city } = geoData;

    getWeather(lat, lon, city);
}

async function getWeatherByCity() {
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`);
    const geoData = await geoResponse.json();
    const { lat, lon, name } = geoData[0];
    console.log(geoData[0])

    getWeather(lat, lon, name);
}

async function getWeatherByCurrentLocation() {
    if (navigator.geolocation) {
        console.log(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`);
            const geoData = await geoResponse.json();
            console.log(geoData)
            const { lat, lon, name: city } = geoData[0];

            getWeather(lat, lon, city);
        });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

async function getWeather(lat, lon, city) {
    const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const weatherData = await weatherResponse.json();
    console.log(weatherData.main)
    const { temp, feels_like, temp_min, temp_max, humidity } = weatherData.main;
    const { description, icon } = weatherData.weather[0];

    currentTempF = temp;
    feelsLikeTempF = feels_like;

    const currentDate = new Date().toLocaleDateString();

    document.getElementById('currentDate').textContent = `Current Date: ${currentDate}`;
    document.getElementById('cityName').textContent = `City: ${city}`;
    document.getElementById('temperature').innerHTML = `Current Temperature: ${temp} °F <i class="fas fa-thermometer-half"></i>`;
    document.getElementById('feelsLike').textContent = `Feels Like: ${feels_like} °F`;
    document.getElementById('humidity').textContent = `Humidity: ${humidity}%`;
    document.getElementById('conditions').textContent = `Current Conditions: ${description}`;
    document.getElementById('tempHighLow').textContent = `High/Low: ${temp_max} °F / ${temp_min} °F`;

    setWeatherBackground(description);
    getForecast(lat, lon);
}

async function getForecast(lat, lon) {
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`);
    const forecastData = await forecastResponse.json();
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '';

    const days = forecastData.list.filter((item, index) => index % 8 === 0).slice(0, 3);

    days.forEach(day => {
        const date = new Date(day.dt_txt).toLocaleDateString();
        const { temp_max, temp_min } = day.main;
        const { description, icon } = day.weather[0];

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <p>${date}</p>
            <p>${description}</p>
            <p>High/Low: ${temp_max} °F / ${temp_min} °F</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
        `;

        forecastElement.appendChild(forecastItem);
    });
}

function setWeatherBackground(description) {
    let bgColor;
    switch (true) {
        case /clear/i.test(description):
            bgColor = '#87CEEB';
            break;
        case /cloud/i.test(description):
            bgColor = '#B0C4DE';
            break;
        case /rain/i.test(description):
            bgColor = '#778899';
            break;
        case /snow/i.test(description):
            bgColor = '#FFFAFA';
            break;
        case /storm/i.test(description):
            bgColor = '#2F4F4F';
            break;
        default:
            bgColor = '#f0f8ff';
            break;
    }
    document.body.style.backgroundColor = bgColor;
}

function convertTemp() {
    if (currentTempF === null || feelsLikeTempF === null) {
        return; // Exit the function if temperature values are not available
    }

    const tempElement = document.getElementById('temperature');
    const feelsLikeElement = document.getElementById('feelsLike');

    if (isCelsius) {
        // Convert from Celsius to Fahrenheit
        const tempF = (currentTempF * 9/5) + 32;
        const feelsLikeF = (feelsLikeTempF * 9/5) + 32;
        tempElement.innerHTML = `Current Temperature: ${tempF.toFixed(1)} °F <i class="fas fa-thermometer-half"></i>`;
        feelsLikeElement.textContent = `Feels Like: ${feelsLikeF.toFixed(1)} °F`;
        isCelsius = false; // Update the state to reflect the current temperature scale
    } else {
        // Convert from Fahrenheit to Celsius
        const tempC = (currentTempF - 32) * 5/9;
        const feelsLikeC = (feelsLikeTempF - 32) * 5/9;
        tempElement.innerHTML = `Current Temperature: ${tempC.toFixed(1)} °C <i class="fas fa-thermometer-half"></i>`;
        feelsLikeElement.textContent = `Feels Like: ${feelsLikeC.toFixed(1)} °C`;
        isCelsius = true; // Update the state to reflect the current temperature scale
    }
}