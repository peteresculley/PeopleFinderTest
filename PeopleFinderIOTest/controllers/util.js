// Packages
const tldjs = require('tldjs');

const Util = {};

Util.getDomain = (url) => {
  return tldjs.getDomain(url);
};

Util.getSubdomain = (url) => {
  return tldjs.getSubdomain(url);
};

/* Get full domain, does not consider www a subdomain */
Util.getDomainWithSubdomain = function (url, considerWWWASubdomain) {
  let fullDomain = '';

  const domain = Util.getDomain(url) || '';
  let subDomain = Util.getSubdomain(url) || '';
  // don't consider www a subdomain
  if (!considerWWWASubdomain && subDomain.substr(0,3) === 'www') {
    subDomain = subDomain.substr(4,subDomain.length);
  }

  fullDomain = (subDomain ? subDomain + '.' : '') + domain;

  return fullDomain;
};

/* Get the homepage from the requested url, including protocol and adds www if no subdomain */
// THERE IS A DUPLICATE OF THIS FUNCTION IN THE SCRAPERIO ENDPOINT

Util.getRootUrl = function (url) {
  // check protocol
  let protocol = '';
  if (url.substr(0, 7) === 'http://') {
    protocol = url.substr(0, 7);
  }
  if (url.substr(0, 8) === 'https://') {
    protocol = url.substr(0, 8);
  }
  if (!protocol) {
    protocol = 'http://';
  }

  let link = '';

  const domain = Util.getDomain(url) || '';
  const subDomain = Util.getSubdomain(url);

  if (domain) {
    const numberOfDotsInDomain = domain.split('.').length - 1;
    // for cases like bntp-assets.global.ssl.fastly.net: 'global.ssl.fastly.net' is considered the tld, 
    // bntp-assets the domain, and no subdomain, but we don't want to add www
    if (numberOfDotsInDomain > 2 && !subDomain) {
      link = protocol + domain;
    } else {
      link = protocol + (subDomain ? subDomain + '.' : 'www.') + domain;
    }
    return link;
  } else {
    // return url if domain cannot be extracted
    return url;
  }
};

/* wait for a number of miliseconds */
Util.wait = function (miliseconds) {
  // Wait X seconds
  const waitTime = new Date() / 1 + miliseconds;
  let now = new Date() / 1;
  while (now < waitTime) {
    now = new Date() / 1;
  }
};

// async foreach
Util.forEach = (arr, i, func, callback) => {
  if (arr[i]) {
    func(arr[i], () => {
      Util.forEach(arr, i + 1, func, callback);
    });
  } else {
    callback(false);
  }
};

// replace undefined by empty string
Util.replaceUndefinedbyEmptyString = (value) => {
  let output = value;
  if (!value && typeof value != "number") { // avoid converting 0 to ""
    output = '';
  }
  return output;
};

Util.STATES = [{ state: "Alabama", abbreviation: "AL" },
                { state: "Alaska", abbreviation: "AK" },
                { state: "Arkansas", abbreviation: "AR" },
                { state: "Arizona", abbreviation: "AZ" },
                { state: "California", abbreviation: "CA" },
                { state: "Colorado", abbreviation: "CO" },
                { state: "Connecticut", abbreviation: "CT" },
                { state: "Delaware", abbreviation: "DE" },
                { state: "District of Columbia", abbreviation: "DC" },
                { state: "Florida", abbreviation: "FL" },
                { state: "Georgia", abbreviation: "GA" },
                { state: "Hawaii", abbreviation: "HI" },
                { state: "Idaho", abbreviation: "ID" },
                { state: "Illinois", abbreviation: "IL" },
                { state: "Indiana", abbreviation: "IN" },
                { state: "Iowa", abbreviation: "IA" },
                { state: "Kansas", abbreviation: "KS" },
                { state: "Kentucky", abbreviation: "KY" },
                { state: "Louisiana", abbreviation: "LA" },
                { state: "Maine", abbreviation: "ME" },
                { state: "Montana", abbreviation: "MT" },
                { state: "Nebraska", abbreviation: "NE" },
                { state: "Nevada", abbreviation: "NV" },
                { state: "New Hampshire", abbreviation: "NH" },
                { state: "New Jersey", abbreviation: "NJ" },
                { state: "New Mexico", abbreviation: "NM" },
                { state: "New York", abbreviation: "NY" },
                { state: "North Carolina", abbreviation: "NC" },
                { state: "North Dakota", abbreviation: "ND" },
                { state: "Ohio", abbreviation: "OH" },
                { state: "Oklahoma", abbreviation: "OK" },
                { state: "Oregon", abbreviation: "OR" },
                { state: "Maryland", abbreviation: "MD" },
                { state: "Massachusetts", abbreviation: "MA" },
                { state: "Michigan", abbreviation: "MI" }, 
                { state: "Minnesota", abbreviation: "MN" },
                { state: "Mississippi", abbreviation: "MS" },
                { state: "Missouri", abbreviation: "MO" },
                { state: "Pennsylvania", abbreviation: "PA" },
                { state: "Rhode Island", abbreviation: "RI" },
                { state: "South Carolina", abbreviation: "SC" },
                { state: "South Dakota", abbreviation: "SD" },
                { state: "Tennessee", abbreviation: "TN" },
                { state: "Texas", abbreviation: "TX" },
                { state: "Utah", abbreviation: "UT" },
                { state: "Vermont", abbreviation: "VT" },
                { state: "Virginia", abbreviation: "VA" },
                { state: "Washington", abbreviation: "WA" },
                { state: "West Virginia", abbreviation: "WV" },
                { state: "Wisconsin", abbreviation: "WI" },
                { state: "Wyoming", abbreviation: "WY" }];

Util.getAbbreviationForState = function(state) {
  let abbreviation;
  for (let s = 0; s < Util.STATES.length; s++) {
    if (Util.STATES[s].state === state) {
      abbreviation = Util.STATES[s].abbreviation;
      break;
    }
  }
  return abbreviation;
};


module.exports = Util;
