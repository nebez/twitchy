/* jshint strict: false */
/* global window,ko,Sammy */
function TwitchyViewModel() {
	// Members
	var self = this;
	self.tabs = ['Search', 'Channels', 'Games'];
	self.currentTab = ko.observable();
	self.currentStream = ko.observable();
	self.streamList = ko.observable();

	// Behaviours
	self.goToTab = function(tab) {
		// Navigate to the named tab
		window.location.hash = tab;
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

	// Hash Router
	var router = new Sammy(function() {
		// Tab routes
		this.get('#Search', function() {
			self.currentTab('Search');
			self.currentStream(null);
		});
		
		// Tab routes
		this.get('#Channels', function() {
			self.currentTab('Channels');
			self.currentStream(null);
		});

		// Tab routes
		this.get('#Games', function() {
			self.currentTab('Games');
			self.currentStream(null);
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