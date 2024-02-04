const avePing = document.getElementById("avePing");

//#region logical data
const testBtn = document.getElementById("test_btn");
const pingList = new Array();
const jitterList = new Array();
let countRev = 0;
let countSend = 0;

Array.prototype.max = function () {
  return this.reduce((max, val) => {
    return max < val ? val : max;
  }, -1);
};

Array.prototype.min = function () {
  return this.reduce((min, val) => {
    return min > val ? val : min;
  }, 99999);
};

const ping = () => {
  const img = new Image();
  const startTime = new Date().getTime();
  if (countSend >= 5) return;
  img.src = `https://www.bilibili.com/favicon.ico?d=${startTime}`;
  countSend++;
  img.onload = function () {
    console.log("监听器");
    const endTime = new Date().getTime();
    const delta = endTime - startTime;
    pingList.push(delta);
    if (countRev % 5 === 4) {
      let maxPing = pingList.max();
      let minPing = pingList.min();
      const sum = pingList.reduce((sum, value) => {
        if (value === maxPing) {
          maxPing = -1;
          return sum;
        }
        if (value === minPing) {
          minPing = -1;
          return sum;
        }
        return (sum += value);
      }, 0);
      const ave = Math.round(sum / 3);
      avePingProxy.push(ave);
      pingList.length = 0;
      console.log("---抢占");
      /*微任务队列中的任务会抢占cpu */
      countSend = 0;
    }
    countRev++;
  };
  img.onerror = (err) => {
    console.log("请求失败", err);
  };
};

/*clearInterval后，不影响本次执行的后续代码，即clearInterval后的代码会正常执行*/
const averagePing = () => {
  const timer = setInterval(() => {
    console.log("定时器");
    if (avePingProxy.length >= 5) {
      clearInterval(timer);
      testBtn.disabled = false;
      return;
    }
    ping();
  }, 1000);
};

testBtn.addEventListener("click", () => {
  avePing.innerHTML = "<span>结果</span>";
  avePingProxy.length = 0;
  testBtn.disabled = true;
  avePing.classList.remove("hide");
  averagePing();
});

//#endregion

//#region interface layer

const handler = {
  set: function (target, key, value, reciver) {
    console.log("代理");
    if (key !== "length") {
      const liEl = document.createElement("li");
      liEl.innerText = `来自bilibili的回复: 平均时延 = ${value}ms`;
      avePing.appendChild(liEl);
    }
    return Reflect.set(target, key, value, reciver);
  },
};
const avePingProxy = new Proxy(jitterList, handler);

//error:数组push操作还改变了length属性，所以捕获push操作会执行两次set
//#endregion
