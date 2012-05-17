"use strict";

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

function extractBBox(record) {
    var min = { x:  Infinity, y:  Infinity };
    var max = { x: -Infinity, y: -Infinity };

    var coordinates = record.geometry.coordinates;
    coordinates.forEach(function(coordinate) {
        min.x = Math.min(coordinate.x, min.x);
        min.y = Math.min(coordinate.y, min.y);
        max.x = Math.max(coordinate.x, max.x);
        max.y = Math.max(coordinate.y, max.y);
    });

    return [ min.x, min.y, max.x, max.y ];
}

function toFeature(record) {
    var feature = {
        type: 'Feature',
        properties: { }
    };

    // properties
    for (var key in record) {
        if (key === 'geometry' || key === 'geometryType') {
            continue;
        }

        feature.properties[key] = record[key];
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

    // bbox
    feature.bbox = extractBBox(record);

    return feature;
}

module.exports.toFeature = toFeature;
