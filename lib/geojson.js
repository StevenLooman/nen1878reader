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

module.exports.extractPoint = extractPoint;
module.exports.extractLineString = extractLineString;
