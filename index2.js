function getNext(arr) {
  const result = Array(52);
  for (let i = 0; i < 26; i++) {
    result[i * 2] = arr[i];
    result[i * 2 + 1] = arr[i + 26];
  }
  return result;
}

function formatTable(tb) {
  const result = []
  for (let i = 0; i < tb[0].length; i++) {
    const arr = result[i] = []
    for (let j = 0; j < tb.length; j++) {
      arr.push(tb[j][i])
    }
  }
  return result
}

var arr = [...Array(52).keys()].map((i) => i + 1);
var table = [arr];

for (let i = 0; i < 8; i++) {
  arr = getNext(arr);
  table.push(arr);
}

console.table(formatTable(table));
