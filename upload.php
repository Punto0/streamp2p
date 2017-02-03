<?php
print "Content-type: text/html\n\n";
// pull the raw binary data from the POST array
//$data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
error_log(print_r($_FILES));
$name = $_FILES['data']['name'];
if ( move_uploaded_file($_FILES['data']['tmp_name'], "./torrents/{$name}" ) ) {  
    // Add to the feed
    $rss_file = "./feedtest.xml";
    $cont = 0;
    if (file_exists($rss_file)) {
        $file = fopen($rss_file,'r');
        while(!feof($file)) {
            // $name = fgets($file);
            $lineas[] = fgets($file);
            $cont = $cont +1;
        }
        fclose($file);
        // $lineas_array = implode("\n", $lineas);
        // print_r($_lineas_array);
        // print "\n -- linea borrada : ";
        // print_r($lineas[$cont -2]);
        unset($lineas[$cont -2]);
        // print "\n -- linea borrada : ";
        // print_r($lineas[$cont - 1]);
        unset($lineas[$cont - 1]);
    } else {
        // header("Content-Type: application/rss+xml; charset=ISO-8859-1");
        // error_log("File no existe");
        $lineas[] = "<?xml version='1.0' encoding='ISO-8859-1'?>";
        $lineas[] = "\n<rss version='2.0'>";
        $lineas[] = "\n<channel>";
        $lineas[] = "\n<title>Torrent feed</title>";
        $lineas[] = "\n<link>http://streamp2p.punto0.org</link>";
        $lineas[] = "\n<description>Esto es un feed de archivos torrent disponibles en WebRTC. Difunde!</description>";
        $lineas[] = "\n<language>es-es</language>";
        $lineas[] = "\n<copyright>Copyright (C) 2017 streamp2p.punto0.org</copyright>";
        // error_log(print_r($lineas));
    }
    // print "\n Lineas leido/creado \n";
    // print_r($lineas);
    // print "\n --- \n";
    $lineas[] = "\n<item>\n";
    $lineas[] = '<title>' . $name . '</title>';
    $lineas[] = "\n<description>Torrent WebRTC feed.</description>\n";
    $lineas[] = '<link>http://streamp2p.punto0.org/torrents/' . $name . '</link>';
//  $lineas .= '<pubDate>' . date("D, d M Y H:i:s O", strtotime(getdate())) . '</pubDate>';
    $lineas[] = "\n</item>";
    $lineas[] = "\n</channel>";
    $lineas[] = "\n</rss>";
    // print "\n Lineas final : \n";
    // print_r($lineas);
    // print "\n --- \n";
    file_put_contents($rss_file, implode("", $lineas));
    // Update the database
} else {
	print '<p> One error has been ocurred </p>';
	switch ($_FILES['data']['error'])
 	{  case 1:
           print '<p> The file is bigger than this PHP installation allows</p>';
           break;
           case 2:
           print '<p> The file is bigger than this form allows</p>';
           break;
           case 3:
           print '<p> Only part of the file was uploaded</p>';
           break;
           case 4:
           print '<p> No file was uploaded</p>';
           break;
	}
}
print "OK" ;
?>
