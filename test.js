
    /*FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        var accessToken = response.authResponse.accessToken;
      } 
    } );*/

  const Queue = require('promise-queue');

  const _queue = new Queue(40, Infinity);

  async function fetchService (...args) {
      return new Promise((resolve, reject) => {
      let wrapper = null;
      try {
        wrapper = async () => {
          try {
            const response = await fetch(...args);
            if (!response.ok) throw new Error('No ok.');
            return resolve(response);
          } catch (err) {
            // console.error(err)
            return reject(err);
          }
        }
      } catch (err) {
        // console.error(err)
        return reject(err);
      }
      _queue.add(wrapper);
      });
  }


  // http get
  function get (url) {
      console.log(url);
      return fetchService(url, {
      credentials: 'same-origin'
      });
  }

  // extract form from html.
  function getFrom (str, startToken, endToken) {
    var start = str.indexOf(startToken) + startToken.length;
    if (start < startToken.length) return '';

    var lastHalf = str.substring(start);
    var end = lastHalf.indexOf(endToken);
    if (end === -1) {
      throw Error('Could not find endTime `' + endToken + '` in the given string.');
    }
    return lastHalf.substring(0, end);
  }

  async function getJar() {
      // fetch facebook page and extract data from their.
      const res = get('https://www.facebook.com/');
      const html = res.text();

      // required
      const token = getFrom(html, 'name="fb_dtsg" value="', '"');
      const selfId = getFrom(html, 'name="xhpc_targetid" value="', '"');

      if (!token || !selfId) {
        throw new Error('Cannot extract from facebook page.');
      }

      // optional
      let revision
      try { 
        revision = getFrom(html, 'revision":', ','); 
      } catch (err) {}

      return {
        token,
        selfId,
        revision
      };
  }

  const jar = getJar();

  console.log(jar);
