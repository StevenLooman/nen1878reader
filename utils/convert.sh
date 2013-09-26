#!/usr/bin/env sh

GEOJSON_DIR=/Users/Steven/src/geo/nen1878reader/test_data/1
SHAPE_DIR=/Users/Steven/src/geo/nen1878reader/test_data/2
NEN2JSON=/Users/Steven/src/geo/nen1878reader/nen18782geojson.js


mkdir -p ${GEOJSON_DIR}
mkdir -p ${SHAPE_DIR}


for sfn_file in *.sfn; do
    basename="${sfn_file%.*}"
    mkdir -p ${GEOJSON_DIR}/${basename}

    # convert to geojson
    echo "Converting ${sfn_file} to GeoJSON"
    ${NEN2JSON} ${GEOJSON_DIR}/${basename}/out < ${sfn_file}

    # convert from geojson to shp
    for geojson_file in ${GEOJSON_DIR}/${basename}/out_*.geojson; do
        shp_file_lines=${SHAPE_DIR}/${basename}_lines.shp
        shp_file_points=${SHAPE_DIR}/${basename}_points.shp

        echo "Converting ${geojson_file} to ${shp_file_lines}"
        if [ ! -f ${shp_file_lines} ]; then
            ogr2ogr -f "ESRI Shapefile" ${shp_file_lines} ${geojson_file} -where "OGR_GEOMETRY='LineString'"
        else
            ogr2ogr -append -f "ESRI Shapefile" ${shp_file_lines} ${geojson_file} -where "OGR_GEOMETRY='LineString'"
        fi

        echo "Converting ${geojson_file} to ${shp_file_points}"
        if [ ! -f ${shp_file_points} ]; then
            ogr2ogr -f "ESRI Shapefile" ${shp_file_points} ${geojson_file} -where "OGR_GEOMETRY='Point'"
        else
            ogr2ogr -append -f "ESRI Shapefile" ${shp_file_points} ${geojson_file} -where "OGR_GEOMETRY='Point'"
        fi
    done
done
