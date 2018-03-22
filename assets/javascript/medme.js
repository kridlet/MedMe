var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://api.yelp.com/v3/businesses/search?location=19106&term=drugstore",
    "method": "GET",
    "headers": {
      "Authorization": 'Bearer VsLxnByCLLm1T7ALI4ra1El5FF1sckJuZJ3PNbBGnVR-vaQ2ZqFQdrRYgl7BlWuYYyhnDZslbBpTmB4ONTPJxOtqWXSVocFrsWEjcYDTi5Qq8BB5G9lFBfyF8kuxWnYx'

    }
  }
  

  $.ajax(settings).done(function (response) {
    console.log(response);

  }).then(function (response) {
    $("#map").text(JSON.stringify(response));
    renderButtons();

  })