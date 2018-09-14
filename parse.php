<?php
/**
 * UTD Grades Parser
 * @author Jeffrey Wang (@jeffw16)
*/

$csv_filename = 'UT Dallas Summer 2018 Grade Distributions';
$json_filename = 'summer2018';
$term = '2018 Summer';

$res_csv = fopen( 'static/' . $csv_filename . '.csv', 'r' );
$res_json = fopen( 'static/' . $json_filename . '.json', 'w' );

$arr = array();
$csv_line = array();
while ( ( $csv_line = fgetcsv( $res_csv ) ) !== false ) {
  $arr[] = $csv_line;
}
// print_r($arr);
$narr = array();

// start at 3rd row because the first two rows contain introductory background info and key
for ( $i = 2; $i < count( $arr ); $i++ ) {
  $linearr['term'] = $term;
  $linearr['prof'] = $arr[$i][0]; // primary professor
  $linearr['subj'] = $arr[$i][6];
  $linearr['num'] = $arr[$i][7];
  $linearr['sect'] = $arr[$i][8];
  $linearr['desc'] = null;
  $linearr['grades'] = array();
  for ( $j = 9; $j <= 27; $j++ ) {
    if ( $arr[$i][$j] != '' && !empty($arr[$i][$j]) && $arr[$i][$j] !== null ) {
      $linearr['grades'][$arr[1][$j]] = $arr[$i][$j];
    }
  }
  $narr[] = $linearr;
}

fwrite( $res_json, json_encode( $narr ) );
