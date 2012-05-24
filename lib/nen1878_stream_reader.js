"use strict";

var events = require('events');
var util = require('util');


var LINE_SIZE = 64 + 2; // line size + \r\n


util.inherits(Nen1878StreamReader, events.EventEmitter);


function Nen1878StreamReader(parser, stream) {
    this.parser = parser;
    this.stream = stream;
    this.stream.pause();
}


Nen1878StreamReader.prototype.start = function() {
    this.restBuffer = null;
    this.stream.on('data', this.onData.bind(this));
    this.stream.on('end', this.onEnd.bind(this));
    this.stream.resume();
}

Nen1878StreamReader.prototype.onData = function(data) {
    var index = 0;
    while (data.length >= index + LINE_SIZE) {
        var line;
        if (this.restBuffer) {
            // read what is in the rest buffer plus the rest of current buffer
            var restSize = LINE_SIZE - this.restBuffer.length;
            line = this.restBuffer.toString('utf8') + data.toString('utf8', 0, restSize);
            index = restSize;
            this.restBuffer = null;
        } else {
            line = data.toString('utf8', index, index + LINE_SIZE);
        }
        line = line.slice(0, LINE_SIZE - 2); // cut off the \r\n
        line = line.toString();
        index += LINE_SIZE;

        this.parser.parseLine(line);
    }

    // data left? save it for later
    if (index != data.length) {
        this.restBuffer = data.slice(index);
    }
}

Nen1878StreamReader.prototype.onEnd = function() {
    this.emit('end');
}


module.exports = Nen1878StreamReader;
