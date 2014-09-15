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
	self.currentTab = ko.observable();
	self.currentSubTab = ko.observable();
	self.currentStream = ko.observable();
	self.streamList = ko.observable();

	self.listSubTabs = ko.pureComputed(function() {
		return self.subTabs[self.currentTab()];
	});

	// Behaviours
	self.goToTab = function(tab) {
		// Navigate to the named tab
		window.location.hash = tab;
	};

	self.goToSubTab = function(subTab) {
		window.location.hash = self.currentTab() + '/' + subTab;
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
		if(index === 0)
		{
			return 'stream-list-item big';
		}
		else
		{
			return 'stream-list-item';
		}
	};

	self.streamItemStyle = function(data) {
		var css = {};
		css.backgroundImage = 'url("' + data.preview.large + '")';
		css.backgroundSize = 'cover';
		css.backgroundPosition = '50% 50%';

		return css;
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
		params += '?limit=17';

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

	self.log = function(data) {
		console.log(data);
	};

	// Hash Router
	var router = new Sammy(function() {
		// Channel routes
		this.get('#Channels', function() {
			self.openTab('Channels', 'Featured');
			self.listChannels('Featured');
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
