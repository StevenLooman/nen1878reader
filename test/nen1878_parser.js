var nen1878reader = require('../');

module.exports = {
    'test parse record 01': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();

        parser.on('record', onRecord);
        parser.parseLine('010RECORD01   V      200111        1 1S01                     01\r\n');

        function onRecord(record) {
            assert.equal(1, record.recordType);
            assert.equal('RECORD01   ', record.name);
            assert.eql(new Date(2001, 10, 1), record.date);
            assert.equal(1, record.currentFile);
            assert.equal(1, record.totalFiles);
            assert.equal('S01', record.productCode);
        }
    },

    'test parse record 02': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();

        parser.on('record', onRecord);
        parser.parseLine('020102150201         0         0         1         0         101\r\n');

        function onRecord(record) {
            assert.equal(2, record.recordType);
        }
    },

    'test parse record 03': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();
        parser.on('record', onRecord);

        parser.parseLine('03MB02      G120111   D 20000401BSRC   0                      00');
        parser.parseLine('04I1        X000000000Y000000000I2        X000000000Y00000000000');
        parser.parseLine('04Q  3  0  0                                                  01');

        function onRecord(record) {
            assert.equal(3, record.recordType);
            assert.equal('B02', record.lkiCode);
            assert.equal(12, record.geometryType);
            assert.equal('SRC  ', record.source);
            assert.eql(new Date(2000, 3, 1), record.date);
            assert.equal(1, record.visibility);
            assert.equal(1, record.status);
            assert.eql({ coordinates: [ { function: 1, x: 0, y: 0}, { function: 2, x: 0, y: 0 } ], precision: 3, deviation: 0, reliability: 0 }, record.geometry);
        }
    },

    'test parse record 05': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();

        parser.on('record', onRecord);
        parser.parseLine('05F012GV6   X000000000Y000000000X000000000Y000000000KS01      01');

        function onRecord(record) {
            assert.equal(5, record.recordType);
            assert.equal(1, record.status);
            assert.equal(2, record.textOrSymbol);
            assert.equal('S01', record.lkiCode);
            assert.equal('GV6   ', record.symbolType);
            assert.eql({ coordinates: [ { x: 0, y: 0}, { x: 0, y: 0} ] }, record.geometry);
        }
    },

    'test parse record 07': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();

        parser.on('record', onRecord);
        parser.parseLine('07NTEST NEN                                          ID       00');
        parser.parseLine('07AStreet                  1    a                   P1122AB   00');
        parser.parseLine('07WCITY                                                       01');

        function onRecord(record) {
            assert.equal(7, record.recordType);
            assert.equal('ID      ', record.id);
            assert.equal('TEST NEN                           ', record.name);
            assert.equal('Street                  ', record.street);
            assert.equal('1    ', record.number);
            assert.equal('a    ', record.number_addition);
            assert.equal('CITY                    ', record.city);
        }
    },

    'test parse record 99': function(beforeExit, assert) {
        var parser = new nen1878reader.Nen1878Parser();

        parser.on('record', onRecord);
        parser.parseLine('99                                                              ');

        function onRecord(record) {
            assert.equal(99, record.recordType);
        }
    },

    'test parse record unknown': function(beforeExit, assert) {
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
    },

}

