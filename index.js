var client = new WebTorrent()
var cont = 0
var interval_connect

document.getElementById('files').addEventListener('change', seed, false)
document.querySelector('form').addEventListener('submit', play, false)

client.on('error', function (err) {
   log(err)
})

function play(e) {
       e.preventDefault() // Prevent page refresh
       var torrentId = document.querySelector('form input[name=torrentId]').value
       log('Adding ' + torrentId)
       log('Se paciente, puede tardar en conectar hasta unos minutos...')
       client.add(torrentId, torrent_play)
       interval_connect = setInterval(function () {
          // log(cont + 'sec')
          cont++
        }, 1)
}

function torrent_play (torrent) {
        clearInterval(interval_connect)
        log('Got torrent metadata! Connected in ' + cont + ' msecs')
        log(
          'Torrent info hash: ' + torrent.infoHash + ' ' +
          '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
          '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
           )

        // Print out progress
        var interval = setInterval(function () {
          //log('Progress: ' + (torrent.progress * 100).toFixed(1) + '%')
        output=[]
       	output.push('<li>Progress:<strong>',torrent.name,'</strong> -- Peers : '
                    ,torrent.peersLength | '0',' -- Uploaded : '
                    ,torrent.downloaded,' kb -- Upload Speed: '
                    ,torrent.downloadSpeed,' kb/s -- Progress : '
                    ,(torrent.progress * 100).toFixed(1) + '% </li>')    
         document.getElementById('form').innerHTML = '<ul>' + output.join('') + '</ul>';
         }, 1000)

        torrent.on('done', function () {
          log('Progress: 100%')
          clearInterval(interval)
        })

        // Render all files into to the page
        torrent.files.forEach(function (file) {
          file.appendTo('.log')
          log('(Blob URLs only work if the file is loaded from a server. "http//localhost" works. "file://" does not.)')
          file.getBlobURL(function (err, url) {
            if (err) return log(err.message)
            log('File done.')
            log('<a href="' + url + '">Download full file: ' + file.name + '</a>')
          })
        })
}

// Seeding

// botón seleccion de ficheros 
function seed(evt) {
	console.log('Seed request');
        var file = evt.target.files; // FileList object
        start_seeding(file)
}

function start_seeding (files) {
	if (files.length === 0) return
	log('Seeding ' + files.length + ' files')
	if (window.File && window.FileReader && window.FileList && window.Blob) {
   	// Seed from WebTorrent
    client.seed(files, torrent_seed);
	} else {
        	alert('The File APIs are not fully supported in this browser.');
        	log('The File APIs are not fully supported in this browser.');
  }
	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
        output.push('Seeding : <li><strong>',escape(f.name),'</strong> -- '
                      ,f.type,'</li>');   
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
}

function torrent_seed (torrent) {
        log(
          'Torrent info hash: ' + torrent.infoHash + ' ' +
          '<a href="' + torrent.magnetURI + '" target="_blank">[Magnet URI]</a> ' +
          '<a href="' + torrent.torrentFileBlobURL + '" target="_blank" download="' + torrent.name + '.torrent">[Download .torrent]</a>'
        )

        torrent.on('done', function () {
          log('Seeding. Progress: 100%')
          // clearInterval(interval)
        })
       	var output = [];
        var interval_seeding = setInterval(function () {
        output=[]
       	output.push('<li>Seeding :<strong>',torrent.name,'</strong></br> Peers : '
                    ,(torrent.peersLength | '0'),' -- Uploaded : '
                    ,torrent.uploaded,' kb -- Upload Speed: '
                    ,torrent.uploadSpeed,' kb/s </li>');   
         document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
        }, 1000)
}

function log (str) {
        var p = document.createElement('p');
        p.innerHTML = str;
        document.querySelector('.log').appendChild(p);
}
