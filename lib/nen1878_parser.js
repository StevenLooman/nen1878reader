var events = require('events');
var util = require('util');


util.inherits(Nen1878Parser, events.EventEmitter);


var coordinate = {};
function Nen1878Parser() {
    this.record = {};
    coordinate = {};
}


Nen1878Parser.prototype.parseLine = function(line) {
    var recordType = line.slice(0, 2);
    var isLastRecord = line.slice(62, 64) == '01';

    var parserFunction = parser[recordType];
    if (parserFunction) {
        parserFunction.apply(this.record, [ line ]);
    } else {
        this.emit('error', 'Unknown record type: ' + recordType);
    }

    if (isLastRecord || recordType == '99') { // record type 99 does not have a record-ender-mark
        this.emit('record', this.record);
        this.record = {};
    }
}


var parser = {
    '01': function(line) {
        this.recordType = parseInt(line.slice(0, 2));
        this.name = line.slice(3, 14);
        this.type = line.slice(14, 15);
        this.date = new Date(line.slice(21, 25), line.slice(25, 27) - 1);
        this.totalFiles = parseInt(line.slice(34, 36));
        this.currentFile = parseInt(line.slice(36, 38));
        this.productCode = line.slice(38, 41);
    },
    '02': function(line) {
        this.recordType = parseInt(line.slice(0, 2));
    },
    '03': function(line) {
        this.recordType = parseInt(line.slice(0, 2));

        for (var i = 2; i < 62; i += 10) {
            var subLine = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            if (parser03[subRecordType]) {
                parser03[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '04': function(line) {
        this.geometry = this.geometry || {};
        this.geometry.coordinates = this.geometry.coordinates || [];

        for (var i = 2; i < 62; i += 10) {
            var subLine = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            parser04[subRecordType].apply(this, [ subLine ]);
        }
    },
    '05': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2));

        this.geometry = this.geometry || {};
        this.geometry.coordinates = this.geometry.coordinates || [];

        for (var i = 2; i < 62; i += 10) {
            var subLine = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            parser05[subRecordType].apply(this, [ subLine ]);
        }
    },
    '06': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2));

        this.length = parseInt(line.slice(3, 5));
        this.text = line.slice(6, 46);
    },
    '07': function(line) {
        this.recordType = parseInt(line.slice(0, 2));
        var r = line.slice(2, 3);

        parser07[r].apply(this, [ line ]);
    },
    '99': function(line) {
        this.recordType = parseInt(line.slice(0, 2));
    }
};

var parser03 = {
    'M': function(subLine) {
        this.lkiCode = subLine.slice(1, 4);
    },
    'G': function(subLine) {
        this.geometryType = parseInt(subLine.slice(1, 3));
        this.visibility = parseInt(subLine.slice(4, 5));
        this.gathering = parseInt(subLine.slice(5, 6)); // inwinning
        this.status = parseInt(subLine.slice(6, 7));
    },
    'D': function(subLine) {
        this.date = new Date(subLine.slice(1, 6), subLine.slice(6, 8) - 1, subLine.slice(8, 10));
    },
    'B': function(subLine) {
        this.source = subLine.slice(1, 6);
    },
    ' ': function(subLine) { }
};

var parser04 = {
    'I': function(subLine) {
        coordinate.function = parseInt(subLine.slice(1, 2));
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10));
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10));
        this.geometry.coordinates.push(coordinate);

        coordinate = {
            // copy function from last
            function: coordinate.function
        };
    },
    'Q': function(subLine) {
        this.geometry.precision = parseInt(subLine.slice(3, 4));
        this.geometry.deviation = parseInt(subLine.slice(6, 7));
        this.geometry.reliability = parseInt(subLine.slice(9, 10));
    },
    ' ': function(subLine) { }
}

var parser05 = {
    'F': function(subLine) {
        // XXX: vast punt van tekst?
        this.status = parseInt(subLine.slice(2, 3));
        this.textOrSymbol = parseInt(subLine.slice(3, 4));
        this.symbolType = subLine.slice(4, 10);
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10));
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10));

        this.geometry.coordinates.push(coordinate);
        coordinate = {};
    },
    'K': function(subLine) {
        this.lkiCode = subLine.slice(1, 4);
    },
    ' ': function(subLine) {
    }
}

var parser07 = {
    'N': function(line) {
        this.name = line.slice(03, 38);
        this.id = line.slice(53, 61);
    },
    'A': function(line) {
        this.street = line.slice(03, 27),
        this.number = line.slice(27, 32),
        this.number_addition = line.slice(32, 37),
        this.zipcode = line.slice(53, 59)
    },
    'W': function(line) {
        this.city = line.slice(03, 27);
    }
}


module.exports = Nen1878Parser;
