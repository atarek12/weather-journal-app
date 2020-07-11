/* Global Variables */
// Personal API Key for OpenWeatherMap API
const baseURLzip = 'http://api.openweathermap.org/data/2.5/weather?units=metric&zip=';
const baseURLcity = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=';
const APIkey = '&appid=e36ed364400282e43250b6c4c0274d44';


// Create a new date instance dynamically with JS
let today = new Date();
let newDate = today.getMonth() + 1 + '.' + today.getDate() + '.' + today.getFullYear();


// Event listener to add function to existing HTML DOM element
document.querySelector('form').addEventListener('submit', handleGenerate);



/**
 * Begin Helper Functions
 */

// function that generate URL based on user data entry
const makeURL = function () {
    const userZipCode = document.querySelector('#zip').value;
    const userCountry = document.querySelector('#country').value;
    const userCity = document.querySelector('#city').value;

    // if user select zip code
    if (userZipCode !== '') {
        newURL = baseURLzip + userZipCode + APIkey;
        return newURL;
    }
    // if user select country + city names
    else if (userCountry !== '') {
        newURL = baseURLcity + userCity + ',' + userCity + APIkey;
        return newURL;
    }
    else return null;
}


/* function to print weather data to user */
function printData(data) {
    document.querySelector('#date').innerHTML = 'Date: ' + data.date;
    document.querySelector('#temp').innerHTML = 'Temprature: ' + data.temp + ' C';
    document.querySelector('#content').innerHTML = data.feelings;
    document.querySelector('#img_desc').innerHTML = data.description;
    document.querySelector('#weather_icon').setAttribute('src', 'http://openweathermap.org/img/w/' + data.imgIcon + '.png');
    document.querySelector('#weather_icon').style.opacity = '1';
}


// function that alert warning message
function showWarningMsg() {
    document.querySelector('.warning').classList.add('active');
    document.querySelector('.hint').classList.add('active');
}

// function that hide warning message
function hideWarningMsg() {
    document.querySelector('.warning').classList.remove('active');
    document.querySelector('.hint').classList.remove('active');
}


/**
 * End helper functions
 * 
 * 
 * Begin Main functions
 */


/* Function to POST data */
const postData = async (url = '', data = {}) => {

    // create our response
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // if success, print the response coming from server
    try {
        const newData = await response.json();
        console.log(newData);
        return newData;
    }

    // if failed
    catch (error) {
        console.log("error:", error);
        return null;
    }
}


/* Function to GET Project Data */
const getData = async (url = '') => {
    const request = await fetch(url);
    try {
        // Transform into JSON
        const allData = await request.json();

        if (allData.cod === '404') {        //not found
            showWarningMsg();
            return null;
        }
        // hide any warning msgs if exist
        hideWarningMsg();

        return allData;
    }
    catch (error) {
        console.log("error:", error);
        return null;
    }
}

/**
 * End main functions
 * 
 * 
 * begin event lesten handlers
 */

/* Function called by event listener */
function handleGenerate(e) {
    e.preventDefault();

    // get API url
    let url = makeURL();

    if (url === null) {
        showWarningMsg();
        return;
    }
    // hide any warning msgs if exist
    hideWarningMsg();

    getData(url)
        .then((data) => {
            if (data === null) return;     // error

            //create user entity
            const dataObject = {
                temp: data.main.temp,
                date: newDate,
                feelings: document.querySelector('#feelings').value,
                description: data.weather[0].description,
                imgIcon: data.weather[0].icon
            };

            // send to local server
            postData('/addResponse', dataObject)
                .then(() => {
                    // get most recent data from local server
                    getData('/all')
                        .then((allData) => {
                            if (data === null) return;     // error
                            printData(allData);            // print them in browser UI
                        });
                });
        });
}


