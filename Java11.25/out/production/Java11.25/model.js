// Model用于记录程序的数据和运行状态
let Model = {
    timerBegin : new Date(),
    numOfLearning : 10,
    learning : [],
    learned : []
};

Model.CET6 = [];

// 局部代码，用于处理单词数据，处理完成的单词对象数据放在Model.CET6数组中
let createCET6 = function(s) {
    let cetArr = s.split('\r\n');
    for (let i = 0; i < cetArr.length; i++) {
        let wordArr = cetArr[i].split('\t');
        let obj = {};
        obj.en = wordArr[0];
        obj.pn = wordArr[1];
        obj.cn = wordArr[2];
        let enlength = obj.en.length;
        if (enlength > 1 && enlength < 5) {
            obj.level = 1;
        } else {
            if (enlength < 8) {
                obj.level = 2;
            } else {
                obj.level = 3;
            }
        }
        Model.CET6.push(obj);
    }
};

// 为了让慢速网络环境能够迅速响应用户的操作，我们先在代码中存放3个单词
let cet6String = "a\t/ei/\tart.一(个);每一(个);(同类事物中)任一个\r\nabandon\t/ə'bændən/\tvt.离弃,丢弃;遗弃,抛弃;放弃\r\nabdomen\t/æb'dəumen/\tn.腹,下腹(胸部到腿部的部分)";
createCET6(cet6String);

// 远程异步读取三个大型单词文本
fetch('cet/cet1.txt') // 读取cet/cet1.txt
    .then(resp => resp.text())
    .then(txt => {
        Model.CET6 = [];
        createCET6(txt);
        UI.log('系统成功读取了' + Model.CET6.length + '个单词！');
    });

setTimeout(function() { // 读取cet/cet2.txt
    fetch('cet/cet2.txt') // 读取cet/cet2.txt
        .then(resp => resp.text())
        .then(txt => {
            createCET6(txt);
            UI.log('系统成功读取了' + Model.CET6.length + '个单词！');
        });
}, 2 * 1000);

setTimeout(function() {
    fetch('cet/cet3.txt')
        .then(res => res.text())
        .then(txt => {
            createCET6(txt);
            UI.log('系统最后成功读取了' + Model.CET6.length + '个单词！');
        });
}, 5 * 1000);

// 局部代码：随机分配时间戳给每个单词


// Model.pos用于记录系统的当前单词
Model.pos = 0;
Model.users = [];

// 预读本地硬盘的用户信息
let str = localStorage.getItem('users');
if (str) {
    let users = JSON.parse(str);
    Model.users = users;
}

let UI = {}; // UI用于表达用户界面，以及改变用户界面上的内容
UI.printWord = function() { // 用于把当前单词（Model.pos存储的索引）显示出来
    let CET6 = Model.learning;
    let pos = Model.pos;

    select('p#en').textContent = CET6[pos].en;
    select('p#pn').textContent = CET6[pos].pn;

    select('span#level').textContent = '难度: ' + CET6[pos].level;

    // 产生一个数组，包含5个单词的中文，其中一个是单词本身
    let cnArr = [];
    let ok = false; // 默认时，正确中文答案没有放置
    for (let i = 0; i < 5; i++) {
        let lv = Math.random() * (5 - i);
        if (lv < 1 && !ok) {
            ok = true;
            cnArr.push(CET6[pos].cn);
        } else {
            let rand = Math.floor(Math.random() * Model.CET6.length);
            cnArr.push(Model.CET6[rand].cn);
        }
    } // 循环5次，产生中文随机数组

    if (!ok) {
        ok = true;
        cnArr[4] = CET6[pos].cn;
    }

    for (let i = 1; i < 6; i++) {
        select('p#cn' + i).textContent = cnArr[i - 1];
        select('p#cn' + i).className = 'cn'; // 清楚用户在点击选择时产生的对、错样式
    }
    for (let word of Model.CET6) {
        let y = Math.random() > 0.5 ? 2023 : 2024; // 随机选择2023年或2024年
        let m = Math.floor(12 * Math.random()); // 随机选择月份（0-11）
        let d = Math.floor(31 * Math.random()); // 随机选择日期（0-30）

        // 创建日期对象
        let t = new Date(y, m, d);
        word.timer = t; // 将随机生成的时间戳赋值给单词对象的 timer 属性
    }

    let s = "";
    if (CET6[pos].timer) {
        let d = CET6[pos].timer;
        s = '您在' + d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + (d.getDate()) + '日' + ' 学过';
    } else {
        s = "您这个单词没学过。";
    }

    UI.log(s + '@' + (pos + 1) + '/' + Model.numOfLearning + '.');
};

UI.log = function(s) {
    select('p#log').textContent = s;
};

UI.footerLog = function(s) {
    select('footer').textContent = s;
    setTimeout(() => {
        select('footer').textContent = "welcome";
    }, 3 * 1000);
};

UI.response = function(s) {
    select('span#response').textContent = s;
};

UI.userStatus = function() {
    let easy = 0, normal = 0, hard = 0;
    for (let word of Model.learned) {
        if (word.level == 0) {
            easy++;
        } else if (word.level < 3) {
            normal++;
        } else {
            hard++;
        }
    }
    let s = Model.user + '状态: ' + easy + '熟悉/' + normal + '一般/' + hard + '陌生';
    select('p#title').textContent = s;
    setTimeout(() => {
        select('p#title').textContent = 'CET6-轻轻松松背单词';
    }, 1000 * 10);
};
