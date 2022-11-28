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

function generateSearchHistory() {
    locationHistorySection.innerHTML = "";

    for(let i = locationHistory.length - 1; i >= 0; i--) {
        let button = document.createElement("button");
        button.setAttribute("type", "button");
        button.setAttribute("aria-controls", "current-date forecast");
        button.classList.add("past-button", "button-history");
        button.setAttribute('data-query', locationHistory[i]);
        button.textContent = locationHistory[i];
        locationHistorySection.append(button);
    };
};

function appendHistory(query) {
    if(locationHistory.indexOf(query) !== -1) {
        return;
    }
    locationHistory.push(query);
    localStorage.setItem("recent-queries", JSON.stringify(locationHistory));
    generateSearchHistory();
};

function locationSearchHistory() {
    let savedHistory = localStorage.getItem("recent-queries");
    if(savedHistory) {
        locationHistory = JSON.parse(savedHistory);
    }
    generateSearchHistory();
};