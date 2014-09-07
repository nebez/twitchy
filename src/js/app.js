/* jshint strict: false */
/* global window,ko,$ */
function TwitchyViewModel() {
	// Members
	var self = this;
	self.streamList = ko.observable();

	// Behaviours
	self.openStream = function(stream) { window.location.hash = stream.name; };
	self.listStreams = function() {
		$.ajax({
			url: 'https://api.twitch.tv/kraken/streams',
			type: 'GET',
			dataType: 'jsonp'
		})
		.done(function(response) {
			self.streamList(response);
		});
	};

	self.listStreams();
}

ko.applyBindings(new TwitchyViewModel());