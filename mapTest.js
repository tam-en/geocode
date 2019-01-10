// import geocoding services from mapbox sdk
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// create a geocoding client
const geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoidGFtLWVuIiwiYSI6ImNqcW1reGlvMjA1b2czeG80N2Y3bDR5Z3AifQ.1mxr75vzuJvAtxu--zTKqA'
});

// forward geocoding
geocodingClient
.forwardGeocode({
	query: 'Seattle, WA'
})
.send()
.then(response => {
	console.log(response.body.features[0].geometry); // call that is useful for placing something on a map
})

// reverse geocoding
geocodingClient
.reverseGeocode({
	query: [-122.3301, 47.6038],
	types: ['place']

})
.send()
.then(response => {
	console.log(response.body.features);
})