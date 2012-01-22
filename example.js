var GbknReader = require('./');

function main() {
    console.log('start');

    var reader = new GbknReader('test_data/WEESP_N__7001.NEN');
    reader.on('record', onRecord);
    reader.on('end', onEnd);
    reader.start();

    console.log('end main');
}

var recordCount = 0;
function onRecord(record) {
    recordCount += 1;
}

function onEnd() {
    console.log('end');
    console.log(recordCount);
}

main();
