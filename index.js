const { data, hierarchy } = require("./submit-data.json");
const Json5 = require("json5");

const { structure } = hierarchy;

const dataKeys = [];
const structureKeys = [];

function traverse(key) {
  if (data[key]) {
    dataKeys.push(key);
  } else {
    // console.log("no_dkey", key);
  }
  if (structure[key]) {
    structureKeys.push(key);
    structure[key].forEach(traverse);
  } else {
    console.log("no_skey", key);
  }
}

traverse("global_1");

console.log(dataKeys, structureKeys);

const glob = require("glob");
const fs = require("fs");

glob("{d1,d2}.json", (err, filenames) => {
  filenames.forEach((filename) => {
    fs.readFile(filename, (err, content) => {
      const data = JSON.parse(content);

      fs.writeFile(filename, JSON.stringify(format(data), null, 2), () => {});
    });
  });
});

function format(data) {
  if (Array.isArray(data)) {
    return data.map(format);
  }
  if (typeof data === "string") {
    if (data.startsWith("{")) {
      try {
        data = JSON.parse(data);
      } catch (e) {
        return data;
      }
    } else {
      return data;
    }
  }
  if (typeof data === "object") {
    return Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = format(data[key]);
        return acc;
      }, {});
  }
  return data;
}

// const axios = require("axios");
// const moment = require("moment");

// async function action() {
//   const { status } = await axios.get("https://www.baidu.com");
//   console.log(status, moment().format(moment.HTML5_FMT.TIME_SECONDS));
//   setTimeout(action, 1000);
// }

// action();
