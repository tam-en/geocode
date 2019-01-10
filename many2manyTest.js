var db = require('./models');

// first, get a reference to a city (could do traveler first)
db.city.findOrCreate({
	where: { name: "Friendship" }
}).spread(function(city, created){
	// second, get a traveler
	db.traveler.findOrCreate({
		where: {firstname: "Sarah"}
	}).spread(function(traveler, created){
		// now use the magical addModel sequelize method to create association
		city.addTraveler(traveler).then(function(traveler){
			console.log(traveler, "added to", city);
		})
	})
})