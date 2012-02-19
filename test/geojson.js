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

    'test geojson toFeature 03 - 1': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 1,
            date: new Date(2012, 0, 01),
            geometry: {
                coordinates: [
                    { x: 0, y: 0 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            recordType: 3,
            lkiCode: 'LKI',
            date: new Date(2012, 0, 01),
            geometry: {
                type: 'Point',
                coordinates: [ 0, 0 ]
            }
        });
    },

    'test geojson toFeature 03 - 12': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 12,
            date: new Date(2012, 0, 01),
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            recordType: 3,
            lkiCode: 'LKI',
            date: new Date(2012, 0, 01),
            geometry: {
                type: 'LineString',
                coordinates: [
                    [ 0, 0 ],
                    [ 1, 1 ]
                ]
            }
        });
    },

    'test geojson toFeature 03 - 13': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 12,
            date: new Date(2012, 0, 01),
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                    { x: 2, y: 0 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            recordType: 3,
            lkiCode: 'LKI',
            date: new Date(2012, 0, 01),
            geometry: {
                type: 'LineString',
                coordinates: [
                    [ 0, 0 ],
                    [ 1, 1 ],
                    [ 2, 0 ]
                ]
            }
        });
    },

    'test geojson toFeature 05 - 1': function(beforeExit, assert) {
        var record = {
            recordType: 5,
            lkiCode: 'LKI',
            textOrSymbol: 1,
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 0, y: 1 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            recordType: 5,
            lkiCode: 'LKI',
            textOrSymbol: 1,
            geometry: {
                type: 'Point',
                coordinates: [
                    0, 0
                ]
            }
        });
    },

    'test geojson toFeature 05 - 2': function(beforeExit, assert) {
        var record = {
            recordType: 5,
            lkiCode: 'LKI',
            textOrSymbol: 2,
            text: 'Text                                    ',
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 0, y: 1 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            recordType: 5,
            lkiCode: 'LKI',
            textOrSymbol: 2,
            text: 'Text                                    ',
            geometry: {
                type: 'Point',
                coordinates: [
                    0, 0
                ]
            }
        });
    }
}

