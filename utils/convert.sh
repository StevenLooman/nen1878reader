#!/usr/bin/env sh

GEOJSON_DIR=geojson
SHAPE_DIR=shape
NEN2JSON=/Users/Steven/src/geo/nen1878reader/nen18782geojson.js


mkdir -p ${GEOJSON_DIR}
mkdir -p ${SHAPE_DIR}


for sfn_file in *.sfn; do
    basename="${sfn_file%.*}"
    mkdir -p ${GEOJSON_DIR}/${basename}

    # convert to geojson
    echo "Converting ${sfn_file} to GeoJSON"
    ${NEN2JSON} ${sfn_file} ${GEOJSON_DIR}/${basename}/out

    # convert from geojson to shp
    for geojson_file in ${GEOJSON_DIR}/${basename}/out_*.geojson; do
        shp_file_lines=${SHAPE_DIR}/${basename}_lines.shp
        shp_file_points=${SHAPE_DIR}/${basename}_points.shp

        echo "Converting ${geojson_file} to ${shp_file_lines}"
        ogr2ogr -f "ESRI Shapefile" ${shp_file_lines} ${geojson_file} -where "OGR_GEOMETRY='LineString'" -skipfailures -append
        T=`(ogrinfo -so ${shp_file_lines} ${basename}_lines | grep "Feature Count: 0")`
        HAS_LINES=$?
        if [ $HAS_LINES != 1 ]; then
            echo "Remove empty shape file"
            rm ${SHAPE_DIR}/${basename}_lines.*
        fi

        echo "Converting ${geojson_file} to ${shp_file_points}"
        ogr2ogr -f "ESRI Shapefile" ${shp_file_points} ${geojson_file} -where "OGR_GEOMETRY='Point'" -skipfailures -append
        T=`(ogrinfo -so ${shp_file_points} ${basename}_points | grep "Feature Count: 0")`
        HAS_POINTS=$?
        if [ $HAS_POINTS != 1 ]; then
            echo "Remove empty shape file"
            rm ${SHAPE_DIR}/${basename}_points.*
        fi
    done
done
