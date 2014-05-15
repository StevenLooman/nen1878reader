#!/usr/bin/env node

// Convert a NEN1878 file to a GML file
//
// Usage: nen18782gml.js [options] input_file base_output_file
// Options:
//   --split <count>    Split the output files on every <count> records
//
// Example: nen18782gml.js --split 2500 WEESP_N__7001.NEN weesp
//   This will read the file WEESP_N__7001.NEN in the current directory
//   and will create weesp_00.gml, weesp_01.gml, weesp_02.gml, weesp_03.gml,
//   weesp_04.gml, each containing at most 2500 records

var nen1878reader = require('./');
var fs = require('fs');
var miniminst = require('minimist');

var args = miniminst(process.argv.slice(2));
var inFilename = args['_'][0];
var baseFilename = args['_'][1] || 'out';
var split_on_count = args['split'];

var recordCount = 0;
var featureCount = 0;
var currentFile = 0;
var currentFd = null;


function openFile(filename) {
    var fd = fs.openSync(filename, 'w');

    // write header
    fs.writeSync(fd, '<?xml version="1.0" encoding="windows-1252" standalone="no"?>');
    fs.writeSync(fd, '<gml:FeatureCollection xmlns:gml="http://www.opengis.net/gml">');

    return fd;
}

function closeFile(fd) {
    // write footer
    fs.writeSync(fd, '</gml:FeatureCollection>');

    fs.closeSync(fd);
}


function pad(num, size) {
    var s = num + "";

    while (s.length < size) {
        s = "0" + s;
    }

    return s;
}


function xmlEscape(str) {
    return str.toString()
        .replace('&', '&amp;')
        .replace('<', '&lt;')
        .replace('>', '&gt;');
        // XXX: TODO: ' -> &apos;
        // XXX: TODO: " -> &quot;
}


function main() {
    var parser = new nen1878reader.Nen1878Parser();
    var reader = new nen1878reader.Nen1878FileReader(parser, inFilename);

    parser.on('record', onRecord);
    reader.on('end', onEnd);

    reader.start();
}

function pointToGml(point) {
    var gml = "<gml:Point srsName='urn:opengis:def:crs:EPSG::28992'><gml:pos srsDimension='2'>";
    gml += point.coordinates[0] + " " + point.coordinates[1];
    gml += "</gml:pos></gml:Point>";
    return gml;
}

function lineStringToGml(lineString) {
    var gml = "<gml:LineString srsName='urn:opengis:def:crs:EPSG::28992'><gml:posList srsDimension='2'>";
    for (var i = 0; i < lineString.coordinates.length; ++i) {
        var coord = lineString.coordinates[i];
        gml += coord[0] + " " + coord[1] + " ";
    }
    gml += "</gml:posList></gml:LineString>";
    return gml;
}

function onRecord(record) {
    recordCount += 1;

    if (!record.lkiCode) {
        return;
    }

    // open new file if needed
    if (!currentFd) {
        currentFd = openFile(baseFilename + '_' + pad(currentFile, 2) + '.gml');
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

        // write a gml:featureMember
        var gml = '<gml:featureMember>';
        gml += '<record' + record.recordType + ' gml:id="gbkn.' + baseFilename + '.' +recordCount + '">';

        // all attributes
        for (var key in feature.properties) {
            if (key == 'datum') {
                continue;
            }

            value = xmlEscape(feature.properties[key]);
            gml += '<' + key + '>' + value + '</' + key + '>';
        }

        // geometry
        gml += '<geom>';
        if (feature.geometry.type === 'Point') {
            gml += pointToGml(feature.geometry);
        } else if (feature.geometry.type === 'LineString') {
            gml += lineStringToGml(feature.geometry);
        }
        gml += '</geom>';

        gml += '</record' + record.recordType + '>';
        gml += '</gml:featureMember>';
        fs.writeSync(currentFd, gml);

        featureCount += 1;

        // open new file if needed
        if (split_on_count && featureCount % split_on_count === 0) {
            closeFile(currentFd);
            currentFd = null;
        }
    }
}

function onEnd() {
    closeFile(currentFd);
}

main();
