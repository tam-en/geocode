var express = require('express');
var app = express();
var ejsLayouts = require('express-ejs-layouts');
var methodOverride = require('method-override');
var db = require('./models');

// note: don't have to require body parser, as it's included in ejs layouts
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
// create a geocoding client
const geocodingClient = mbxGeocoding({accessToken: 'pk.eyJ1IjoidGFtLWVuIiwiYSI6ImNqcW1reGlvMjA1b2czeG80N2Y3bDR5Z3AifQ.1mxr75vzuJvAtxu--zTKqA'
});

app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));

// get home (search) page
app.get('/', function(req, res){
	db.traveler.findAll().then(function(travelers){
		res.render('city-search', {travelers: travelers});
	})
});

// get search-results page
app.get('/results', function(req, res){
	geocodingClient
	.forwardGeocode({
		query: req.query.city+", "+req.query.state,
		types: ['place'],
		countries: ['us']
	})
	.send()
	.then(function(response){
		//console.log(response.body.features);
		//res.send(response.body.features);
		var results = response.body.features.map(function(city){
			var placeNameArr = city.place_name.split(', ');
			console.log(placeNameArr);
			return {
				city: placeNameArr[0],
				state: placeNameArr[1],
				lat: city.center[1],
				long: city.center[0]
			}
		})
		console.log(req.query);
		res.render('search-results', {searchTerms: req.query, results: results});
	})
});

// add to the favorite city table
app.post('/add', function(req, res){
	// console.log(req.body)
	// TODO: use sequelize to add this city to the database (findOrCreate)
	db.city.findOrCreate({
	  where: { 
	  	name: req.body.city,
	  	state: req.body.state,
	  	lat: req.body.lat,
	  	long: req.body.long
	  },
	  defaults: { name: req.body.city, state: req.body.state, lat: req.body.lat, long: req.body.long }
	}).spread(function(city, created) {
		
		db.traveler.findById(req.body.travelerId)
		.then(function(traveler) {
			city.addTraveler(traveler)
			.then(function(traveler){
				console.log("association done")
			}).catch(function(err){
				console.log('problem associating');
			})
		})

		res.redirect('/favorites');
	});
	console.log('posting the following to the database!', req.body);
});

// get favorites page
app.get('/favorites', function(req, res){
	// TODO: use sequelize to pull favorites from database and list in ejs
	db.city.findAll()
	.then(function(favoriteCities){
		var markers = favoriteCities.map(function(c){
		var markerObj = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [c.long, c.lat]
                    },
                    "properties": {
                        "title": c.name,
                        "icon": "airport"
                    }
                };
        return JSON.stringify(markerObj);
		})
    	res.render('favorites', { favoriteCities: favoriteCities, markers: markers }); // 
	}).catch(function(err){
	    console.log('error', err);
	    res.send(err);
	})
});

// get travelers page
app.get('/travelers', function(req, res){
	db.traveler.findAll()
	.then(function(allTravelers){
    res.render('travelers', { traveler: allTravelers });
	}).catch(function(err){
	    console.log('error', err);
	    res.send(err);
	})
});



// add a new traveler
app.post('/travelers', function(req, res){
	db.traveler.findOrCreate({
	  where: { firstname: req.body.firstname },
	  defaults: { firstname: req.body.firstname, lastname: req.body.lastname }
	}).spread(function(traveler, created) {
		//console.log(traveler.get());
		//res.redirect('/travelers');
		res.redirect('/travelers');
	});
});


//BONUS ROUND: add a feature that lets you delete from favorites list

app.delete('/favorites/:id', function(req, res){
	//delete the city
	db.city.destroy({
		where: { id: req.params.id }
	}).then(function(city) {
		//delete associations
		db.placeTraveler.destroy({
			where: { cityId: req.params.id}
		}).then(function(deletedAssociation){
			res.redirect('/favorites');
		}).catch(function(err){
			console.log("problems deleting associations");
		})
	});
});

app.delete('/travelers/:id', function(req, res){
	//delete a traveler
	db.traveler.destroy({
		where: { id: req.params.id }
	}).then(function(traveler) {
		res.redirect('/travelers');
	}).catch(function(error) {
		console.log('error!', error);
		res.send('check yer logs, babe');
	});
});

// traveler-show route
app.get('/traveler/:id', function(req, res){
	db.traveler.findOne({
		where: {
			id: req.params.id
		},
		include: [db.city]
	}).then(function(traveler){ 
		var markers = traveler.cities.map(function(c){
			var markerObj = {
	                    "type": "Feature",
	                    "geometry": {
	                        "type": "Point",
	                        "coordinates": [c.long, c.lat]
	                    },
	                    "properties": {
	                        "title": c.name,
	                        "icon": "airport"
	                    }
	                }
	        return JSON.stringify(markerObj);
		});
		res.render('traveler-show', {traveler:traveler, markers:markers })
	})
})

//delete a traveler-city association
app.delete('/association', function(req, res){
	db.placeTraveler.destroy({
		where: { cityId: req.body.cityId, 
			travelerId: req.body.travelerId
		}
	}).then(function(deletedAssociation) {
		res.redirect('/traveler/'+req.body.travelerId+'?');
	}).catch(function(error) {
		console.log('error!', error);
		res.send('check yer logs, babe');
	});
});

app.listen(8000);


