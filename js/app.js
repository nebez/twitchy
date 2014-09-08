/* jshint strict: false */
/* global window,ko,Sammy */
function TwitchyViewModel() {
	// Members
	var self = this;
	self.tabs = ['Search', 'Channels', 'Games'];
	self.subTabs = {
		Search: ['Channels', 'Streams', 'Games'],
		Channels: ['Favorites', 'Featured', 'Popular'],
		Games: []
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

	// Hash Router
	var router = new Sammy(function() {
		// Search routes
		this.get('#Search', function() {
			self.currentTab('Search');
			self.currentSubTab('Channels');
			self.currentStream(null);
			self.streamList(null);
		});

		this.get('#Search/:query/:filter', function() {
			self.currentTab('Search');
			self.currentSubTab(this.params.filter);
			self.currentStream(null);
		});

		// Channel routes
		this.get('#Channels', function() {
			self.currentTab('Channels');
			self.currentSubTab('Favorites');
			self.currentStream(null);
		});

		this.get('#Channels/:filter', function() {
			self.currentTab('Channels');
			self.currentSubTab(this.params.filter);
			self.currentStream(null);
		});

		// Game routes
		this.get('#Games', function() {
			self.currentTab('Games');
			self.currentSubTab(null);
			self.currentStream(null);
		});

		this.get('#Games/:name', function() {

		});

		// Default route
		this.get('', function() {
			this.app.runRoute('get', '#Channels');
		});
	});

	// Run the router
	router.run();
}

ko.applyBindings(new TwitchyViewModel());

/*
	self.openStream = function(stream) { window.location.hash = stream.name; };
	self.listStreams = function() {
		$.ajax({
			url: 'https://api.twitch.tv/kraken/streams',
			type: 'GET',
			dataType: 'jsonp'
		})
		.done(function(response) {
			self.streamList(response);
			console.log(response);
		});
	};

	self.listStreams();
 */