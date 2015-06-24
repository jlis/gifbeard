var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http)
    config = require('config');

var gifbeard = {
  name: 'soundbeard v1',
  init: function() {
    this.checkConfig();
    this.setUpStatic();
    this.setUpRoutes();
    this.setUpSockets();
    this.launchServer();
  },
  checkConfig: function() {
    var keys = ['ip', 'port'];
    for (var key in keys) {
      if (!config.has(keys[key])) {
        console.log('WARNING: Config property "'+keys[key]+'" does not exists. Exiting...');
        process.exit(1);
      }
    }
  },
  setUpStatic: function() {
    app.use(express.static(__dirname + '/static', {
      dotfiles: 'ignore',
      etag: false,
      extensions: ['css', 'js', 'gif', 'png'],
      index: false,
      maxAge: '1d',
      redirect: false,
      setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now());
      }
    }));
  },
  setUpRoutes: function() {
    app.get('/', function(req, res) {
      res.sendFile(__dirname + '/static/search.html');
    });

    app.get('/viewer', function(req, res) {
      res.sendFile(__dirname + '/static/viewer.html');
    });
  },
  setUpSockets: function() {
    io.on('connection', function(socket) {
      console.log('a user connected');

      socket.on('disconnect', function() {
        console.log('user disconnected');
      });

      socket.on('gif', function(url) {
        io.emit('gif', url);
      });

      socket.on('youtube', function(id) {
        io.emit('youtube', id);
      });
    });
  },
  launchServer: function() {
    http.listen(config.get('port'), config.get('ip'), function() {
      var url = 'http://'+config.get('ip')+':'+config.get('port');
      var modtLines = [
        '      _           ',
        ' _ o_|_|_ _ _._ _|',
        '(_|| | |_(/(_| (_|',
        ' _|               ',
        '',
        'navigate to '+url+'/ to search for gifs',
        'and to '+url+'/viewer to show them on i.e. on a big screen :)'
      ];
      console.log(modtLines.join("\n"));
    });
  }
};

// start
gifbeard.init();
