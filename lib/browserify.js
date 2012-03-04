var nen1878reader = {
    GeoJson: require('./geojson'),
    Nen1878Parser: require('./nen1878_parser'),
    Nen1878StringReader: require('./nen1878_string_reader'),
};

// assume this script is run in a function with context as first argument
window.nen1878reader = nen1878reader;
