'use strict';


// Copyright (c) 2016 Christopher Buteau.

var DATA_KEY_ATTR = 'data-key';

var SAVE_LIST = 'Save List';
var REPLACE_LIST = 'Replace List';

var NAME_OVERLAY = 'Name the list of Tabs';

function updateStatus(status) {
  var statusDiv = document.getElementById('status');
  var content = document.createTextNode(status);
  statusDiv.appendChild(content);
}

function hideSaveButtons() {
  var saveButtons = document.getElementsByTagName('button');
  for (var i = 0; i < saveButtons.length; i++) {
    var sb = saveButtons[i];
    if (sb.id === 'save') {
      sb.style.visibility = 'collapse';
    }
  }
}

function getParentDataKey(element) {
  var key = null;
  var control = element;
  while (key === null) {
    key = control.getAttribute(DATA_KEY_ATTR);
    control = control.parentElement;
  }

  return key;
}

function showSpecificSaveButton(dataKey) {
  var saveButtons = document.getElementsByTagName('button');
  for (var i = 0; i < saveButtons.length; i++) {
    var sb = saveButtons[i];
    if (sb.id === 'save') {
      var key = getParentDataKey(sb);
      if (key === dataKey) {
        sb.style.visibility = 'visible';
      }
    }
  }
}

function queryAllTabsInCurrentWindow(callback) {
  var queryInfo = {
    windowId: chrome.windows.WINDOW_ID_CURRENT,
    currentWindow: true
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
  updateStatus('Open Complete');
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

function addListChild(parent, callback) {
  var li = document.createElement('li');
  callback(li);
  parent.appendChild(li);
}

function createButton(iconPath, id) {
  var button = document.createElement('button');
  button.id = id;
  var image = document.createElement('input');
  image.type = 'image';
  var url =  chrome.extension.getURL(iconPath);
  image.src = url;
  image.style = 'width: 100%; height: 100%;';
  button.appendChild(image);
  button.style = 'width: 32px; height: auto; border: 0';

  return button;
}
// hover items straigth from

function addListItem(parent, text, key, openCallback, removeCallback) {
  var li = document.createElement('li');
  // store key in custom attr.
  li.setAttribute(DATA_KEY_ATTR, key);

  var listData = document.createElement('ul');
  listData.id="navlist";

  addListChild(listData, function(parent) {
    var link = document.createElement('a');
    link.setAttribute('href', '#');
    link.appendChild(document.createTextNode(text));
    link.addEventListener('click', openCallback);
    parent.appendChild(link);
  });

  addListChild(listData, function(parent) {
    var buttonOpen = createButton('go.png', 'open');
    parent.appendChild(buttonOpen);
    buttonOpen.addEventListener('click', openCallback);
  });

  addListChild(listData, function(parent) {
    var buttonSave = createButton('Floppy.png', 'save');
    parent.appendChild(buttonSave);
  });

  addListChild(listData, function(parent) {
    var buttonDelete = createButton('delete.png', 'delete');
    parent.appendChild(buttonDelete);
    buttonDelete.addEventListener('click', removeCallback);
  });

  li.appendChild(listData);

  parent.appendChild(li);
  return;

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
  openImage.style = 'width: 100%; height: 100%;';
  buttonOpen.appendChild(openImage);
  buttonOpen.style = 'width: 32px; height: auto; border: 0';
  //buttonOpen.src = 'url(\'go.png\')';
  //buttonOpen.appendChild(document.createTextNode('G'));
  buttonOpen.addEventListener('click', openCallback);
  li.appendChild(buttonOpen);

  var buttonDelete = document.createElement('button');
  var delImage = document.createElement('input');
  var delUrl =  chrome.extension.getURL('delete.png');
  delImage.type = 'image';
  delImage.src = delUrl;
  delImage.style = 'width: 100%; height: 100%;';
  buttonDelete.appendChild(delImage);
  buttonDelete.style = 'width: 32px; height: auto; border: 0';
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
        var control = event.currentTarget;
        var openKey = getParentDataKey(control);
        var urls = list[openKey];
        openListInTabs(urls);
      }, function del(event) {
        var control = event.currentTarget;
        var delKey = getParentDataKey(control);
        chrome.storage.sync.remove(delKey);
        delete list[delKey];
        refreshList(list);
      });
    }
    listElement.appendChild(fakeRoot);
  }
}

function setOverlay(input) {
  input.value = NAME_OVERLAY;
  input.style.color='#BBB';
}

function clearOverlay(input) {
  input.value = '';
  input.style.color='#000';
}

console.error('I am here')

document.addEventListener('DOMContentLoaded', function() {
  var listOfLists = {};

  chrome.storage.sync.get(null, function(storedData) {
    if (storedData !== null && storedData !== undefined) {
      listOfLists = storedData;
    }
    refreshList(listOfLists);
    hideSaveButtons();
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
          showSpecificSaveButton(key);
          saveButton.innerText = REPLACE_LIST;
        } else {
          hideSaveButtons();
          saveButton.innerText = SAVE_LIST;
        }
        saveButton.disabled = false;
    } else {
        saveButton.innerText = SAVE_LIST;
        saveButton.disabled = true;
    }
  });

  nameInput.addEventListener('blur', function(event) {
    console.log('blur');
    console.log(event);
    setOverlay(event.target);
    // event.target.value = NAME_OVERLAY;
    // event.target.style.color='#BBB';
  });

  nameInput.addEventListener('focus', function(event) {
    console.log('focus');
    console.log(event);
    clearOverlay(event.target);
    // event.target.value = '';
    // event.target.style.color='#000';
  });

  setOverlay(nameInput);

  // moving to mousedown so the blur doesn't replace the name.
  saveButton.addEventListener('mousedown', function(event) {
    event.preventDefault();
    var queryInfo = {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
      currentWindow: true,
    };
    chrome.tabs.query(queryInfo, function (allTabs) {
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
      updateStatus('Update complete');
      setOverlay(input);
    });
  });
});
