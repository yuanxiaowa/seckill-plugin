import { resolveText } from "./tools";
import "jest";

function mc(text: string, data: any) {
  expect(resolveText(text.replace("💰", "元"))).toMatchObject(data);
}

describe("测试工具类", () => {
  test("测试文本转换-京东", () => {
    mc(
      `11.9
粘贴式马桶垫【亏本冲量】买1对送5对 
https://u.jd.com/ZoIH3N`,
      {
        urls: ["https://u.jd.com/ZoIH3N"],
        quantities: [1],
        expectedPrice: 11.9,
      }
    );

    mc(
      `【0点】清风抽纸

首页plus129-20/非plus99-10，https://u.jd.com/hgNWLD
清风抽纸Junior就你四叶草100抽*24包小规https://u.jd.com/XBJyo8
变价49.8，前1分钟第二件0
plus拍3件54.7，非plus拍2件39.8`,
      {
        urls: ["https://u.jd.com/hgNWLD", "https://u.jd.com/XBJyo8"],
        quantities: [3, 2],
      }
    );

    mc(
      `白象 方便面 汤好喝香辣猪骨汤面 泡面 5连包
https://u.jd.com/rZofR0 
P价下16件 用满199-100做到16件100元   速度自营货`,
      {
        urls: ["https://u.jd.com/rZofR0"],
        quantities: [16],
        expectedPrice: 100,
      }
    );
  });
  test("测试文本转换-淘宝", () => {
    mc(
      `金沙河刀削面4斤袋装
送4包牛肉酱18.9元
 ￥SFaSYkEUWQO￥`,
      {
        urls: ["SFaSYkEUWQO"],
        quantities: [1],
        expectedPrice: 18.9,
      }
    );

    mc(
      `拍下36元 共20斤
益品稻家精选茉莉香米大米10KG*1包籼米 长粒米（非东北大米） 
 ￥rvKrYkvtRD2￥`,
      {
        urls: ["rvKrYkvtRD2"],
        quantities: [1],
        expectedPrice: 36,
      }
    );

    mc(
      `猫超包邮款，17元
美涛男士定型发胶喷雾215ml
 ￥AuPqYkEGtpk￥`,
      {
        expectedPrice: 17,
        quantities: [1],
        urls: ["AuPqYkEGtpk"],
      }
    );

    mc(
      `先领券 0点下单 19.9💰
可凑中秋200-20券更低
麦吉士手工核桃酥饼干 
￥aYK9YkEE9At￥`,
      {
        expectedPrice: 19.9,
      }
    );

    mc(
      `飞跃基础款帆布鞋59元
0点
￥3hqfYkEDmHk￥`,
      {
        expectedPrice: 59,
      }
    );
  });
});
