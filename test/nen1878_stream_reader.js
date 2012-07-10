var nen1878reader = require('../');
var streamBuffers = require("stream-buffers");
var assert = require('assert');

describe('Nen1878StreamReader', function() {
    it('should be able to feed the parser a record', function(done) {
        var parser = new nen1878reader.Nen1878Parser();
        var string = '03MB02      G120111   D 20000401BSRC   0                      00\r\n' +
                     '04I1        X000000000Y000000000I2        X000000000Y00000000000\r\n' +
                     '04Q  3  0  0                                                  01\r\n';
        var stream = new streamBuffers.ReadableStreamBuffer();
        var reader = new nen1878reader.Nen1878StreamReader(parser, stream);

        parser.on('record', onRecord);
        reader.on('end', onEnd);
        reader.start();
        stream.put(string);

        function onRecord(record) {
            assert.equal(3, record.recordType);
            assert.equal('B02', record.lkiCode);
            assert.equal(12, record.geometryType);
            assert.equal('SRC  ', record.bron);
            assert.deepEqual(new Date(2000, 3, 1), record.datum);
            assert.equal(1, record.zichtbaarheid);
            assert.equal(1, record.status);
            assert.deepEqual({ coordinates: [ { functie: 1, x: 0, y: 0}, { functie: 2, x: 0, y: 0 } ], precisieKlasse: 3, idealisatieKlasse: 0, betrouwbaarheid: 0 }, record.geometry);
            stream.destroy();

            done();
        }

        function onEnd() {
        }
    });

    it('should be able to "end" the parser', function(done) {
        var parser = new nen1878reader.Nen1878Parser();
        var string = '03MB02      G120111   D 20000401BSRC   0                      00\r\n' +
                     '04I1        X000000000Y000000000I2        X000000000Y00000000000\r\n' +
                     '04Q  3  0  0                                                  01\r\n';
        var stream = new streamBuffers.ReadableStreamBuffer();
        var reader = new nen1878reader.Nen1878StreamReader(parser, stream);

        parser.on('record', onRecord);
        reader.on('end', onEnd);
        reader.start();
        stream.put(string);

        function onRecord(record) {
            stream.destroy();
        }

        function onEnd() {
            done();
        }
    });
});
