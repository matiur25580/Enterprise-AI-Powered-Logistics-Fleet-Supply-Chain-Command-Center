const FLEET_LOCATION_VIEWER_ROLES = new Set(['Admin', 'FleetManager']);

function canViewFleetLocation(role) {
  return FLEET_LOCATION_VIEWER_ROLES.has(role);
}

module.exports = { canViewFleetLocation };
