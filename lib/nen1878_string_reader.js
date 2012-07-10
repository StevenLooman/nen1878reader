"use strict";

var events = require('events');
var util = require('util');
var fs = require('fs');


var LINE_SIZE = 64 + 2; // line size + \r\n


util.inherits(Nen1878StringReader, events.EventEmitter);


function Nen1878StringReader(parser, string) {
    this.parser = parser;
    this.string = string;
}


Nen1878StringReader.prototype.start = function() {
    var index = 0;
    while (index < this.string.length) {
        // split buffer to single lines
        var line = this.string.slice(index, index + LINE_SIZE);
        line = line.slice(0, LINE_SIZE - 2); // cut off the \r\n
        line = line.toString();
        index += LINE_SIZE;

        this.parser.parseLine(line);
    }

    this.emit('end');
};


module.exports = Nen1878StringReader;
