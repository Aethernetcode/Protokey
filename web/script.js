/*
   This software is licensed under the MIT License. See the license file for details.
   Source: https://github.com/spacehuhntech/WiFiDuck
 */

   //window.onload = function() {testTable()};

   window.onscroll = function() {scrollFunction()};

   function scrollFunction() {
     if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
       document.getElementById("nav").style.opacity = "0.2";
       document.getElementById("nav").style.filter = "blur(10px)";
       document.getElementById("nav").style.scale = ".95";
       if (document.querySelectorAll(".sel").length > 0) showHoverMenu();
     } else {
      document.getElementById("nav").style.opacity = "1";
      document.getElementById("nav").style.filter = "none";
      document.getElementById("nav").style.scale = "1";
      hideHoverMenu();
     }
   }


  function menuDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('#status')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }




// ===== Helper Functions ===== //
function log(msg) {
  console.log(msg);
}

function E(id) {
  return document.getElementById(id);
}

function download_txt(fileName, fileContent) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileContent));
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function fixFileName(fileName) {
  if (fileName.length > 0) {
    if (fileName[0] != '/') {
      fileName = '/' + fileName;
    }

    fileName = fileName.replace(/ /g, '\-');
  }
  return fileName;
}

// ===== DOM Manipulation ===== //
function status(mode) {
  current_status = mode;

  if (mode == "connected") {
    E("status-dot").style.backgroundColor = "#5EFF86";
  } else if (mode == "disconnected") {
    E("status-dot").style.backgroundColor = "#ED1C24";
  } else if (mode.includes("problem") || mode.includes("error")) {
    E("status-dot").style.backgroundColor = "#ffc107";
  } else /*if (mode == "connecting...")*/ {
    E("status-dot").style.backgroundColor = "#5ED8FF";
  }

  E("status").innerHTML = mode;
}

// ===== Web Socket ===== //
function log_ws(msg) {
  log("[WS] " + msg);
}

function set_version(str) {
  E("version").innerHTML = str;
}

var ws = null; // web socket instance
var ws_callback = log_ws; // message receive callback
var ws_msg_queue = []; // queue for outgoing messages
var cts = false; // clear to send flag for message queue

var current_status = "";

var ws_queue_interval = null;

// ===== WebSocket Functions ===== //
function ws_msg_queue_update() {
  if (cts && ws_msg_queue.length > 0) {

    var item = ws_msg_queue.shift();

    var message = item.message;
    var callback = item.callback;

    ws.send(message);
    ws_callback = callback;

    console.debug("# " + message);
    cts = false;
  }
}

function ws_send(message, callback, force = false) {
  if (!message.endsWith('\n')) message += '\n';

  ws_send_raw(message, callback, force);
}

function ws_send_raw(message, callback, force = false) {
  var obj = {
    "message": message,
    "callback": callback
  };

  if (force) {
    ws_msg_queue.unshift(obj);
  } else {
    ws_msg_queue.push(obj);
  }
}

function ws_update_status() {
  ws_send("status", status);
}

function ws_init() {
  status("connecting...");

  ws = new WebSocket("ws://192.168.4.1/ws");

  ws.onopen = function(event) {
    log_ws("connected");
    status("connected");

    ws_send("close", log_ws, true);
    ws_send("version", set_version);

    ws_connected();
  };

  ws.onclose = function(event) {
    log_ws("disconnected");
    status("disconnected");
  };

  ws.onmessage = function(event) {
    var msg = event.data;

    log_ws(msg);

    if (ws_callback && msg.length > 0) {
      ws_callback(msg);
    }

    cts = true;
  };

  ws.onerror = function(event) {
    log_ws("error");
    status("error");

    console.error(event);
  };

  cts = true;

  if (ws_queue_interval) clearInterval(ws_queue_interval);
  ws_queue_interval = setInterval(ws_msg_queue_update, 1);
}


// textarea sizing


/*

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('editor');

  const mirroredEle = document.createElement('textarea');
  mirroredEle.classList.add('mirror');
  document.body.appendChild(mirroredEle);

  const textareaStyles = window.getComputedStyle(textarea);
  [
      'border',
      'boxSizing',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'lineHeight',
      'padding',
      'textDecoration',
      'textIndent',
      'textTransform',
      'whiteSpace',
      'wordSpacing',
      'wordWrap',
  ].forEach((property) => {
      mirroredEle.style[property] = textareaStyles[property];
  });

  const parseValue = (v) => v.endsWith('px') ? parseInt(v.slice(0, -2), 10) : 0;
  const borderTopWidth = parseValue(textareaStyles.borderTopWidth);
  const borderBottomWidth = parseValue(textareaStyles.borderBottomWidth);

  const adjustSize = () => {
      mirroredEle.textContent = textarea.value;
      const newHeight = mirroredEle.scrollHeight + borderTopWidth + borderBottomWidth;
      textarea.style.height = `${newHeight}px`;
  };

  textarea.addEventListener('input', () => {
      adjustSize();
  });
  textarea.addEventListener('click', () => {
    adjustSize();
});

  adjustSize();
}); */