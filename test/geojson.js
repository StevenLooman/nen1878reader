var nen1878reader = require('../');

module.exports = {
    'test geojson toFeature 03 - 1': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 1,
            date: new Date(2012, 0, 1),
            geometry: {
                coordinates: [
                    { x: 0, y: 0 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [ 0, 0 ]
            },
            properties: {
                recordType: 3,
                lkiCode: 'LKI',
                date: new Date(2012, 0, 1)
            },
            bbox: [ 0, 0, 0, 0 ]
        });
    },

    'test geojson toFeature 03 - 12': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 12,
            date: new Date(2012, 0, 1),
            geometry: {
                coordinates: [
                    { x: 0, y: 0 },
                    { x: 1, y: 1 }
                ]
            }
        };

        var feature = nen1878reader.GeoJson.toFeature(record);

        assert.eql(feature, {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [
                    [ 0, 0 ],
                    [ 1, 1 ]
                ]
            },
            properties: {
                recordType: 3,
                lkiCode: 'LKI',
                date: new Date(2012, 0, 1)
            },
            bbox: [ 0, 0, 1, 1 ]
        });
    },

    'test geojson toFeature 03 - 13': function(beforeExit, assert) {
        var record = {
            recordType: 3,
            lkiCode: 'LKI',
            geometryType: 13,
            date: new Date(2012, 0, 1),
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
            type: 'Feature',
            geometry: null,
            properties: {
                recordType: 3,
                lkiCode: 'LKI',
                date: new Date(2012, 0, 1)
            },
            bbox: [ 0, 0, 2, 1 ]
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
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    0, 0
                ]
            },
            properties: {
                recordType: 5,
                lkiCode: 'LKI',
                textOrSymbol: 1
            },
            bbox: [ 0, 0, 0, 1 ]
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
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [
                    0, 0
                ]
            },
            properties: {
                recordType: 5,
                lkiCode: 'LKI',
                textOrSymbol: 2,
                text: 'Text                                    '
            },
            bbox: [ 0, 0, 0, 1 ]
        });
    }
}

