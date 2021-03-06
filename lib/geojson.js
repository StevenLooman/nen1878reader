/* jslint node: true */
"use strict";

function extractPoint(record) {
    var geometry = record.geometry04 || record.geometry05; // prefer geometry 04 for point
    var coordinates = geometry.coordinates;

    return {
        type: 'Point',
        coordinates: [
            coordinates[0].x, coordinates[0].y
        ]
    };
}

function extractLineString(record) {
    var coordinates = record.geometry04.coordinates; // line strings are always geometry 04

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

function extractBBox(record) {
    var min = { x:  Infinity, y:  Infinity };
    var max = { x: -Infinity, y: -Infinity };

    var geometry = record.geometry04 || record.geometry05; // prefer geometry 04 for bbox
    var coordinates = geometry.coordinates;
    if (record.geometry04) {
        coordinates.forEach(function(coordinate) {
            min.x = Math.min(coordinate.x, min.x);
            min.y = Math.min(coordinate.y, min.y);
            max.x = Math.max(coordinate.x, max.x);
            max.y = Math.max(coordinate.y, max.y);
        });
    } else if (record.geometry05) {
        var coordinate = coordinates[0];
        min.x = max.x = coordinate.x;
        min.y = max.y = coordinate.y;
    }

    return [ min.x, min.y, max.x, max.y ];
}

function extractAngle(record) {
    var geometry = record.geometry05;
    if (!geometry) {
        return null;
    }

    var coordinates = geometry.coordinates;
    if (coordinates.length !== 2) {
        return null;
    }

    // perp: [ -y, x ];
    // dot: [ x * vector.x + y * vector.y ];
    // signed_angle: Math.atan2(this.perp().dot(vector), this.dot(vector));
    var v0 = { x: coordinates[1].x - coordinates[0].x, y: coordinates[1].y - coordinates[0].y };
    var v1 = { x: 1, y: 0 };
    var v0Perp = { x: -v0.y, y: v0.x };
    var a0 = v0Perp.x * v1.x + v0Perp.y * v1.y;
    var a1 = v0.x * v1.x + v0.y * v1.y;
    return -Math.atan2(a0, a1);
}

function geometryRecord3(record) {
    if (record.geometryType === 1) {
        return extractPoint(record);
    } else if (record.geometryType === 12) {
        return extractLineString(record);
    } else if (record.geometryType === 13) {
        return extractLineString(record);
    }

    return null;
}

function geometryRecord5(record) {
    var geom;

    switch (record.tekstOfSymbool) {
        case 1:
            geom = extractPoint(record);
            break;

        case 2:
            geom = extractPoint(record);
            break;

        default:
            break;
    }

    return geom;
}

function toFeature(record) {
    var feature = {
        type: 'Feature',
        properties: { }
    };

    // properties
    var key;
    for (key in record) {
        if (record.hasOwnProperty(key)) {
            if (key === 'geometry04' || key === 'geometry05' || key === 'geometryType') {
                continue;
            }

            feature.properties[key] = record[key];
        }
    }

    // geometry
    if (record.recordType === 3) {
        feature.geometry = geometryRecord3(record);
    } else if (record.recordType === 5) {
        feature.geometry = geometryRecord5(record);
        feature.properties['labelAngle'] = extractAngle(record);
    }

    // bbox
    feature.bbox = extractBBox(record);

    return feature;
}

module.exports.toFeature = toFeature;
