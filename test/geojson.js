var nen1878reader = require('../');

module.exports = {
    'test geojson extractPoint': function(beforeExit, assert) {
        var record = {
            geometry: {
                coordinates: [
                    { x: 0, y: 0 }
                ]
            }
        };

        var out = nen1878reader.GeoJson.extractPoint(record);
        assert.eql(out, { type: 'Point', coordinates: [ 0, 0 ] });
    },


    'test geojson extractLineString': function(beforeExit, assert) {
        var record = {
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ]
            }
        };

        var out = nen1878reader.GeoJson.extractLineString(record);
        assert.eql(out, { type: 'LineString', coordinates: [ [ 0, 0 ], [ 1, 1 ] ] });
    },
}

