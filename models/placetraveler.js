'use strict';
module.exports = (sequelize, DataTypes) => {
  const placeTraveler = sequelize.define('placeTraveler', {
    cityId: DataTypes.INTEGER,
    travelerId: DataTypes.INTEGER
  }, {});
  placeTraveler.associate = function(models) {
    // associations can be defined here
  };
  return placeTraveler;
};