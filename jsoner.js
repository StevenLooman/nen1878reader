var nen1878reader = require('./');


var isFirst = true;


function main() {
    console.log('{"type": "FeatureCollection",');
    console.log('"crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG:6.9:28992"}},');
    console.log('"features": [');

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

        // NEN1878 coordinates are in [mm], EPSG:28992 expects [m]
        if (feature.geometry.type === 'Point') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(function(ord) { return ord / 1000.0; });
        } else if (feature.geometry.type === 'LineString') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(function(coord) { return [ coord[0] / 1000.0, coord[1] / 1000.0 ]; });
        }
        feature.bbox = feature.bbox.map(function(c) { return c / 1000.0; });

        if (isFirst) {
            isFirst = false;
        } else {
            console.log(',');
        }

        var json = JSON.stringify(feature);
        console.log(json);
    }
}

function onEnd() {
    console.log(']}');
}

main();
