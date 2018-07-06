<?php
/**
 * UTD Grades JSON File Linker
 * @author Jeffrey Wang (@jeffw16)
*/

$json_filename = 'fall2018';

$res_json = fopen( 'static/' . $json_filename . '.json', 'r' );
$res_comp_read = fopen( 'static/complete.json', 'r' );
$res_comp_write = fopen( 'static/complete.json', 'w' );

$arr = json_decode(fread($res_comp_read), true);
$narr = json_decode(fread($res_json), true);

$combo = array_merge($arr, $narr);

fwrite( $res_json, json_encode( $combo ) );
