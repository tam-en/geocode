'use strict';
module.exports = (sequelize, DataTypes) => {
  const traveler = sequelize.define('traveler', {
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING
  }, {});
  traveler.associate = function(models) {
    models.traveler.belongsToMany(models.city, {through: "placeTraveler"});
  };
  return traveler;
};