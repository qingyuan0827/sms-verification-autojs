// APIClient.js - 兼容Auto.js基础版
// 移除了module.exports，改用全局变量导出功能

const URL_GET_NUMBER = "http://www.jisu366.com/jk/getnumber";
const URL_GET_CODE = "http://www.jisu366.com/jk/getcode";
const URL_RELEASE_NUMBER = "http://www.jisu366.com/jk/shifang";
const API_KEY = "AzjteYd3cJ";
const PID = "323";
const QUHAO = "855";

// 全局变量存储功能（替代module.exports）
var APIClient = {
    id: null,
    
    fetchPhoneNumber: function() {
        let number = null;
        const maxRetries = 2;
        let retryCount = 0;

        console.log("进入 fetchPhoneNumber 方法");

        while (retryCount <= maxRetries) {
            try {
                const response = this.httpGet(URL_GET_NUMBER + "?apikey=" + API_KEY + 
                                           "&pid=" + PID + "&quhao=" + QUHAO);
                
                if (response) {
                    const jsonResponse = JSON.parse(response);
                    const errno = jsonResponse.errno;
                    
                    if (errno === 0) {
                        const ret = jsonResponse.ret;
                        number = ret.number;
                        this.id = ret.qhid;
                        console.log("获取号码成功: " + number + "，取号ID: " + this.id);
                        return number;
                    } else {
                        const errmsg = jsonResponse.errmsg;
                        console.error("请求失败（第" + (retryCount+1) + "次）: " + errmsg);
                        
                        if (retryCount < maxRetries) {
                            sleep(1000);
                        }
                        retryCount++;
                    }
                } else {
                    console.error("获取空响应（第" + (retryCount+1) + "次尝试）");
                    if (retryCount < maxRetries) {
                        sleep(1000);
                        retryCount++;
                    } else {
                        break;
                    }
                }
            } catch (e) {
                console.error("请求失败（第" + (retryCount+1) + "次）: " + e);
                sleep(5000);
                if(retryCount++ > maxRetries){
                    throw e;
                }
            }
        }
        return null;
    },
    
    getVerifyCode: function() {
        let errno = 0;
        let verifyMsg = null;
        const response = this.httpGet(URL_GET_CODE + "?apikey=" + API_KEY + "&qhid=" + this.id);
        console.log(response);
        
        if (response) {
            const jsonResponse = JSON.parse(response);
            errno = jsonResponse.errno;
            
            if (errno === 0) {
                const ret = jsonResponse.ret;
                verifyMsg = ret.cnt;
            } else {
                const errmsg = jsonResponse.errmsg;
                console.error("请求失败: " + errmsg);
            }
        }
        return {errno: errno, verifyMsg: verifyMsg};
    },
    
    releaseNumber: function() {
        const response = this.httpGet(URL_RELEASE_NUMBER + "?apikey=" + API_KEY + "&qhid=" + this.id);
        console.log(response);
    },
    
    httpGet: function(url) {
        console.log("请求地址：" + url);
        
        try {
            const res = http.get(url, {
                timeout: 60000 // 60秒超时
            });
            
            if (res.statusCode === 200) {
                return res.body.string();
            } else {
                console.error("请求失败，状态码: " + res.statusCode);
                return null;
            }
        } catch (e) {
            console.error("HTTP请求异常: " + e);
            return null;
        }
    },
    
    getId: function() { 
        return this.id; 
    }
};

module.exports = APIClient;  // 关键导出

// 测试代码
// function main() {
//     try {
//         // 直接使用全局对象（替代require）
//         const number = APIClient.fetchPhoneNumber();
        
//         if (number) {
//             const codeResult = APIClient.getVerifyCode();
//             console.log("验证码结果:", codeResult);
//         }
//     } catch (e) {
//         console.error("执行出错:", e);
//     }
// }

// 执行测试
// main();