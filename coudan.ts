var arr = [...Array(50)].map<{
  id: number;
  price: number;
}>((i) => ({
  id: i,
  price: 5 + Number((Math.random() * 100).toFixed(2)),
}));

function coudan(arr, maxPrice) {
  const items = arr.map((item) => ({
    ...item,
    maxQuantity: Math.ceil(maxPrice / item.price),
  }));
  const ret = [];
  function getTotal(mask) {
    return mask.reduce((sum, item, i) => sum + item * items[i].price, 0);
  }
  function handler(quantities, i) {
    const total = getTotal(quantities);
    if (total - maxPrice > 20) {
      return;
    }
    if (i === items.length) {
      if (total < maxPrice) {
        return;
      }
      // ret.push({
      //   total,
      //   quantities: [...quantities],
      // })
      return;
    }
    const item = items[i];
    for (let j = 0; j <= item.maxQuantity; j++) {
      quantities.push(j);
      handler(quantities, i + 1);
      quantities.pop();
    }
  }
  handler([], 0);
  console.log(ret.sort((a, b) => a.total - b.total));
}

coudan(arr, 249);
