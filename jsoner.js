var nen1878reader = require('./');

function main() {
    var parser = new nen1878reader.Nen1878Parser();
    var reader = new nen1878reader.Nen1878StreamReader(parser, process.stdin);

    parser.on('record', onRecord);
    reader.on('end', onEnd);

    reader.start();
}

function onRecord(record) {
    if (!record.lkiCode) {
        return;
    }

    if (record.recordType == 3 || record.recordType == 5) {
        var feature = nen1878reader.GeoJson.toFeature(record);

        if (!feature.geometry) {
            return;
        }

        var json = JSON.stringify(feature);
        console.log(json);
    }
}

function onEnd() {
}

main();
