// Perform a request against the simplepushclient server
var doRequest = function doPost(type, uri, data, cb) {
  if (uri.indexOf('http://') != 0) {
    uri = 'http://catservice.eu01.aws.af.cm' + uri;
  }
  var xhr = new XMLHttpRequest({mozSystem: true});

  xhr.onload = function onLoad(evt) {
    if (xhr.status === 200 || xhr.status === 0) {
      cb(null, xhr.response);
    } else {
      cb(xhr.status);
    }
  };
  xhr.open(type, uri, true);
  xhr.onerror = function onError(e) {
    console.error('onerror en xhr ' + xhr.status);
    cb(e);
  };
  xhr.send(data);
};