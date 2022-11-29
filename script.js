// Declaring necessary global variables; history, api key and url, selectors, and dayjs plugins.
let locationHistory = [];
let weatherApiURL = "https://api.openweathermap.org"
let weatherMapApiKey = "09a7f901c2703b643a28b707b98dfef8";
let searchPrompt = document.querySelector("#search-prompt");
let inputSearch = document.querySelector("#input-search");
let dateSection = document.querySelector("#current-date");
let forecastSection = document.querySelector("#forecast");
let locationHistorySection = document.querySelector("#search-history");
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// This function displays the previous searches.
function generateSearchHistory() {
    locationHistorySection.innerHTML = "";
    for (let i = locationHistory.length - 1; i >= 0; i--) {
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("aria-controls", "current-date forecast");
        button.classList.add("past-button", "button-history");
        button.setAttribute('data-query', locationHistory[i]);
        button.textContent = locationHistory[i];
        locationHistorySection.append(button);
    };
};

// This updates local storage then displays new history.
function appendHistory(query) {
    if (locationHistory.indexOf(query) !== -1) {
        return;
    }
    locationHistory.push(query);
    localStorage.setItem("recent-queries", JSON.stringify(locationHistory));
    generateSearchHistory();
};

// This retrieves history for local storage.
function locationSearchHistory() {
    let savedHistory = localStorage.getItem("recent-queries");
    if (savedHistory) {
        locationHistory = JSON.parse(savedHistory);
    }
    generateSearchHistory();
};

// This function gets weather information from our api to display it at the top of our webpage.
function generateCurrentWeather(city, weather) {
    let date = dayjs().format("M/D/YYYY");
    let tempFahren = weather.main.temp;
    let windSpeed = weather.wind.speed;
    let humidity = weather.main.humidity;
    let iconURL = `https://openweathermap.org/img/w/${weather.weather[0].icon}.png`;
    let card = document.createElement("div");
    let cardBody = document.createElement("div");
    let heading = document.createElement("h2");
    let weatherIcon = document.createElement('img');
    let tempElement = document.createElement('p');
    let windElement = document.createElement('p');
    let humidityElement = document.createElement('p');

    card.setAttribute('class', 'card');
    cardBody.setAttribute('class', 'card-body');
    card.append(cardBody);
    heading.setAttribute('class', 'h3 card-title');
    tempElement.setAttribute('class', 'card-text');
    windElement.setAttribute('class', 'card-text');
    humidityElement.setAttribute('class', 'card-text');
    heading.textContent = `${city} (${date})`;
    weatherIcon.setAttribute('src', iconURL);
    weatherIcon.setAttribute('class', 'weather-icon');
    heading.append(weatherIcon);
    tempElement.textContent = `Temperature: ${tempFahren}°F`;
    windElement.textContent = `Wind Speed: ${windSpeed} MPH`;
    humidityElement.textContent = `Level of Humidity: ${humidity} %`;
    cardBody.append(heading, tempElement, windElement, humidityElement);
    dateSection.innerHTML = '';
    dateSection.append(card);
};

// This generates a 5 day forecast to display below the header.
function generateForecastCards(forecast) {
    let iconURL = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    let tempFahren = forecast.main.temp;
    let humidity = forecast.main.humidity;
    let windSpeed = forecast.wind.speed;
    let col = document.createElement('div');
    let card = document.createElement('div');
    let cardBody = document.createElement('div');
    let cardTitle = document.createElement('h4');
    let weatherIcon = document.createElement('img');
    let tempElement = document.createElement('h5');
    let windElement = document.createElement('h5');
    let humidityElement = document.createElement('h5');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempElement, windElement, humidityElement);
    col.setAttribute('class', 'col-sm');
    col.classList.add('forecast-card');
    card.setAttribute('class', 'card bg-dark h-110 text-white');
    cardBody.setAttribute('class', 'card-body p-3');
    cardTitle.setAttribute('class', 'card-title');
    tempElement.setAttribute('class', 'card-text');
    windElement.setAttribute('class', 'card-text');
    humidityElement.setAttribute('class', 'card-text');
    cardTitle.textContent = dayjs(forecast.dt_txt).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconURL);
    tempElement.textContent = `Temperature: ${tempFahren}°F`;
    windElement.textContent = `Wind Speed: ${windSpeed} MPH`;
    humidityElement.textContent = `Level of Humidity: ${humidity} %`;
    forecastSection.append(col);
};

// This function takes all the previously generated data and renders it.
function generateForecast(dayForecast) {
    let startDate = dayjs().add(1, 'day').startOf('day').unix();
    let endDate = dayjs().add(6, 'day').startOf('day').unix();
    let headingColumn = document.createElement('div');
    let heading = document.createElement('h5');

    headingColumn.setAttribute('class', 'col-12');
    heading.textContent = 'Upcoming Forecast:';
    headingColumn.append(heading);
    forecastSection.innerHTML = '';
    forecastSection.append(headingColumn);

    for (let i = 0; i < dayForecast.length; i++) {
        if (dayForecast[i].dt >= startDate && dayForecast[i].dt < endDate) {
            if (dayForecast[i].dt_txt.slice(11, 13) == "12") {
                generateForecastCards(dayForecast[i]);
            }
        }
    }
};

// This combines two functions, lists timezone and location data.
function generateData(city, data) {
    generateCurrentWeather(city, data.list[0], data.city.timezone);
    generateForecast(data.list);
};

// This fetches weather data for the provided location from our api, then calls our functions to display weather data.
function getWeather(location) {
    let { lat } = location;
    let { lon } = location;
    let city = location.name;
    let apiUrl = `${weatherApiURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${weatherMapApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            generateData(city, data);
        })
        .catch(function (err) {
            console.error(err);
        });
};

// Retrieves coordinates.
function getCoordinates(query) {
    let apiUrl = `${weatherApiURL}/geo/1.0/direct?q=${query}&limit=5&appid=${weatherMapApiKey}`;

    fetch(apiUrl)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            if (!data[0]) {
                alert('Unable to find location');
            } else {
                appendHistory(query);
                getWeather(data[0]);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
};

// handles our form submit.
function searchFormSubmit(event) {
    if (!inputSearch.value) {
        return;
    }
    event.preventDefault();
    let query = inputSearch.value.trim();
    getCoordinates(query);
    inputSearch.value = '';
};

// handles what to do on click event.
function searchHistoryClick(event) {
    if (!event.target.matches('.button-history')) {
        return;
    }
    let button = event.target;
    let query = button.getAttribute('data-query');
    getCoordinates(query);
};

locationSearchHistory();
searchPrompt.addEventListener('submit', searchFormSubmit);
locationHistorySection.addEventListener('click', searchHistoryClick);
