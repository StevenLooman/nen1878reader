var GbknReader = require('./');

function main() {
    var reader = new GbknReader('test_data/WEESP_N__7001.NEN');

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
}

function onEnd() {
    console.log(lkiCodes);
    console.log(recordCount);
}

main();
