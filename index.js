/*
  maxConns: Number,        // Max number of connections per torrent (default=55)
  nodeId: String|Buffer,   // DHT protocol node ID (default=randomly generated)
  peerId: String|Buffer,   // Wire protocol peer ID (default=randomly generated)
  tracker: Boolean|Object, // Enable trackers (default=true), or options object for Tracker
  dht: Boolean|Object,     // Enable DHT (default=true), or options object for DHT
  webSeeds: Boolean        // Enable BEP19 web seeds (default=true)
*/

var parseTorrent = require('parse-torrent')
var WebTorrent = require('webtorrent')

var client = new WebTorrent()

var cont = 0
var interval_connect

document.getElementById('files').addEventListener('change', seed, false)
document.getElementById('magnet_form').addEventListener('submit', play_magnet, false)
document.getElementById('torrent_form').addEventListener('submit', play_torrent, false)

client.on('error', function (err) {
  alert(err) 
  log(err)
})

function play_magnet(e) {
       console.log('play_magnet')
	if (WebTorrent.WEBRTC_SUPPORT) {
		 // WebRTC is supported
	} else {
            alert('Tu explorador no soporta WebRTC')
            return 
	}
        e.preventDefault() // Prevent page refresh
        var torrentId = document.querySelector('form input[name=torrentId]').value
        console.log('Adding : ' + torrentId )
/*
  announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
  getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
  maxWebConns: Number,       // Max number of simultaneous connections per web seed [default=4]
  path: String,              // Folder to download files to (default=`/tmp/webtorrent/`)
  store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
*/
       if ( client.add(torrentId, torrent_download) != 0 ) {
	       interval_connect = setInterval(function () {
        	  cont++
	          document.querySelector('.play').innerHTML = 'Adding File. </br>Esperando peers ' + cont;
       	       }, 1000)
       }
}

function play_torrent(e) {
	if (WebTorrent.WEBRTC_SUPPORT) {
		 // WebRTC is supported
	} else {
            alert('Tu explorador no soporta WebRTC');
            return ;
	}
       e.preventDefault() // Prevent page refresh
       var link = document.querySelector('form input[name=torrentURL]').value
       log("Adding torrent : " + link);
                options = []
                var ann_list = [
                        [ 'ws://streamp2p.punto0.org:8000' ],
//                      [ 'ws://tracker.btorrent.xyz' ],
//                        [ 'wss://tracker.btorrent.xyzel25' ],
//                        [ 'wss://tracker.fastcast.nzel32'],
//                        [ 'wss://tracker.openwebtorrent.comee7'],
                        [ 'http://streamp2p.punto0.org:6969/announce' ],
//                      [ 'http://streamp2p.punto0.org:8000/announce' ],
//                      [ 'udp://tracker.internetwarriors.net:1337' ],
//                      [ 'udp://tracker.leechers-paradise.org:6969' ],
//                      [ 'udp://tracker.coppersurfer.tk:6969' ]
                ]
                options.announceList = ann_list

       client.add(link, options, torrent_download);
       interval_connect = setInterval(function () {
                    cont++;
                    document.querySelector('.play').innerHTML = 'Adding File. </br>Esperando peers ' + cont;
       }, 1000);
} // Fin funcion

function torrent_download(torrent) {
        clearInterval(interval_connect)
        log('Got torrent metadata! Connected in ' + ( cont / 10) + ' secs')
        log(
          'Torrent info hash: ' + torrent.infoHash + ' ' +
          '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
          '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
           )

        // Print out progress
        var interval = setInterval(function () {
               document.querySelector('.play').innerHTML = '<strong>' + torrent.name + '</strong> -- Peers : '
                    +( torrent.peersLength | '0' ) + '</br>Downloaded : '
                    +( torrent.downloaded / 1024 ).toFixed(2) + ' kB -- Download Speed: '
                    +( torrent.downloadSpeed / 1024 ).toFixed(2) + ' kB/s -- Progress : '
                    +( torrent.progress * 100 ).toFixed(1) + '%</br> Uploaded : '
                    +( torrent.uploaded / 1024 ).toFixed(2) + ' kB -- Upload Speed: '
                    +( torrent.uploadSpeed / 1024 ).toFixed(2) + ' kB/s'
         }, 500)

        // Render all files into to the page
        torrent.files.forEach(function (file) {
          file.appendTo('.screen', function (err, elem) {
  		if (err) throw err // file failed to download or display in the DOM
		console.log('New DOM node with the content', elem)
		})
      
          file.getBlobURL(function (err, url) {
            if (err) return log(err.message)
            log('File done.');
            var str = '<a href="' + url + '">Download full file: ' + file.name + '</a>';
            var p = document.createElement('p');
            p.innerHTML = str;
            document.querySelector('.screen').appendChild(p);
          })

         torrent.on('done', function () {
          log(torrent.name + 'Progress: 100%')
          clearInterval(interval)
        })
 
          var song = document.getElementsByTagName('audio')[0];
	  song.onended = function() {
	    alert("The audio has ended");
            log("La cancion ha terminado, hay que introducir la siguiente...")
          }

	  })
}

// Seeding

// botón seleccion de ficheros 
function seed(evt) {
	console.log('Seed request');
        if (WebTorrent.WEBRTC_SUPPORT) {
                 // WebRTC is supported
        } else {
            alert('Tu explorador no soporta WebRTC')
            return
        }
        var file = evt.target.files; // FileList object
        start_seeding(file)
}

function start_seeding (files) {
	if (files.length === 0) return
	log('Seed ' + files.length + ' files')
	if (window.File && window.FileReader && window.FileList && window.Blob) {
   	// Seed from WebTorrent
/*
  name: String,            // name of the torrent (default = basename of `path`, or 1st file's name)
  comment: String,         // free-form textual comments of the author
  createdBy: String,       // name and version of program used to create torrent
  creationDate: Date       // creation time in UNIX epoch format (default = now)
  private: Boolean,        // is this a private .torrent? (default = false)
  pieceLength: Number      // force a custom piece length (number of bytes)
  announceList: [[String]] // custom trackers (array of arrays of strings) (see [bep12](http://www.bittorrent.org/beps/bep_0012.html))
  urlList: [String]        // web seed urls (see [bep19](http://www.bittorrent.org/beps/bep_0019.html))
                           [{'Phone':'10%','Name':'10%'},{},{}]
*/ 
	        options = [] 
        	var ann_list = [
             		[ 'ws://streamp2p.punto0.org:8000' ],
//			[ 'ws://tracker.btorrent.xyz' ],
//                        [ 'wss://tracker.btorrent.xyzel25' ],
//                        [ 'wss://tracker.fastcast.nzel32'],
//                        [ 'wss://tracker.openwebtorrent.comee7'],
	            	[ 'http://streamp2p.punto0.org:6969/announce' ],
//			[ 'http://streamp2p.punto0.org:8000/announce' ],
//			[ 'udp://tracker.internetwarriors.net:1337' ],
//			[ 'udp://tracker.leechers-paradise.org:6969' ],
//			[ 'udp://tracker.coppersurfer.tk:6969' ]
	        ]
        	options.announceList = ann_list
//	        options.announce = ann_list // Hace que salgan doblados los trackers
		client.seed(files, options, torrent_seed);
	} else {
        	alert('The File APIs are not fully supported in this browser.');
        	log('The File APIs are not fully supported in this browser.');
	}
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
        output.push('<li>Making torrent for file : <strong>',escape(f.name),'</strong> -- '
                      ,f.type + '</li>');   
  }
  document.querySelector('.seed').innerHTML = '<ul>' + output.join('') +'</ul>'
}

function torrent_seed (torrent) {
        log(
          'Torrent info hash: ' + torrent.infoHash + ' ' +
          '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
          '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
        )

        torrent.on('done', function () {
          log('Seeding. Progress: 100%')
        })
        // Esto hay que cambiar para multificheros. 
       	var output = [];
        var interval_seeding = setInterval(function () {
	        output=[]
       		output.push('<li>Seeding :<strong>',torrent.name,'</strong></br> Peers : '
                    ,(torrent.peersLength | '0'),' -- Uploaded : '
                    ,(torrent.uploaded / 1024).toFixed(2),' kB -- Upload Speed: '
                    ,(torrent.uploadSpeed / 1024).toFixed(2),' kB/s </li>');   
	         document.querySelector('.seed').innerHTML = '<ul>' + output.join('') + '</ul>';
        }, 1000)
}

function log (str) {
        var p = document.createElement('p');
        p.innerHTML = str;
        document.querySelector('.log').appendChild(p);
        console.log(str);
}
