'use strict';

const fs = require('fs');

let newVersion = null;

const versionUpdate = (file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      return console.log(err);
    }

    const newData = JSON.parse(data);

    if (newVersion === null) {
      let { version } = newData;
      const index = version.lastIndexOf('.');
      if (index > -1) {
        const num = parseInt(version.substring(index + 1), 10) + 1;
        version = `${version.substring(0, index)}.${num.toString()}`;
      }
      newVersion = version;
    }

    newData.version = newVersion;

    fs.writeFile(file, JSON.stringify(newData, null, 2), 'utf8', (err) => {
      if (err) {
        return console.log(err);
      }
    });
  });
};

versionUpdate('./package.json');
