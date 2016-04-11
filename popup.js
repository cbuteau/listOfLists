'use strict';

// Copyright (c) 2016 Christopher Buteau.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function openListInTabs(list) {
  for (var i = 0; i < list.length; i++) {
    var url = list[i];
    var createProps = {
      url: url,
    };

    chrome.tabs.create(createProps);
  }
};

function persistListOfLists(list) {
  chrome.storage.sync.set(list);
};

function clearAllChildren(unorderedList) {
  while (unorderedList.firstChild) {
    unorderedList.removeChild(unorderedList.firstChild);
  }
}

function addListItem(parent, text, openCallback, removeCallback) {
  var li = document.createElement('li');
  li.appendChild(document.createTextNode(text));
  var buttonOpen = document.createElement('button');
  buttonOpen.appendChild(document.createTextNode('G'));
  buttonOpen.addEventListener('click', openCallback);
  li.appendChild(buttonOpen);

  var buttonDelete = document.createElement('button');
  buttonDelete.appendChild(document.createTextNode('X'));
  buttonDelete.addEventListener('click', removeCallback);

  parent.appendChild(li);
}

function refreshList(list) {
  var listElement = document.getElementById('listOfLists');
  clearAllChildren(listElement);
  var fakeRoot = document.createDocumentFragment();
  if (list !== null && list !== undefined) {
    var keys = Object.keys(list);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      addListItem(fakeRoot, key, function open() {
        var urls = list[key];
        openListInTabs(urls);
      }, function del() {
        chrome.storage.sync.remove(key);
        delete list[key];
        refreshList(list);
      });
    }
    listElement.appendChild(fakeRoot);
  }
}

//console.error('I am here')

var testUrls = [
  'http://google.com',
  'http://bluesnews.com',
  'http://github.com'
];

document.addEventListener('DOMContentLoaded', function() {
  var listOfLists = {};

  chrome.storage.sync.get(null, function(storedData) {
    if (storedData !== null && storedData !== undefined) {
      listOfLists = storedData;
    }
    refreshList(listOfLists);
  });

  /*
  chrome.storage.sync.get(null, function(stored) {
    var list = document.getElementById('listOfLists');
    var fakeRoot = document.createDocumentFragment();

    if (stored !== null && stored !== undefined) {
      listOfLists = stored;
      var keys = Object.keys(stored);
      for (var j = 0; j < keys.length; j++)
      {
        var key = keys[j];
        var li = document.createElement('li');
        li.appendChild(document.createTextNode(key));
        var button = document.createElement('button');
        // TODO use an icon instead for opening.
        button.appendChild(document.createTextNode('G'));
        button.addEventListener('click', function() {
          var listUrls = listOfLists[key];
          openListInTabs(listUrls);
        });
        li.appendChild(button);

        var buttonDelete = document.createElement('button');
        buttonDelete.appendChild(document.createTextNode('X'));
        buttonDelete.addEventListener('click', function() {
          chrome.storage.sync.remove(key);
          delete listOfLists[key];
          //persistListOfLists(listOfLists);
        });
        li.appendChild(buttonDelete);

        fakeRoot.appendChild(li);
      }

      list.appendChild(fakeRoot);
    }
  });
  */


  // var firstButton = document.getElementById('openTab');
  // firstButton.addEventListener('click', function() {
  //   for (var i = 0; i < testUrls.length; i++) {
  //     var createProps = {
  //       url: testUrls[i],
  //     }
  //
  //     chrome.tabs.create(createProps);
  //   }
  // })

  var saveButton = document.getElementById('saveList');
  saveButton.addEventListener('click', function() {
    var queryInfo = {
      active: true,               // Select active tabs
    };
    var queryInfo2 = {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      currentWindow: true,
    };
    chrome.tabs.query(queryInfo2, function (allTabs) {
      var list = [];
      for (var i = 0; i < allTabs.length; i++)
      {
        var tab = allTabs[i];
        list.push(tab.url);
      }
      var input = document.getElementById('nameLL');
      var name = input.value;

      listOfLists[name] = list;
      chrome.storage.sync.set(listOfLists);
    });
  });

});
