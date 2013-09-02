/*
  Class that will help us with the simple push api,
  will allow us to:
    - Register for push
    - Register in our 3rd party service
*/
var SimplePush = function SimplePush() {

  // Get the endpoint from localstorage (if pressent)
  var endpoint = localStorage.endpoint || null;

  // Register to request an endpoint
  var subscribe = function subscribe(cb) {
    if (!navigator.push) {
      cb('No push api');
    }

    var request = navigator.push.register();
    request.onsuccess = function onSuccess() {
      // We got the endpoint, now we need to tell
      // the 3rd party service that can reach us
      // through that enpoint
      endpoint = localStorage.endpoint = request.result;
      CatsService.registerEndPoint(endpoint, cb);
    };

    request.onerror = function onError(e) {
      cb('Error registering ' + JSON.stringify(e));
    };
  };

  // Unregister for stopping any notifications
  var unsubscribe = function unsubscribe(cb) {
    delete localStorage.endpoint;
  };

  return {
    'subscribe': subscribe,
    'unbsubscribe': unsubscribe
  };
}();

/*
  Will handle any new message and get from the
  3rd party service the new content we pushed.
*/
var CatsService = function CatsService() {

  var image = document.getElementById('kitten-image');

  // New message received, go for it
  var onPushMessage = function onPushMessage(endPoint, version) {
    //We get a new version, in our case, we will go with that
    //version number and fetch a new image
    doRequest('GET', '/api/v1/' + version + '/?client=' + endPoint, null,
      function onResponse(err, data) {
        if (err) {
          // If fail, quit silently
          return;
        }

        // Get what we got from the server and put it as new image
        image.src = data;

        Notifications.notify();
      }
    );
  };

  // Tell our server where it can find us
  // This is applciation specific logic
  var registerEndPoint = function registerEndPoint(endPoint, cb) {
    var data = new FormData();
    data.append('client', endPoint);
    doRequest('POST', '/api/v1/register', data, cb);
  };

  return {
    'onPushMessage': onPushMessage,
    'registerEndPoint': registerEndPoint
  };
}();

// Listen to push notifications
window.navigator.mozSetMessageHandler('push', function onPush(evt) {
  var channel = evt.pushEndpoint;
  var version = evt.version;

  CatsService.onPushMessage(channel, version);
});

// Automatically register if not register previously
if (!localStorage.endpoint) {
  SimplePush.subscribe(function onSubscribe(err, data) {
    if (err) {
      alert(err);
    }

    console.log('Subscribed :: ' + JSON.stringify(data));
  });
}