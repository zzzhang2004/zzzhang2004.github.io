UI.form = select('form');
/**
 *异步代码开始，用于用户UI的交互控制（按钮点击事件）
 *
 */
select('button#signIn').onclick = function(ev){
    ev.preventDefault() ;
    let users = Model.users ;
    let userName = UI.form.user.value.trim() ;
    let passWord = UI.form.pass.value.trim() ;
    if(userName.length > 0 && passWord.length > 0){
        let user = {
            'userName': userName ,
            'passWord': passWord
        }
        let exist = false ;
        for(let u of users){
            if(u.userName == userName){
                exist = true ;
                break ;
            }
        }
        if(exist){
            UI.log(userName + '已经存在， 注册不成功！') ;
        }else{
            UI.log(userName + '注册成功！') ;
            users.push(user) ;
        }
        //所有在网络和磁盘IO的异步数据的传送，要用JSON字符串
        let s = JSON.stringify(users) ;
        localStorage.setItem('users', s) ;
    }else{//有效的用户名和密码注册
        UI.log("无效注册，用户名和密码不能为空");

    }
} ; //注册按钮点击事件

select('button#loginIn').onclick = function(ev){
    ev.preventDefault() ;
    let users = Model.users ;
    let userName = UI.form.user.value ;
    let passWord = UI.form.pass.value ;

    let success = false ;
    for(let u of users){
        if(u.userName === userName && u.passWord === passWord){
            success = true ;
            break ;
        }
    }
    if(success &&  Model.CET6.length > 5000 ){
        UI.log(userName + '成功登录！') ;
        Model.user = userName ;
        UI.form.style.display = 'none' ;
        //预读每个用户的背单词的状态
        let learned = localStorage.getItem( Model.user + '-learned') ;
        if(learned){
            Model.learned = JSON.parse(learned) ;
        }else{
            Model.learned = [] ;
        }

        let learning = [] ;
        for(let i=0;i < Model.numOfLearning ; i++){
            let rand = Math.floor(Math.random() * Model.CET6.length ) ;
            let word = Model.CET6[rand] ;
            word.sn = rand ;
            learning.push(word) ;
        }
        Model.learning =  learning ;
        UI.printWord() ;
    }else{ //不允许登录的二种情况，用户名和密码问题， 单词库未加载的问题
        if(!success){
            UI.log(userName + '登录不成功，请查看用户名和密码！') ;
        }
        if(Model.CET6.length < 5000){
            UI.log('单词库还未加载完毕，请等会儿再登录！') ;
        }
    }

} ; //登录按钮点击事件


//为页面上DOM元素（四个按钮），设置点击程序的功能
select('button#firstWord').onclick = function(){
    Model.pos = 0 ;
    UI.printWord() ;

}


select('button#nextWord').onclick = function(){
    if( Model.pos < Model.learning.length -1){
        Model.pos ++ ;
    }else{
        Model.pos = 0 ;
    }
    UI.printWord() ;
    UI.response('继续加油吧！');

}

select('button#lastWord').onclick = function(){
    Model.pos = Model.learning.length - 1  ;
    UI.printWord() ;

}
/***
 *  5个中文选项的动态代码，记录用户是否认识本单词
 * */
UI.cnDoms = document.querySelectorAll('p.cn') ;
for(let cn of UI.cnDoms){
    cn.onclick = function(){
        // console.log(cn.textContent) ;
        let txt = cn.textContent ;
        let pos = Model.pos ;
        if(txt === Model.learning[pos].cn){
            UI.response("答对了!");
            Model.learning[pos].level -- ;
            this.className += ' right' ;
        }else{
            UI.response("答错了!");
            Model.learning[pos].level ++ ;
            this.className += ' wrong' ;
        }
    }
}

select('button#saveWord').onclick = function(){
    if(Model.pos === Model.numOfLearning -1){
        let learned = Model.learned ;
        if(learned.length >= Model.numOfLearning){
            for(let word of Model.learning){
                let found = false ;
                for(let l of learned){
                    if (l.sn == word.sn){
                        if(l.level > word.level )  l.level = word.level ;
                        found = true ;
                        break ;
                    }
                }
                if(!found){
                    let l = {} ;
                    l.sn = word.sn ; l.level = word.level ;
                    learned.push(l) ;
                }
            }
            let str = JSON.stringify(learned);
            localStorage.setItem(Model.user+'-learned' ,str) ;

        }else{
            learned = [] ;
            for(let w of Model.learning){
                let l = {} ;
                l.sn = w.sn ;
                l.level = w.level ;
                learned.push(l) ;
            }
            let str = JSON.stringify(learned) ;
            localStorage.setItem(Model.user+'-learned', str) ;

        }
        UI.log("您曾学习的单词总数为： " + learned.length + " 个！" ) ;
    }else{
        UI.log('本组单词还未背完，不能存储学习进度！') ;
    }
};//saveWord 结束

// 假设 Model.CET6 已经有单词和它们的学习时间
document.getElementById("reviewWord").addEventListener("click", function() {
    reviewWord(); // 调用只显示当前单词时间的函数
});

// 假设你有一个当前单词的索引，当前单词是 Model.CET6[currentIndex]
let currentIndex = 0; // 当前单词的索引，初始为0，后续可以更新为当前单词索引

function reviewWord() {
    let log = document.getElementById('log');
    log.innerHTML = "";  // 清空显示区域

    // 获取当前单词
    let word = Model.CET6[currentIndex];
    let wordDetails = `${word.en} (${word.pn}) - `;

    if (word.timer) {
        let d = word.timer;
        let formattedDate = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`; // 格式化日期
        wordDetails += `背诵时间: ${formattedDate}`;
    } else {
        wordDetails += "尚未背诵";
    }

    // 创建并添加该单词的学习时间信息
    let p = document.createElement('p');
    p.textContent = wordDetails;
    log.appendChild(p);
}

//reviewWord 结束


// 创建全局函数
function select(s){
    let dom = document.querySelector(s) ;
    return dom ;

}