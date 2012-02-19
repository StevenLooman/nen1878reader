function extractPoint(record) {
    var coordinates = record.geometry.coordinates;

    return {
        type: 'Point',
        coordinates: [
            coordinates[0].x, coordinates[0].y
        ]
    };
}

function extractLineString(record) {
    var coordinates = record.geometry.coordinates;

    var c = [];
    coordinates.forEach(function(coordinate) {
        c.push([
                coordinate.x, coordinate.y
        ]);
    });

    return {
        type: 'LineString',
        coordinates: c
    };
}

function toFeature(record) {
    var feature = {};

    // properties
    for (var key in record) {
        if (key === 'geometry' || key === 'geometryType') {
            continue;
        }

        feature[key] = record[key];
    }

    // geometry
    if (record.recordType == 3) {
        if (record.geometryType == 1) {
            feature.geometry = extractPoint(record);
        } else if (record.geometryType == 12) {
            feature.geometry = extractLineString(record);
        } else if (record.geometryType == 13) {
            feature.geometry = null;
        }
    } else if (record.recordType == 5) {
        if (record.textOrSymbol== 1) {
            feature.geometry = extractPoint(record);
        } else if (record.textOrSymbol == 2) {
            feature.geometry = extractPoint(record);
        }
    }

    return feature;
}

module.exports.extractPoint = extractPoint;
module.exports.extractLineString = extractLineString;
module.exports.toFeature = toFeature;
