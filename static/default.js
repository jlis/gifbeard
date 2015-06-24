var gifbeard = {
	gui: null,
	clipboard: null,
	limit: 10,

	init: function() {
    var self = this;

		self.bindSearch();
		self.searchTrending();

    if (socket) {
      socket.on('connect_error', function() {
        self.alert('Server not reachable :(', 'danger');
      });

      socket.on('reconnect', function() {
        if ($('.alert').length) {
          $('#alert').html('');
        }
      });
    }
	},

	bindSearch: function() {
		var self = this;
		$('#search').on('keydown', function(e) {
			if (e.which == 13 || e.which == 9) {
				self.search($(this).val());
				e.preventDefault();
			}
		});
	},

	search: function(query) {
		var matches = query.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);

		if (null !== matches && matches.length > 1) {
			this.getYoutube(matches[1]);
		} else {
			var url = 'http://api.giphy.com/v1/gifs/search?q='+encodeURIComponent(query)+'&api_key=dc6zaTOxFJmzC&limit='+this.limit;
			this.get(url);
		}
	},

	searchTrending: function() {
		var url = 'http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC&limit='+this.limit;
		this.get(url);
	},

	get: function(url) {
		this.loader(true);
		var self = this;
		$.get(url, function(response) {
			self.showResults(response.data);
		});
	},

	getYoutube: function(id) {
		socket.emit('youtube', id);
		this.alert('The Youtube video has been broadcasted.', 'success');
	},

	showResults: function(data) {
		$('#columns').html('');
		var previews = [];

		$.each(data, function() {
			var item = $(this)[0];
			var source   = $('#item-template').html();
			var template = Handlebars.compile(source);
			$('#columns').append(template({
				gif: item.images.fixed_width.url,
				still: item.images.downsized_still.url,
				url: item.images.original.url,
			}));
			previews.push(item.images.fixed_width.url);
		});

		this.loader(false);
		this.preloadPreviews(previews);
		this.bindPreview();
	},

	bindPreview: function() {
		$('#columns .item')
			.off()
			.on('mouseenter', function() {
				var item = $(this);
				$('img', item).attr('src', item.attr('data-gif'));
			})
			.on('mouseleave', function() {
				var item = $(this);
				$('img', item).attr('src', item.attr('data-still'));
			});

		this.bindSocketBroadcast();
	},

  bindSocketBroadcast: function() {
		var self = this;
		$('#columns .item').on('click', function() {
			var url = $(this).attr('data-url');
			//var still = $(this).attr('data-still');

      try {
        socket.emit('gif', url);
        self.alert('The gif has been broadcasted.', 'success');
      } catch (err) {
        self.alert('Can\'t broadcast the gif. Maybe try reloading the site?', 'danger');
      }
		});
	},

	preloadPreviews: function(previews) {
		$('#previews').html('');
		for(var i = 0; i < previews.length; i++) {
			this.preloadUrl(previews[i], i*100);
		}
	},

	preloadUrl: function(url, delay) {
		if (typeof variable !== 'undefined') {
		    var delay = 100;
		}

		setTimeout(function() {
			$('#previews').append('<img src="'+url+'"/>');
		}, delay);
	},

	loader: function(show) {
		if (show) {
			$('#loading').show();
		} else {
			$('#loading').hide();
		}
	},

  alert: function(message, level) {
    var alert = '<div class="alert alert-'+level+'" role="alert">'+message+'</div>';
    $('#alert').hide().html(alert).fadeIn();
    setTimeout(function() {
      $('#alert').fadeOut(function() {
        $(this).html();
      });
    }, 3000);
  }
};

window.gifbeard = gifbeard;
