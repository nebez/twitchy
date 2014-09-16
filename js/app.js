/* jshint strict: false */
/* global window,$,ko,Sammy */
function TwitchyViewModel() {
	// Members
	var self = this;
	self.tabs = ['Games', 'Channels', 'Settings'];
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

	self.listSubTabs = ko.pureComputed(function() {
		return self.subTabs[self.currentTab()];
	});

	self.streamPlayerCss = ko.pureComputed(function() {
		if(self.currentStream() !== null)
		{
			return 'stream-player active';
		}
		else
		{
			return 'stream-player';
		}
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
			return 'active tab-1-5';
		}
		else
		{
			return 'tab-1-5';
		}
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

	self.streamItemStyle = function(data) {
		var css = {};

		// Get the large preview and cover the div with it
		css.backgroundImage = 'url("' + data.preview.large + '")';
		css.backgroundSize = 'cover';
		css.backgroundPosition = '50% 50%';

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
	};

	self.listChannels = function(filter) {
		if(filter === 'Favorites')
		{
			// Get the list of favorites from storage and hit the API

		}
		if(filter === 'Popular')
		{
			self.populateStreamList('streams');
		}
		if(filter === 'Featured')
		{
			self.populateStreamList('streams/featured');
		}
	};

	self.listGames = function(filter) {
		if(filter)
		{
			console.log(filter);
		}
		else
		{
			console.log('all');
		}
	};

	self.populateStreamList = function(endpoint) {
		// Go through their settings to create the params, but for now just hard
		// code it
		var params = '';
		params += '?limit=15';

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
			console.table(streams);
		});
	};

	self.openStream = function(channel) {
		self.currentStream(channel);
	};

	self.closeStream = function() {
		// Find out where to move us to
		var newHash = '#';
		if(self.currentTab() !== undefined)
		{
			newHash += self.currentTab();
		}
		if(self.currentSubTab() !== undefined)
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

	self.log = function(data) {
		console.log(data);
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
}

ko.applyBindings(new TwitchyViewModel());
