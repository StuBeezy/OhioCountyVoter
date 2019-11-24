const zipcode = require('zipcode');
const { each, isUndefined } = require('lodash');

function returnAllZipCodes (data)  {
  const zipCodes = {};

  each(data, function(voter) {
    let zipCode = voter['RESIDENTIAL_ZIP'];
    if (!isUndefined(zipCode)){
      if (isUndefined(zipCodes[zipCode])) {
        zipCodes[zipCode] = {
          city: zipcode.lookup(zipCode)[0]
        }
      }
    }
  });

  return zipCodes;
}

module.exports = returnAllZipCodes;

