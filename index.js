/*
  maxConns: Number,        // Max number of connections per torrent (default=55)
  nodeId: String|Buffer,   // DHT protocol node ID (default=randomly generated)
  peerId: String|Buffer,   // Wire protocol peer ID (default=randomly generated)
  tracker: Boolean|Object, // Enable trackers (default=true), or options object for Tracker
  dht: Boolean|Object,     // Enable DHT (default=true), or options object for DHT
  webSeeds: Boolean        // Enable BEP19 web seeds (default=true)
*/

options = []
options.announceList = [
           [ 'ws://streamp2p.punto0.org:8000' ]
//         [ 'http://streamp2p.punto0.org:8000/announce' ],
//           [ 'http://streamp2p.punto0.org:6969/announce' ],
//         [ 'ws://tracker.btorrent.xyz' ],
//         [ 'wss://tracker.btorrent.xyzel25' ],
//         [ 'wss://tracker.fastcast.nzel32'],
//         [ 'wss://tracker.openwebtorrent.comee7'],
//         [ 'udp://tracker.internetwarriors.net:1337' ],
//         [ 'udp://tracker.leechers-paradise.org:6969' ],
//         [ 'udp://tracker.coppersurfer.tk:6969' ]
       ]

var WebTorrent = require('webtorrent')
var client = new WebTorrent()
var parseTorrent = require('parse-torrent')
// var fs = require('fs')

var cont = 0
var interval_connect

document.getElementById('play_torrent_files').addEventListener('change', play_torrent_file, false)
document.getElementById('seed_files').addEventListener('change', seed, false)
document.getElementById('magnet_form').addEventListener('submit', play_magnet, false)
document.getElementById('torrent_form').addEventListener('submit', play_torrent_url, false)

client.on('error', function (err) {
  alert(err) 
  log(err)
})

client.on('warning', function (err) {
  alert(err) 
  log(err)
})

function print_play_info(torrent) {
	document.querySelector('.play').innerHTML = '<strong>' + torrent.name + '</strong> -- Peers : '
                    +( torrent.numPeers ) + '</br>Downloaded : '
                    +( torrent.downloaded / 1024 ).toFixed(1) + ' kB -- Download Speed: '
                    +( torrent.downloadSpeed / 1024 ).toFixed(1) + ' kB/s -- Progress : '
                    +( torrent.progress * 100 ).toFixed(1) + '%</br> Uploaded : '
                    +( torrent.uploaded / 1024 ).toFixed(1) + ' kB -- Upload Speed: '
                    +( torrent.uploadSpeed / 1024 ).toFixed(1) + ' kB/s -- Time Remaining : '
                    +( torrent.timeRemaining / 1000 ).toFixed(1) + ' secs.' 
}

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
        torrent_add(torrentId); 
}

function play_torrent_url(e) {
	if (WebTorrent.WEBRTC_SUPPORT) {
		 // WebRTC is supported
	} else {
            alert('Tu explorador no soporta WebRTC');
            return ;
	}
       e.preventDefault() // Prevent page refresh
       var link = document.querySelector('form input[name=torrentURL]').value
       torrent_add(link);
} // Fin funcion

// botón seleccion de ficheros
function play_torrent_file(evt) {
        console.log('Play torrent file'); 
        if (WebTorrent.WEBRTC_SUPPORT) {
                 // WebRTC is supported
        } else {
            alert('Tu explorador no soporta WebRTC')
            return
        }
        var files = evt.target.files; // FileList object
        if ( files.length == 0 ) return
        parseTorrent.remote(files[0], function (err, parsedTorrent) {
            if (err) throw err
            torrent_add(parsedTorrent);
        }) 
}

/* Opciones de client.add : 
  announce: [],              // Torrent trackers to use (added to list in .torrent or magnet uri)
  getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
  maxWebConns: Number,       // Max number of simultaneous connections per web seed [default=4]
  path: String,              // Folder to download files to (default=`/tmp/webtorrent/`)
  store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
*/
function torrent_add(name) {
    log('Adding ' + name);
    client.add(name, options, torrent_download);
    cont = 0;
    interval_connect = setInterval(function () {
        cont++;
        document.querySelector('.play').innerHTML = 'Conectando al tracker... ' + cont;
    }, 1000);
}

function torrent_download(torrent) {
        // Got torrent metadata!
        clearInterval(interval_connect);
        log('Got torrent Metadata in ' + cont + ' secs');
        print_play_info(torrent);
        log('Torrent info hash: ' + torrent.infoHash + ' ' +
            '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
            '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
           )
        // Render all files into to the page
        log('Client is downloading:', torrent.infoHash)
        torrent.files.forEach(function (file) {
            // Display the file by appending it to the DOM. Supports video, audio, images, and
            // more. Specify a container element (CSS selector or reference to DOM node).
            log('appending ' + file.name);
            file.appendTo('.screen', function (err, elem) {
  		if (err) throw err // file failed to download or display in the DOM
		log('New DOM node with the content' + elem)
	    })
        }) 

        torrent.on('done', function () {
            torrent.files.forEach(function (file) {
                file.getBlobURL(function (err, url) {
                    if (err) return log(err.message)
                    var str = '<a href="' + url + '">Download full file: ' + file.name + '</a>';
                    var p = document.createElement('p');
                    p.innerHTML = str;
                    document.querySelector('.screen').appendChild(p);
                })
            })
/*
            var song = document.getElementsByTagName('audio')[0];
            song.onended = function() {
	            alert("The audio has ended");
                    log("La cancion ha terminado, hay que introducir la siguiente...");
            }
*/
            // Refresca stats de vez en cuando  
            interval_connect = setInterval(function () {
                print_play_info(torrent);
            }, 10000);
        })

        torrent.on('noPeers', function (announceType) {
            // alert(torrent.name + ' No peers found ' + announceType);
            log(torrent.name + ' No peers found ' + announceType);
        })
        
        torrent.on('download', function (bytes) {
            print_play_info(torrent);
        })

	torrent.on('upload', function (bytes) {
            print_play_info(torrent);
	})

	torrent.on('wire', function (wire) {
            // log(torrent.name + ' New peer conneccted');
            print_play_info(torrent);
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
        );

        torrent.on('done', function () {
          log('Seeding. Progress: 100%')
        });
        // Esto hay que cambiar para multificheros. 
       	var output = [];
        var interval_seeding = setInterval(function () {
	        output=[]
       		output.push('<li>Seeding :<strong>',torrent.name,'</strong></br> Peers : '
                    ,(torrent.numPeers),' -- Uploaded : '
                    ,(torrent.uploaded / 1024).toFixed(2),' kB -- Upload Speed: '
                    ,(torrent.uploadSpeed / 1024).toFixed(2),' kB/s </li>');   
	         document.querySelector('.seed').innerHTML = '<ul>' + output.join('') + '</ul>';
        }, 1000);
        upload_torrent(torrent);
};

// Save torrent 
function upload_torrent(torrent) {
    var name = torrent.files[0].name + '.torrent';
    // Get the blob. torrent.torrentFiles no genera un archivo valido
    var blobUrl = torrent.torrentFileBlobURL;
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';
    xhr.onload = function() {
        var blob = xhr.response;
        // var file = new File(blob, name, { type: "application/x-bittorrent" } );
        log("Uploading torrent for file " + name + " -- " + blob.name + " -- " + blob.type + " -- " + blob.size + " bytes");
        var fd = new FormData();
        fd.append("data", blob, name); 
        // Set up the request.
        var xhr2 = new XMLHttpRequest();
        // Open the connection.
        xhr2.open('POST', 'http://streamp2p.punto0.org/upload.php', true);
        xhr2.onerror = function(e) {
            alert("Error " + e.target.status + " occurred while posting the torrent.");
        };
        xhr2.onreadystatechange = function() {//Call a function when the state changes.
             console.log("Response : " + xhr2.responseText); //check if the data was received successfully.
        }; 
        xhr2.send(fd);
    };
    xhr.open('GET', blobUrl);
    xhr.send();
};

/*
    // Set up a handler for when the request finishes.
    xhr.onload = function () {
        if (xhr.status === 200) {
            // File(s) uploaded.
            log('file uploaded');
        } else {
            log('An error occurred uploading the file! Error ' + xhr.status);
        }
    }
    };
*/

function log (str) {
        var p = document.createElement('p');
        p.innerHTML = str;
        document.querySelector('.log').appendChild(p);
        console.log(str);
}
