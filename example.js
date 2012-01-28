var nen1878reader = require('./');

function main() {
    var reader = new nen1878reader.Nen1878Reader('test_data/WEESP_N__7001.NEN');
    //var reader = new nen1878reader.Nen1878Reader('test_data/dummy.nen');
    //var reader = new nen1878reader.Nen1878Reader('test_data/7500_09.sfn');

    reader.on('record', onRecord);
    reader.on('end', onEnd);
    reader.start();
}

var recordCount = 0;
var lkiCodes = {};
function onRecord(record) {
    recordCount += 1;

    if (!('lki_code' in record)) {
        return;
    }

    var lkiCode = record.lki_code;
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
