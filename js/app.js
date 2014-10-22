/* global document,window,$,ko,Sammy,JsStorage */
'use strict';

var TwitchyViewModel = function() {
	// Members
	var self = this;
	self.tabs = ['Games', 'Channels'];
	self.subTabs = {
		Channels: ['Popular', 'Featured', 'Favorites'],
		Games: [],
		Settings: []
	};
	self.silenceRoute = false;
	self.currentTab = ko.observable();
	self.currentSubTab = ko.observable();
	self.currentStream = ko.observable();
	self.streamList = ko.observable();
	self.gameList = ko.observable();
	self.favorites = ko.observableArray(JsStorage.get('favorites'));

	// Computed variables
	self.listSubTabs = ko.computed(function() {
		return self.subTabs[self.currentTab()];
	});

	self.streamPlayerCss = ko.computed(function() {
		if(self.currentStream() !== null)
		{
			return 'stream-player active';
		}
		else
		{
			return 'stream-player';
		}
	}, self);

	// Subscriptions
	self.favorites.subscribe(function(val) {
		// Save the favorites into storage
		JsStorage.set('favorites', val);
	});

	// Behaviours
	self.goToTab = function(tab) {
		// Navigate to the named tab
		window.location.hash = tab;
	};

	self.goToSubTab = function(subTab) {
		window.location.hash = self.currentTab() + '/' + subTab;
	};

	self.goToStream = function(stream) {
		window.location.hash = 'Streams/' + stream.channel.name;
	};

	self.goToGame = function(data) {
		window.location.hash = 'Games/' + data.game.name.split(' ').join('+');
	};

	// Generates the css necessary for tabbed navigation
	self.navLinkCss = function(tabName, index) {
		if(tabName === self.currentTab())
		{
			return 'active link item-' + index;
		}
		else
		{
			return 'link item-' + index;
		}
	};

	self.subNavLinkCss = function(tabName) {
		if(tabName === self.currentSubTab())
		{
			return 'active sub-tab';
		}
		else
		{
			return 'sub-tab';
		}
	};

	self.favoriteStreamCss = function(data) {
		return ko.computed(function() {
			// If we've favorited this channel, style it differently
			if(self.favorites().indexOf(data.channel.name) !== -1)
			{
				return 'stream-favorite favorited';
			}

			return 'stream-favorite';
		}, self);
	};

	self.streamItemCss = function(index) {
		var className = 'stream-list-item';

		if(index % 5 === 0)
		{
			className += ' big';

			// Push odd big tiles to the right
			if(index % 2 === 1)
			{
				className += ' right';
			}
		}

		return className;
	};

	self.gameItemCss = function(index) {
		var className = 'game-list-item';

		if(index === 0)
		{
			className += ' big';
		}

		return className;
	};

	self.streamItemStyle = function(data) {
		var css = {};

		// Get the large preview and cover the div with it
		css.backgroundImage = 'url("' + data.preview.large + '")';

		return css;
	};

	self.gameItemStyle = function(data, index) {
		var css = {};

		// Get the large preview and cover the div with it
		if(index === 0)
		{
			// Get a higher res image for the big thumbnail
			var url = data.game.box.template;
			url = url.replace('{height}', '660').replace('{width}', '472');

			css.backgroundImage = 'url("' + url + '")';
		}
		else
		{
			css.backgroundImage = 'url("' + data.game.box.large + '")';
		}

		return css;
	};

	self.streamObjectData = function(channel) {
		var attr = {};

		attr.data = 'http://www.twitch.tv/widgets/live_embed_player.swf?channel=' + channel;

		return attr;
	};

	self.streamFlashVars = function(channel) {
		var attr = {};

		attr.value = 'hostname=www.twitch.tv&channel=' + channel + '&auto_play=true&start_volume=25';

		return attr;
	};

	self.openTab = function(tabName, subTabName) {
		self.currentTab(tabName);
		if(subTabName)
		{
			self.currentSubTab(subTabName);
		}
		else
		{
			self.currentSubTab(null);
		}
		self.currentStream(null);
		self.streamList(null);
		self.gameList(null);
	};

	self.listChannels = function(filter) {
		var options = {};
		options.limit = 15;

		if(filter === 'Favorites')
		{
			// Get the list of favorites and hit the API
			// We need to stuff at least one channel in there (even a fake one)
			// for the ?channel option to trigger in the API
			options.channel = 'nonexistentchannel,' + self.favorites().join(',');
			self.populateStreamList('streams', options);
		}
		if(filter === 'Popular')
		{
			self.populateStreamList('streams', options);
		}
		if(filter === 'Featured')
		{
			self.populateStreamList('streams/featured', options);
		}
	};

	self.listGames = function(gameName) {
		var options = {};
		if(gameName)
		{
			options.game = gameName;
			options.limit = 15;
			self.populateStreamList('streams', options);
		}
		else
		{
			options.limit = 21;
			self.populateGameList(options);
		}
	};

	self.populateStreamList = function(endpoint, options) {
		// Go through their settings to create the params, but for now just hard
		// code it
		var params = '?';
		if(typeof options !== 'undefined')
		{
			$.each(options, function(key, val) {
				params += key + '=' + val + '&';
			});
		}

		$.ajax({
			url: 'https://api.twitch.tv/kraken/' + endpoint + params,
			type: 'GET',
			dataType: 'jsonp'
		})
		.done(function(response) {
			var streams = [];
			if(response.streams)
			{
				streams = response.streams;
			}
			else if(response.featured)
			{
				for (var i = response.featured.length - 1; i >= 0; i--) {
					streams.push(response.featured[i].stream);
				}
			}
			self.streamList(streams);
		});
	};

	self.populateGameList = function(options) {
		var params = '?';
		if(typeof options !== 'undefined')
		{
			$.each(options, function(key, val) {
				params += key + '=' + val + '&';
			});
		}

		$.ajax({
			url: 'https://api.twitch.tv/kraken/games/top' + params,
			type: 'GET',
			dataType: 'jsonp'
		})
		.done(function(response) {
			self.gameList(response.top);
		});
	};

	self.openStream = function(channel) {
		self.currentStream(channel);
	};

	self.closeStream = function() {
		// Find out where to move us to
		var newHash = '#';
		if(self.currentTab() !== undefined && self.currentTab() !== null)
		{
			newHash += self.currentTab();
		}
		if(self.currentSubTab() !== undefined && self.currentSubTab() !== null)
		{
			newHash += '/' + self.currentSubTab();
		}

		// Destroy the current stream obj
		self.currentStream(null);

		// Re-route us, but signal a quiet route if it's an old route
		if(newHash !== '#')
		{
			self.silenceRoute = true;
		}
		window.location.hash = newHash;
	};

	self.favoriteStream = function(data, e) {
		// Prevent us from bubbling up to the openStream handler
		e.stopImmediatePropagation();

		var channel = data.channel.name;
		// Is it already in the favorites?
		if(self.favorites().indexOf(channel) === -1)
		{
			// Nope, add it
			self.favorites.push(channel);
		}
		else
		{
			// Yeah, remove it
			self.favorites.remove(channel);
		}
	};

	self.refresh = function() {
		router.refresh();
	};

	self.log = function(data, e) {
		console.log(data, e);
	};

	// Hash Router
	var router = new Sammy(function() {
		// Before filters
		this.before(/.*/, function() {
			// Is this route being silenced?
			if(self.silenceRoute)
			{
				self.silenceRoute = false;
				return false;
			}
		});
		// Channel routes
		this.get('#Channels', function() {
			self.openTab('Channels', 'Popular');
			self.listChannels('Popular');
		});

		this.get('#Channels/:filter', function() {
			self.openTab('Channels', this.params.filter);
			self.listChannels(this.params.filter);
		});

		// Game routes
		this.get('#Games', function() {
			self.openTab('Games');
			self.listGames();
		});

		this.get('#Games/:name', function() {
			self.openTab('Games');
			self.listGames(this.params.name);
		});

		this.get('#Settings', function() {
			self.openTab('Settings');
		});

		// Stream routes
		this.get('#Streams/:stream', function() {
			self.openStream(this.params.stream);
		});

		// Default catch-all route
		this.get('', function() {
			// Start with #Channels
			this.app.runRoute('get', '#Channels');
		});
	});

	// Run the router
	router.run();
};

var viewModel = new TwitchyViewModel();

ko.applyBindings(viewModel);

// Allow streams to be closed with the esc key
$(document).on('keydown', function(e) {
	if(e.keyCode === 27 && viewModel.currentStream() !== null)
	{
		viewModel.closeStream();
	}
});


// Bind to the beforeunload event
$(window).on('beforeunload', function() {
	if(viewModel.currentStream() !== null)
	{
		return 'Leave Twitchy?';
	}
});