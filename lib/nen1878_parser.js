"use strict";

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
        this.name = line.slice(3, 14); // A (04-14) : (afgekorte) bestandsnaam (vrij invulbaar)
        this.type = line.slice(14, 15); // V: volledig betand, G: mutatie bestand
        this.date = new Date(line.slice(21, 25), line.slice(25, 27) - 1); // actualiteitsdatum van het bestand
        this.totalFiles = parseInt(line.slice(34, 36)); // aantal deelbestanden van de uitwisseling
        this.currentFile = parseInt(line.slice(36, 38)); // huidig deelbestandsnummer
        this.productCode = line.slice(38, 41); // productcode voor GBKN
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
            if (parser04[subRecordType]) {
                parser04[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '05': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2));

        this.geometry = this.geometry || {};
        this.geometry.coordinates = this.geometry.coordinates || [];

        for (var i = 2; i < 62; i += 10) {
            var subLine = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            if (parser05[subRecordType]) {
                parser05[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '06': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2));

        this.length = parseInt(line.slice(3, 5)); // veldlengte tekst, het maximum aantal posities is afhankelijk van de classificatiecode: 20 = puntobjecten, 40 = teksten
        this.text = line.slice(6, 46); // tekst
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
        this.lkiCode = subLine.slice(1, 4); // LKI-classificatiecode
    },
    'G': function(subLine) {
        this.geometryType = parseInt(subLine.slice(1, 3)); // soort van het geometrisch primitief: 01 = (knik)punt, 12 = string (2 punten of meer), 13 = cirkelboog door 3 punten
        this.visibility = parseInt(subLine.slice(4, 5)); // zichtbaarheid van object i.v.m. tekeninstructies: 0 = normaal / niet bekend, 1 = boven en onder maaiveld (Z-niveau), 2 = onzichtbaar vanuit de lucht, 3 = vaag of slecht interpreteerbaar
        this.gathering = parseInt(subLine.slice(5, 6)); // wijze van inwinning: 0 = niet bekend (-), 1 = terrestrische meting (T), 2 = fotogrammetrische meting (F), 3 = digitalisering kaart (D), 4 = scanning kaart (S), 
        this.status = parseInt(subLine.slice(6, 7)); // status van het object
    },
    'D': function(subLine) {
        this.date = new Date(subLine.slice(1, 6), subLine.slice(6, 8) - 1, subLine.slice(8, 10)); // opnamedatum van het object
    },
    'B': function(subLine) {
        this.source = subLine.slice(1, 6); // bronvermelding bij het object, bestaande uit: 1 afgekorte naam toegepaste inwinningstechniek zoals: TERR, FOTO, SCAN, 2: afgekorte naam van inwinnende instantie
    }
};

var parser04 = {
    'I': function(subLine) {
        coordinate.function = parseInt(subLine.slice(1, 2)); // functie van het coördinaatpunt: 1 = eerste punt van een object, 2 = rechtlijnige verbinding met het vorige punt, 4 = cirkelboogverbinding met het vorige punt
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10)); // coördinaatgetal in millimeters
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10)); // coördinaatgetal in millimeters
        this.geometry.coordinates.push(coordinate);

        coordinate = {
            // copy function from last
            function: coordinate.function
        };
    },
    'Q': function(subLine) {
        this.geometry.precision = parseInt(subLine.slice(3, 4)); // precisieklasse: 0 = onbekend (LKI-klasse 9), 1 = 1 cm, 2 = 5 cm, 3 = 12 cm, 4 = 23 cm, 5 = 46 cm, 6 = 100 cm, 7 = 250 cm
        this.geometry.deviation = parseInt(subLine.slice(6, 7)); // idealisatieklasse: 0 = onbekend (LKI-klasse 9), 1 = 0 - 2cm, 2 = 2 - 5cm, 3 = 5 - 10 cm, 4 = > 10cm
        this.geometry.reliability = parseInt(subLine.slice(9, 10)); // betrouwbaarheid
    }
}

var parser05 = {
    'F': function(subLine) {
        this.pointOrText = parseInt(subLine.slice(1, 2)); // vast punt van tekst: 0 = plaats onbekend, 1 = linksonder, zie toelichting
        this.status = parseInt(subLine.slice(2, 3)); // status tekst of symbool: 1 = nieuw object, 4 = te verwijderen object
        this.textOrSymbol = parseInt(subLine.slice(3, 4)); // object is tekst of symbool: 1 = tekst, 2 = symbool
        this.symbolType = subLine.slice(4, 10); // symbooltype / schriftsoort: als symbooltype: open- / gesloten verharding: A (05-07) : symbooltype
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10)); // coördinaatgetal in millimeters
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10)); // coördinaatgetal in millimeters

        this.geometry.coordinates.push(coordinate);
        coordinate = {};
    },
    'K': function(subLine) {
        this.lkiCode = subLine.slice(1, 4); // LKI-classificatiecode
    }
}

var parser07 = {
    'N': function(line) {
        this.name = line.slice(3, 38); // naam beheerder
        this.id = line.slice(53, 61); // identificatie van beheerder
    },
    'A': function(line) {
        this.street = line.slice(3, 27), // straatnaam
        this.number = line.slice(27, 32), // huisnummer
        this.number_addition = line.slice(32, 37), // huisnummer toevoeging
        this.zipcode = line.slice(53, 59) // postcode van beheerder
    },
    'W': function(line) {
        this.city = line.slice(3, 27); // vestigingslaats van beheerder
    }
}


module.exports = Nen1878Parser;
