/* jshint strict: false */
/* global window, document, localStorage */

(function(self, undefined) {
	// Members
	var storageEnabled = false;
	var maxCookieSize = 4093;
	var dataKeyName = 'storage';

	if(localStorage)
	{
		// Browser supports localStorage
		storageEnabled = true;
	}

	// Private Methods
	var getCookie = function(key) {
		var nameEQ = key + '=';
		var ca = document.cookie.split(';');
		for (var i = 0, max = ca.length; i < max; i++)
		{
			var c = ca[i];
			while (c.charAt(0) === ' ')
			{
				c = c.substring(1, c.length);
			}

			if (c.indexOf(nameEQ) === 0)
			{
				return c.substring(nameEQ.length, c.length);
			}
		}
		return null;
	};

	var setCookie = function(key, value, exp) {
		var date = new Date();
		// Convert the expiration date to days
		date.setTime(date.getTime() + (exp * 24 * 60 * 60 * 1000));
		var expires = 'expires=' + date.toGMTString();

		// Set the cookie
		document.cookie = key + '=' + value + '; ' + expires + '; path=/';
	};

	var getStoredData = function() {
		// Get the data currently saved
		var saved;

		if(localStorage)
		{
			saved = localStorage.getItem(dataKeyName);
		}
		else
		{
			saved = getCookie(dataKeyName);
		}

		// Try parsing the JSON and return it
		try
		{
			return JSON.parse(saved) || {};
		}
		catch(e)
		{
			// Who cares, return an empty object anyway :)
			return {};
		}
	};

	var saveStoredData = function(data) {
		// JSON Stringify the data
		var stringified = JSON.stringify(data);

		// Is it bigger than our max size in cookie-based storage?
		if(stringified.length > maxCookieSize && !localStorage)
		{
			// Whoa, buddy
			throw 'Data greater than max cookie size of ' + maxCookieSize + ' bytes';
		}

		if(localStorage)
		{
			localStorage.setItem(dataKeyName, stringified);
		}
		else
		{
			setCookie(dataKeyName, stringified, 500);
		}
	};

	var clearStoredData = function() {
		// Clear out the entire storage
		if(localStorage)
		{
			localStorage.removeItem(dataKeyName);
		}
		else
		{
			setCookie(dataKeyName, '', -1);
		}
	};

	// Public methods
	self.set =  function(key, value) {
		// Get the currently stored data
		var data = getStoredData();

		// Set the new key value pair
		data[key] = value;

		// Push the updated data back into the storage
		saveStoredData(data);
	};

	self.get = function(key) {
		// Get the currently stored data
		var data = getStoredData();

		// Return the value
		if(typeof key !== 'undefined' && key in data)
		{
			return data[key];
		}
	};

	self.unset = function(key) {
		// Get the currently stored data
		var data = getStoredData();

		// Unset the key
		delete data[key];

		// Push the data back into storage
		saveStoredData(data);
	};

	self.empty = function() {
		clearStoredData();
	};
})(window.JsStorage = window.JsStorage || {});