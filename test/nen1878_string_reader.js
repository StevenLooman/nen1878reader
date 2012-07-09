var nen1878reader = require('../');
var assert = require('assert');

describe('Nen1878StringReader', function() {
    it('should be able to feed the parser a record', function() {
        var parser = new nen1878reader.Nen1878Parser();
        var string = '03MB02      G120111   D 20000401BSRC   0                      00\r\n' +
                     '04I1        X000000000Y000000000I2        X000000000Y00000000000\r\n' +
                     '04Q  3  0  0                                                  01\r\n';
        var reader = new nen1878reader.Nen1878StringReader(parser, string);

        parser.on('record', onRecord);
        reader.start();

        function onRecord(record) {
            assert.equal(3, record.recordType);
            assert.equal('B02', record.lkiCode);
            assert.equal(12, record.geometryType);
            assert.equal('SRC  ', record.source);
            assert.deepEqual(new Date(2000, 3, 1), record.date);
            assert.equal(1, record.visibility);
            assert.equal(1, record.status);
            assert.deepEqual({ coordinates: [ { function: 1, x: 0, y: 0}, { function: 2, x: 0, y: 0 } ], precision: 3, deviation: 0, reliability: 0 }, record.geometry);
        }
    });
});
