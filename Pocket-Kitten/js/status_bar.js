var Notifications = function Notifications() {

  var app,
      notifications = [];

  /*
    Uses the mozApps api to get a reference to the an app
    object representing the current application.

    We will use this to build the icon url and as well
    to call the method 'launch' over the application object
    that will bring our application to foreground 
  */
  var getAppReference = function getAppReference(cb) {
    var request = navigator.mozApps.getSelf();
    request.onsuccess = function onApp(evt) {
      cb(evt.target.result);
    };
  };

  /*
    Build the icon full url for this app
  */
  var getAppIcon = function getAppIcon(cb) {
    function buildIconURI(a) {
      var icons = a.manifest.icons;
      return a.installOrigin + icons['64'];
    }

    if (app != null) {
      cb(buildIconURI(app));
      return;
    }

    getAppReference(function onsuccess(a) {
      app = a;
      cb(buildIconURI(app));
    });
  };

  var forgetNotification = function onForget(not) {
    notifications.splice(notifications.indexOf(not), 1);
  };

  // Creates a notification using our app icon and adding some actions when clicking or closing
  var createNotification = function createAdvancedNotification() {
    getAppIcon(function onAppIcon(icon) {
      var data = new Date();
      var notification = navigator.mozNotification.createNotification(
        'Poket Kittens',
        'New Kittens',
        icon);

      notification.onclick = function onclick() {
        forgetNotification();
        app.launch();
      };

      notification.onclose = function onclose() {
        forgetNotification();
      };

      notification.show();
      notifications.push(notification);
    });
  };

  var notify = function notify() {
    if (document.hidden) {
      createNotification();
    }
    // Don't show notification if we are in foreground
  };

  return {
    'notify': notify
  };

}();
