#!/usr/bin/env node

var nen1878reader = require('./');
var fs = require('fs');


var recordCount = 0;
var isFirst = true;
var baseFilename = process.argv[2] || 'out_';
var currentFile = 0;
var currentFd = null;
var SPLIT_ON_COUNT = 500000;


function openFile(filename) {
    var fd = fs.openSync(filename, 'w');

    // write header
    fs.writeSync(fd, '{"type": "FeatureCollection",');
    fs.writeSync(fd, '"crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG:6.9:28992"}},');
    fs.writeSync(fd, '"features": [');

    return fd;
}

function closeFile(fd) {
    // write footer
    fs.writeSync(fd, ']}');

    fs.closeSync(fd);
}


function pad(num, size) {
    var s = num + "";

    while (s.length < size) {
        s = "0" + s;
    }

    return s;
}


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

    // open new file if needed
    if (!currentFd) {
        currentFd = openFile(baseFilename + '_' + pad(currentFile, 2) + '.geojson');
        currentFile += 1;
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
            fs.writeSync(currentFd, ',');
        }

        var json = JSON.stringify(feature);
        fs.writeSync(currentFd, json);


        // open new file if needed
        recordCount += 1;
        if (recordCount % SPLIT_ON_COUNT === 0) {
            closeFile(currentFd);
            isFirst = true;
            currentFd = null;
        }
    }
}

function onEnd() {
    closeFile(currentFd);
}

main();
