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
    coordinates.forEach(function(coordinate) {
        min.x = Math.min(coordinate.x, min.x);
        min.y = Math.min(coordinate.y, min.y);
        max.x = Math.max(coordinate.x, max.x);
        max.y = Math.max(coordinate.y, max.y);
    });

    return [ min.x, min.y, max.x, max.y ];
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
    if (record.textOrSymbol === 1) {
        return extractPoint(record);
    } else if (record.textOrSymbol === 2) {
        return extractPoint(record);
    }

    return null;
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
    }

    // bbox
    feature.bbox = extractBBox(record);

    return feature;
}

module.exports.toFeature = toFeature;
