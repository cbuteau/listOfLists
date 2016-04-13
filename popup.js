'use strict';

// Copyright (c) 2016 Christopher Buteau.

var DATA_KEY_ATTR = 'data-key';

function queryAllTabsInCurrentWindow(callback) {
  var queryInfo = {
    windowId: chrome.windows.WINDOW_ID_CURRENT,
    currentWindow: true,
  };
  chrome.tabs.query(queryInfo, callback);
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

function showTabs() {
  var showList = document.getElementById('tabList');
  clearAllChildren(showList);
  // Perform tab query.
  queryAllTabsInCurrentWindow(function(allTabs) {
    var docFrag = document.createDocumentFragment();
    for (var i = 0; i < allTabs.length; i++) {
      var tab = allTabs[i];
      var url = tab.url;
      var li = document.createElement('li');
      li.appendChild(document.createTextNode(url));
      docFrag.appendChild(li);
    }
    showList.appendChild(docFrag);
  })
}

function persistListOfLists(list) {
  chrome.storage.sync.set(list);
};

function clearAllChildren(unorderedList) {
  while (unorderedList.firstChild) {
    unorderedList.removeChild(unorderedList.firstChild);
  }
}

// hover items straigth from

function addListItem(parent, text, key, openCallback, removeCallback) {
  var li = document.createElement('li');
  // store key in custom attr.
  li.setAttribute(DATA_KEY_ATTR, key);
  var link = document.createElement('a');
  link.setAttribute('href', '#');
  link.appendChild(document.createTextNode(text));
  link.addEventListener('click', openCallback);
  li.appendChild(link);
  //li.appendChild(document.createElement('a').appendChild(document.createTextNode(text)));
  //li.appendChild(document.createTextNode(text));
  var buttonOpen = document.createElement('button');
  var openImage = document.createElement('input');
  openImage.type = 'image';
  var openUrl =  chrome.extension.getURL('go.png');
  openImage.src = openUrl;
  openImage.style = 'width: 25%; height: 25%;';
  buttonOpen.appendChild(openImage);
  buttonOpen.style = 'width: auto; height: auto; border: 0';
  //buttonOpen.src = 'url(\'go.png\')';
  //buttonOpen.appendChild(document.createTextNode('G'));
  buttonOpen.addEventListener('click', openCallback);
  li.appendChild(buttonOpen);

  var buttonDelete = document.createElement('button');
  var delImage = document.createElement('input');
  var delUrl =  chrome.extension.getURL('delete.png');
  delImage.type = 'image';
  delImage.src = delUrl;
  delImage.style = 'width: 25%; height: 25%;';
  buttonDelete.appendChild(delImage);
  buttonDelete.style = 'width: auto; height: auto; border: 0';
  //buttonDelete.src = 'url(\'delete.png\')';
  //buttonDelete.appendChild(document.createTextNode('X'));
  buttonDelete.addEventListener('click', removeCallback);
  li.appendChild(buttonDelete);

  parent.appendChild(li);
}

function refreshList(list) {
  //alert('Stop here');
  //debugger;
  var listElement = document.getElementById('listOfLists');
  clearAllChildren(listElement);
  var fakeRoot = document.createDocumentFragment();
  if (list !== null && list !== undefined) {
    var keys = Object.keys(list);
    for (var k = 0; k < keys.length; k++) {
      var key = keys[k];
      addListItem(fakeRoot, key, key, function open(event) {
        var openKey = event.currentTarget.parentElement.getAttribute(DATA_KEY_ATTR);
        var urls = list[openKey];
        openListInTabs(urls);
      }, function del(event) {
        var delKey = event.currentTarget.parentElement.getAttribute(DATA_KEY_ATTR);
        chrome.storage.sync.remove(delKey);
        delete list[delKey];
        refreshList(list);
      });
    }
    listElement.appendChild(fakeRoot);
  }
}

console.error('I am here')

document.addEventListener('DOMContentLoaded', function() {
  var listOfLists = {};

  chrome.storage.sync.get(null, function(storedData) {
    if (storedData !== null && storedData !== undefined) {
      listOfLists = storedData;
    }
    refreshList(listOfLists);
  });

  var showButton = document.getElementById('showTabList');
  showButton.addEventListener('click', function() {
    showTabs();
  });

  var saveButton = document.getElementById('saveList');
  var nameInput = document.getElementById('nameLL');
  // start disabled.
  saveButton.disabled = true;
  nameInput.addEventListener('keyup', function() {
    // enable if string is more than 0 chars.
    var key = nameInput.value;
    if (key !== '') {
        if (listOfLists.hasOwnProperty(key)) {
          saveButton.innerText = 'Replace List';
        } else {
          saveButton.innerText = 'Save List';
        }
        saveButton.disabled = false;
    } else {
        saveButton.disabled = true;
    }
  });

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
