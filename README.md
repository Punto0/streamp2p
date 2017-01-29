# streamp2p

## Descripción

Este repo es un prototipo en desarrollo para construir:

 * Una plataforma de distribución y entrega de contenidos audiovisuales. 
 * Dos usos diferenciados: streaming en tiempo real (radio) y streaming de podcasts (bajo demanda).
 * Abierta y soft libre.
 * Autogestionada, un nodo debería de poder gestionarlo un usario normal con un computador con una conexión casera, mínimo de vps's necesarios. 
 * Federada y resiliente, la caída de un nodo no debe afectar al servicio ni a la disponibilidad de los contenidos (censura).
 * User-Friendly, personas sin conocimientos específicos de informática deberían de poder publicar y distribuir sus trabajos sin problemas a través de una interfaz amigable.

Usuarios potenciales : Radios Libres, distris y editoras de música alternativa, grupos de música, streaming de eventos, ...

De momento estamos experimentando con ficheros de audio y Web torrent : https://webtorrent.io/ https://github.com/feross/webtorrent

## Pruebas

### Site

Hay una página de prueba en :         http://streamp2p.punto0.org
Tracker de prueba (webRTC ready) :    ws://streamp2p.punto0.org:8000
Estadísticas del tracker de prueba :  http://streamp2p.punto0.org:8000/stats
Opentracker :                         http://streamp2p.punto0.org:6969/announce
Opentracker stats :                   http://streamp2p.punto0.org:6969/stats

### Install

 0. $ sudo apt install nodejs npm
 1. Instala dependencias : npm install webtorrent browserify
 2. browserify index.js -o bundle.js
 3. Copia index.html y bundle.js al directorio público de un servidor html.
 4. Instala un tracker ( Opcional ):
    1. npm install bittorrent-tracker
    2. $ bittorrent-tracker

### Notas sobre las pruebas :

 * No admite la descarga de ficheros en formato no streaming de tamaño superior a 200Mb (en decimal).
 * Sólo reproduce antes de terminar de descargar el archivo en formato mp4, no ogg ni mp3. Limitación de los exploradores.
 * Hay formatos de mp4 que petan el repoductor DOM. Codec audio AAC va fino en Firefox 45 en Debian Jessie. No es necesario que haya video. webm no funciona.
 * El tiempo de conexión depende mucho de los trackers y del orden de la lista de trackers qu se proporciona en l torrent o magnet, va probando secuencialmente dicha lista. En los torrents de prueba usamos un único tracker en esta misma máquina. Un tracker fallido son entre 20 y 30 segundos de retardo en el inicio de la descarga.
 * Entre los trackers incluídos por defecto en webtorrent hay varios caídos, hay que suministrar nuestra propia lista de trackers. Los trackers son la parte más centralizada y vulnerable del sistema.
     * monitoreo de trackers y reparto de carga dns? 
     * sistema dns de autoradio pero con trackers en vez de servers?
 * Los torrents creados a partir del mismo archivo son equivalentes, aunque tengan otros trackers definidos o cambie el nombre del fichero o del torrent. Tienen el mismo infoHash.
