var nen1878reader = require('./');

function main() {
    var parser = new nen1878reader.Nen1878Parser();
    var reader = new nen1878reader.Nen1878FileReader(parser, 'test_data/WEESP_N__7001.NEN');

    parser.on('record', onRecord);
    reader.on('end', onEnd);
    reader.start();
}

var recordCount = 0;
var lkiCodes = {};
var xMin = Infinity;
var yMin = Infinity;
var yMax = -Infinity;
var xMax = -Infinity;
function onRecord(record) {
    recordCount += 1;

    if (!record.lkiCode) {
        return;
    }

    var lkiCode = record.lkiCode;
    lkiCodes[lkiCode] = (lkiCodes[lkiCode] || 0) + 1;

    if (record.recordType == 3 || record.recordType == 5) {
        var feature = nen1878reader.GeoJson.toFeature(record);

        if (!feature.geometry) {
            return;
        }

        // determine min, max
        var coordinates = feature.geometry.coordinates;
        if (!(coordinates[0] instanceof Array)) {
            coordinates = [ coordinates ];
        }
        for (var index = 0; index < coordinates.length; ++index) {
            var coordinate = coordinates[index];

            xMin = Math.min(xMin, coordinate[0]);
            xMax = Math.max(xMax, coordinate[0]);
            yMin = Math.min(yMin, coordinate[1]);
            yMax = Math.max(yMax, coordinate[1]);
        }
    }
}

function onEnd() {
    console.log(lkiCodes);
    console.log(recordCount);

    console.log([ xMin, yMin, xMax, yMax ]);
}

main();
