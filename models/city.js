'use strict';
module.exports = (sequelize, DataTypes) => {
  const city = sequelize.define('city', {
    name: DataTypes.STRING,
    state: DataTypes.STRING,
    lat: DataTypes.NUMERIC,
    long: DataTypes.NUMERIC
  }, {});
  city.associate = function(models) {
    models.city.belongsToMany(models.traveler, {through: "placeTraveler"});
  };
  return city;
};