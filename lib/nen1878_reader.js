"use strict";

var events = require('events');
var util = require('util');
var fs = require('fs');


var LINE_SIZE = 64 + 2; // line size + \r\n


util.inherits(Nen1878Reader, events.EventEmitter);


function Nen1878Reader(parser, filename, bufferSize) {
    this.parser = parser;
    this.fd = fs.openSync(filename, 'r');
    this.bufferSize = (bufferSize || 1000) * LINE_SIZE;
}


Nen1878Reader.prototype.start = function() {
    var buffer = new Buffer(this.bufferSize);
    while (true) {
        var bytesRead = fs.readSync(this.fd, buffer, 0, buffer.length, null);

        if (bytesRead < 1) {
            break;
        }

        // split buffer to single lines
        var index = 0;
        while (index < bytesRead) {
            var line = buffer.slice(index, index + LINE_SIZE);
            line = line.slice(0, LINE_SIZE - 2); // cut off the \r\n
            line = line.toString();
            index += LINE_SIZE;

            this.parser.parseLine(line);
        }
    }

    fs.closeSync(this.fd);
    this.emit('end');
}


module.exports = Nen1878Reader;
