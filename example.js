var GbknReader = require('./lib');

function main() {
    console.log('start');

    var reader = new GbknReader('test_data/dummy.nen');
    reader.on('record', onRecord);
    reader.on('end', onEnd);
    reader.start();

    console.log('end main');
}

var recordCount = 0;
function onRecord(record) {
    console.log('record', record);
    recordCount += 1;
}

function onEnd() {
    console.log('end');
    console.log(recordCount);
}

main();
