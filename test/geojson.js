var nen1878reader = require('../');
var assert = require('assert');

describe('GeoJson', function() {
    describe('#toFeature()', function() {
        it('should convert a 03/1 record to a GeoJson feature', function() {
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

            assert.deepEqual(feature, {
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
        });

        it('should convert a 03/12 record to a GeoJson feature', function() {
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

            assert.deepEqual(feature, {
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
        });

        it('should convert a 03/13 record to a GeoJson feature', function() {
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

            assert.deepEqual(feature, {
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [ 0, 0 ],
                        [ 1, 1 ],
                        [ 2, 0 ]
                    ]
                },
                properties: {
                    recordType: 3,
                    lkiCode: 'LKI',
                    date: new Date(2012, 0, 1)
                },
                bbox: [ 0, 0, 2, 1 ]
            });
        });

        it('should convert a 05/1 record to a GeoJson feature', function() {
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

            assert.deepEqual(feature, {
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
        });

        it('should convert a 05/2 record to a GeoJson feature', function() {
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

            assert.deepEqual(feature, {
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
        });
    });
});
