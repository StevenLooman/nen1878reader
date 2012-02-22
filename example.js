var nen1878reader = require('./');

function main() {
    var parser = new nen1878reader.Nen1878Parser();
    var reader = new nen1878reader.Nen1878Reader(parser, 'test_data/WEESP_N__7001.NEN');

    parser.on('record', onRecord);
    reader.on('end', onEnd);
    reader.start();
}

var recordCount = 0;
var lkiCodes = {};
function onRecord(record) {
    recordCount += 1;

    if (!record.lkiCode) {
        return;
    }

    var lkiCode = record.lkiCode;
    lkiCodes[lkiCode] = (lkiCodes[lkiCode] || 0) + 1;

    if (record.recordType == 3) {
        var geoJson = nen1878reader.GeoJson.extractLineString(record);
    }
}

function onEnd() {
    console.log(lkiCodes);
    console.log(recordCount);
}

main();
