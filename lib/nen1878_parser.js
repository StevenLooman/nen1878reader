/* jslint node: true */
"use strict";

var events = require('events');
var util = require('util');


var coordinate = {};
function Nen1878Parser() {
    this.record = {};
    coordinate = {};
}


util.inherits(Nen1878Parser, events.EventEmitter);


var parser = {
    '01': function(line) {
        this.recordType      = parseInt(line.slice(0, 2), 10);
        this.bestandsnaam    = line.slice(3, 14);                                    // A (04-14) : (afgekorte) bestandsnaam (vrij invulbaar)
        this.type            = line.slice(14, 15);                                   // V: volledig betand, G: mutatie bestand
        this.datum           = new Date(line.slice(21, 25), line.slice(25, 27) - 1); // actualiteitsdatum van het bestand
        this.totaalBestanden = parseInt(line.slice(34, 36), 10);                     // aantal deelbestanden van de uitwisseling
        this.huidigBestand   = parseInt(line.slice(36, 38), 10);                     // huidig deelbestandsnummer
        this.productCode     = line.slice(38, 41);                                   // productcode voor GBKN
    },
    '02': function(line) {
        this.recordType = parseInt(line.slice(0, 2), 10);
    },
    '03': function(line) {
        this.recordType = parseInt(line.slice(0, 2), 10);

        var i;
        for (i = 2; i < 62; i += 10) {
            var subLine       = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            if (parser03[subRecordType]) {
                parser03[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '04': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2), 10);

        this.geometry04 = this.geometry04 || {};
        this.geometry04.coordinates = this.geometry04.coordinates || [];

        var i;
        for (i = 2; i < 62; i += 10) {
            var subLine       = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            if (parser04[subRecordType]) {
                parser04[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '05': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2), 10);

        this.geometry05 = this.geometry05 || {};
        this.geometry05.coordinates = this.geometry05.coordinates || [];

        var i;
        for (i = 2; i < 62; i += 10) {
            var subLine       = line.slice(i, i + 10);
            var subRecordType = subLine.slice(0, 1);
            if (parser05[subRecordType]) {
                parser05[subRecordType].apply(this, [ subLine ]);
            }
        }
    },
    '06': function(line) {
        this.recordType = this.recordType || parseInt(line.slice(0, 2), 10);

        this.lengteTekst = parseInt(line.slice(3, 5), 10); // veldlengte tekst, het maximum aantal posities is afhankelijk van de classificatiecode: 20 = puntobjecten, 40 = teksten
        this.tekst       = line.slice(6, 46); // tekst
    },
    '07': function(line) {
        this.recordType = parseInt(line.slice(0, 2), 10);
        var r           = line.slice(2, 3);

        parser07[r].apply(this, [ line ]);
    },
    '99': function(line) {
        this.recordType = parseInt(line.slice(0, 2), 10);
    }
};

var parser03 = {
    'M': function(subLine) {
        this.lkiCode = subLine.slice(1, 4); // LKI-classificatiecode
    },
    'G': function(subLine) {
        this.geometryType   = parseInt(subLine.slice(1, 3), 10); // soort van het geometrisch primitief: 01 = (knik)punt, 12 = string (2 punten of meer), 13 = cirkelboog door 3 punten
        this.zichtbaarheid  = parseInt(subLine.slice(4, 5), 10); // zichtbaarheid van object i.v.m. tekeninstructies: 0 = normaal / niet bekend, 1 = boven en onder maaiveld (Z-niveau), 2 = onzichtbaar vanuit de lucht, 3 = vaag of slecht interpreteerbaar
        this.wijzeInwinning = parseInt(subLine.slice(5, 6), 10); // wijze van inwinning: 0 = niet bekend (-), 1 = terrestrische meting (T), 2 = fotogrammetrische meting (F), 3 = digitalisering kaart (D), 4 = scanning kaart (S), 
        this.status         = parseInt(subLine.slice(6, 7), 10); // status van het object
    },
    'D': function(subLine) {
        this.datum = new Date(subLine.slice(1, 6), subLine.slice(6, 8) - 1, subLine.slice(8, 10)); // opnamedatum van het object
    },
    'B': function(subLine) {
        this.bron = subLine.slice(1, 6); // bronvermelding bij het object, bestaande uit: 1 afgekorte naam toegepaste inwinningstechniek zoals: TERR, FOTO, SCAN, 2: afgekorte naam van inwinnende instantie
    }
};

var parser04 = {
    'I': function(subLine) {
        // XXX: TODO: function should not be used as a member name; it even breaks Sonars parser
        coordinate.functie = parseInt(subLine.slice(1, 2), 10); // functie van het coördinaatpunt: 1 = eerste punt van een object, 2 = rechtlijnige verbinding met het vorige punt, 4 = cirkelboogverbinding met het vorige punt
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10), 10); // coördinaatgetal in millimeters
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10), 10); // coördinaatgetal in millimeters

        this.geometry04.coordinates.push(coordinate);
        coordinate = {};
    },
    'Q': function(subLine) {
        this.geometry04.precisieKlasse    = parseInt(subLine.slice(3, 4), 10);  // precisieklasse: 0 = onbekend (LKI-klasse 9), 1 = 1 cm, 2 = 5 cm, 3 = 12 cm, 4 = 23 cm, 5 = 46 cm, 6 = 100 cm, 7 = 250 cm
        this.geometry04.idealisatieKlasse = parseInt(subLine.slice(6, 7), 10);  // idealisatieklasse: 0 = onbekend (LKI-klasse 9), 1 = 0 - 2cm, 2 = 2 - 5cm, 3 = 5 - 10 cm, 4 = > 10cm
        this.geometry04.betrouwbaarheid   = parseInt(subLine.slice(9, 10), 10); // betrouwbaarheid
    }
};

var parser05 = {
    'F': function(subLine) {
        this.puntVanTekst   = parseInt(subLine.slice(1, 2), 10); // vast punt van tekst: 0 = plaats onbekend, 1 = linksonder
        this.status         = parseInt(subLine.slice(2, 3), 10); // status tekst of symbool: 1 = nieuw object, 4 = te verwijderen object
        this.tekstOfSymbool = parseInt(subLine.slice(3, 4), 10); // object is tekst of symbool: 1 = tekst, 2 = symbool
        this.symboolType    = subLine.slice(4, 10);              // symbooltype / schriftsoort: als symbooltype: open- / gesloten verharding: A (05-07) : symbooltype
    },
    'X': function(subLine) {
        coordinate.x = parseInt(subLine.slice(1, 10), 10); // coördinaatgetal in millimeters
    },
    'Y': function(subLine) {
        coordinate.y = parseInt(subLine.slice(1, 10), 10); // coördinaatgetal in millimeters

        this.geometry05.coordinates.push(coordinate);
        coordinate = {};
    },
    'K': function(subLine) {
        this.lkiCode = subLine.slice(1, 4); // LKI-classificatiecode
    }
};

var parser07 = {
    'N': function(line) {
        this.naamBeheerder          = line.slice(3, 38);  // naam beheerder
        this.identificatieBeheerder = line.slice(53, 61); // identificatie van beheerder
    },
    'A': function(line) {
        this.straatnaam             = line.slice(3, 27);  // straatnaam
        this.huisnummer             = line.slice(27, 32); // huisnummer
        this.huisnummerToevoeging   = line.slice(32, 37); // huisnummer toevoeging
        this.postcode               = line.slice(53, 59); // postcode van beheerder
    },
    'W': function(line) {
        this.vestigingsplaats       = line.slice(3, 27); // vestigingslaats van beheerder
    }
};


Nen1878Parser.prototype.parseLine = function(line) {
    var recordType   = line.slice(0, 2);
    var isLastRecord = line.slice(62, 64) === '01';

    var parserFunction = parser[recordType];
    if (parserFunction) {
        parserFunction.apply(this.record, [ line ]);
    } else {
        this.emit('error', 'Unknown record type: ' + recordType);
    }

    if (isLastRecord || recordType === '99') { // record type 99 does not have a record-ender-mark
        this.emit('record', this.record);
        this.record = {};
    }
};


module.exports = Nen1878Parser;
