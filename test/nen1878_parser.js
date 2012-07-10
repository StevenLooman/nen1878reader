var nen1878reader = require('../');
var assert = require('assert');

describe('Nen1878Parser', function() {
    describe('#parseLine()', function() {
        it('should be able to parse a 01 record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.parseLine('010RECORD01   V      200111        1 1S01                     01\r\n');

            function onRecord(record) {
                assert.equal(1, record.recordType);
                assert.equal('RECORD01   ', record.bestandsnaam);
                assert.deepEqual(new Date(2001, 10, 1), record.datum);
                assert.equal(1, record.huidigBestand);
                assert.equal(1, record.totaalBestanden);
                assert.equal('S01', record.productCode);
            }
        });

        it('should be able to parse a 02 record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.parseLine('020102150201         0         0         1         0         101\r\n');

            function onRecord(record) {
                assert.equal(2, record.recordType);
            }
        });

        it('should be able to parse a 03 record', function() {
            var parser = new nen1878reader.Nen1878Parser();
            parser.on('record', onRecord);

            parser.parseLine('03MB02      G120111   D 20000401BSRC   0                      00');
            parser.parseLine('04I1        X000000000Y000000000I2        X000000000Y00000000000');
            parser.parseLine('04Q  3  0  0                                                  01');

            function onRecord(record) {
                assert.equal(3, record.recordType);
                assert.equal('B02', record.lkiCode);
                assert.equal(12, record.geometryType);
                assert.equal('SRC  ', record.bron);
                assert.deepEqual(new Date(2000, 3, 1), record.datum);
                assert.equal(1, record.zichtbaarheid);
                assert.equal(1, record.status);
                assert.deepEqual({ coordinates: [ { functie: 1, x: 0, y: 0}, { functie: 2, x: 0, y: 0 } ], precisieKlasse: 3, idealisatieKlasse: 0, betrouwbaarheid: 0 }, record.geometry);
            }
        });

        it('should be able to parse a 05 record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.parseLine('05F012GV6   X000000000Y000000000X000000000Y000000000KS01      01');

            function onRecord(record) {
                assert.equal(5, record.recordType);
                assert.equal(1, record.status);
                assert.equal(2, record.tekstOfSymbool);
                assert.equal('S01', record.lkiCode);
                assert.equal('GV6   ', record.symboolType);
                assert.deepEqual({ coordinates: [ { x: 0, y: 0}, { x: 0, y: 0} ] }, record.geometry);
            }
        });

        it('should be able to parse a 07 record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.parseLine('07NTEST NEN                                          ID       00');
            parser.parseLine('07AStreet                  1    a                   P1122AB   00');
            parser.parseLine('07WCITY                                                       01');

            function onRecord(record) {
                assert.equal(7, record.recordType);
                assert.equal('ID      ', record.identificatieBeheerder);
                assert.equal('TEST NEN                           ', record.naamBeheerder);
                assert.equal('Street                  ', record.straatnaam);
                assert.equal('1    ', record.huisnummer);
                assert.equal('a    ', record.huisnummerToevoeging);
                assert.equal('CITY                    ', record.vestigingsplaats);
            }
        });

        it('should be able to parse a 99 record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.parseLine('99                                                              ');

            function onRecord(record) {
                assert.equal(99, record.recordType);
            }
        });

        it('should give an error on an unknown record', function() {
            var parser = new nen1878reader.Nen1878Parser();

            parser.on('record', onRecord);
            parser.on('error', onError);
            parser.parseLine('1111111111111111111111111111111111111111111111111111111111111111');

            function onError(record) {
                assert.equal(true, true);
            }

            function onRecord(record) {
                assert.equal(false, true);
            }
        });
    });
});
