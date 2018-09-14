<?php
/**
 * UTD Grades JSON File Linker
 * @author Jeffrey Wang (@jeffw16)
*/

$json_filename = 'spring2018';

$res_json = fopen( 'static/' . $json_filename . '.json', 'r' );
$res_comp_read = fopen( 'static/complete.json', 'r' );
#$res_comp_write = fopen( 'static/complete.json', 'w' );

$arr = json_decode(fread($res_comp_read, filesize('static/complete.json')), true);
$narr = json_decode(fread($res_json, filesize('static/' . $json_filename . '.json')), true);

$combo = array_merge($arr, $narr);

$res_comp_write = fopen( 'static/complete.json', 'w' );
fwrite( $res_json, json_encode( $combo ) );
