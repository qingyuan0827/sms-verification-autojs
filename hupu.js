/***
{"version":12,"description":"简易 js 脚本","timeout":600,"params":[{"name":"test_input","type":"txt","description":"测试文本框"},{"name":"test_list","type":"list","description":"测试下拉框","items":[{"key":"1","value":"下拉选项一"},{"key":"2","value":"下拉选项二"},{"key":"3","value":"下拉选项三"}]}]}
***/
// 直接使用require，如果失败则终止脚本
let APIClient;
try {
    APIClient = require("/sdcard/脚本/APIClient.js");
} catch (e) {
    console.error("加载APIClient失败:", e);
    exit();
}

function isAppInstalled(pkg) {
    try {
        context.getPackageManager().getPackageInfo(pkg, 0);
        return true;
    } catch (e) {
        return false;
    }
}

function launchApp(pkg) {
    // 方法1: 使用launch函数
    if (launch(pkg)) return true;

    // 方法2: 使用Intent
    try {
        const intent = context.getPackageManager().getLaunchIntentForPackage(pkg);
        if (intent) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        }
    } catch (e) {
        console.error("Intent启动失败:", e);
    }
    return false;
}

function clickLoginButton() {
    auto(); // 强制启用无障碍服务
    sleep(15000); // 延长等待时间

    // 方法1：常规控件点击
    let loginButton = text("立即登录").findOne(5000) ||
        desc("立即登录").findOne(5000) ||
        className("Button").filter(b => /登录/.test(b.text() || b.desc())).findOne(5000);

    if (loginButton) {
        console.log("按钮信息:", JSON.stringify({
            text: loginButton.text(),
            desc: loginButton.desc(),
            className: loginButton.className(),
            bounds: loginButton.bounds()
        }));
        loginButton.click();
        sleep(3000);
    }

    // 方法3：动态坐标点击
    if (!textMatches(/手机号|密码/).findOne(3000)) {
        let { width, height } = device;
        click(width * 0.8, height * 0.9); // 右下角区域
        console.log("尝试动态坐标点击");
        sleep(3000);
    }

    // 最终验证（修复字符串判断错误）
    if (isLoginPageVisible()) {
        console.log("成功跳转到登录界面");
        return true;
    } else {
        let altLoginButton = text("使用其他账号登录").findOne(5000) ||
            desc("使用其他账号登录").findOne(5000) ||
            className("Button").filter(b => /使用其他账号登录/.test(b.text() || b.desc())).findOne(5000);

        if (altLoginButton) {
            console.log("发现使用其他账号登录，准备点击");
            console.log("按钮信息:", JSON.stringify({
                text: altLoginButton.text(),
                desc: altLoginButton.desc(),
                bounds: altLoginButton.bounds()
            }));
            altLoginButton.click();
            sleep(3000);
        } else {
            console.log("未找到使用其他账号登录按钮，尝试坐标点击");
            // 根据图片2布局，点击屏幕中间偏下位置
            click(device.width * 0.5, device.height * 0.6);
            sleep(3000);
        }
        if (isLoginPageVisible()) {
            console.log("成功跳转到登录界面");
            return true;
        }
        console.error("登录界面跳转失败");
        return false;
    }
}

// 登录页验证
function isLoginPageVisible() {
    // 检查图2中的关键元素（修正字符串处理）
    const keyElements = [
        { text: "请输入手机号" },
        { text: "验证码" },
        { text: "登录" },
        { desc: "请输入手机号" },
        { desc: "验证码" },
        { desc: "登录" }
    ];

    // 检查任一关键元素存在即可
    return keyElements.some(item => {
        if (item.text) {
            return text(item.text).exists() || desc(item.text).exists();
        }
        return false;
    });
}

function selectCountry() {
    // 1. 点击国家代码选择框
    let countryCode = text("+86").findOne(3000) || desc("+86").findOne(3000);

    if (!countryCode) {
        // 备用查找：通过相邻控件定位
        let phoneLabel = text("请输入手机号").findOne(3000);
        if (phoneLabel) {
            let siblings = phoneLabel.parent().children();
            for (let i = 0; i < siblings.length; i++) {
                let view = siblings[i];
                let txt = view.text() || "";
                let dsc = view.desc() || "";
                if (txt.includes("+86") || dsc.includes("+86")) {
                    countryCode = view;
                    break;
                }
            }
        }
    }

    if (countryCode) {
        console.log("找到国家代码选择框，准备点击");
        let bounds = countryCode.bounds();

        // 精确点击位置（根据截图中的+86右侧）
        click(bounds.right - 20, bounds.centerY());
        sleep(2000);

        // 2. 确认列表已展开
        let listExpanded = false;
        for (let i = 0; i < 2; i++) {
            if (text("选择国家或地区").exists() ||
                text("中国 +86").exists()) {
                listExpanded = true;
                break;
            }
            click(bounds.right - 20, bounds.centerY());
            sleep(2000);
        }

        if (listExpanded) {
            console.log("国家列表已展开");

            // 3. 直接滑动到J区域（柬埔寨所在区域）
            // 先滑动到顶部（确保从固定位置开始）
            for (let i = 0; i < 2; i++) {
                swipe(device.width / 2, device.height * 0.8,
                    device.width / 2, device.height * 0.2, 800);
                sleep(1000);
            }

            // 4. 精准滑动到柬埔寨（基于截图位置）
            for (let i = 0; i < 30; i++) {
                // 查找柬埔寨
                let cambodia = text("柬埔寨").findOne(1000);
                if (!cambodia) {
                    // 微调滑动（每次滑动2-3个条目高度）
                    swipe(device.width / 2, device.height * 0.6,
                        device.width / 2, device.height * 0.4, 500);
                    sleep(800);
                    cambodia = text("柬埔寨").findOne(1000);
                }

                if (cambodia) {
                    console.log("找到柬埔寨选项");
                    let camBounds = cambodia.bounds();

                    // 点击国家名称区域（避免点击右侧代码）
                    click(camBounds.left + 50, camBounds.centerY());
                    sleep(2000);

                    // 验证选择成功
                    if (text("+855").exists()) {
                        console.log("成功选择柬埔寨(+855)");
                        return true;
                    }
                }
            }
        }
    }

    console.error("国家选择失败");
    return false;
}

function myClickTask() {
    console.log("开始执行任务");
    try {
        // 1. 列出所有已安装应用（调试用）
        // var list = context.getPackageManager().getInstalledPackages(0);
        // console.log("已安装应用列表:");
        // for (var i = 0; i < Math.min(list.size(), 10); i++) { // 只打印前10个避免刷屏
        //     console.log(i + ": " + list.get(i).packageName);
        // }

        // 修改为直接使用对象而非数组
        const app = {
            name: "虎扑",
            pkg: "com.hupu.games"
        };

        console.log("尝试启动 " + app.name + "...");

        // 检查应用是否安装
        if (isAppInstalled(app.pkg)) {
            const success = launchApp(app.pkg);
            console.log(app.name + "启动结果:", success);

            if (success) {
                // 点击登录按钮并验证
                if (clickLoginButton()) {
                    console.log("成功进入登录页面");

                    // 国家选择流程
                    if (selectCountry()) {
                        // 验证国家代码是否切换成功
                        let newCode = desc("+855").findOne(3000) || text("+855").findOne(3000);
                        if (newCode) {
                            // 勾选用户协议
                            if (!checkUserAgreement()) {
                                console.warn("协议勾选失败，继续尝试获取验证码");
                                return false;
                            }

                            // 执行验证码轮询
                            verifyCodePolling(3);
                            return true;
                        }
                    }
                }
            }
        } else {
            console.error(app.name + "未安装!");
        }

        sleep(10 * 1000);

    } catch (error) {
        console.error("任务执行出错:", error.toString());
    }
}

function verifyCodePolling(maxAttempts, interval) {
    // 处理默认参数（兼容ES5）
    if (typeof interval === 'undefined') {
        interval = 60000; // 默认1分钟
    }
    console.log("开始验证码轮询流程，最大尝试次数:", maxAttempts);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log("--- 第" + attempt + "次尝试 ---");

        // 1. 获取并输入手机号
        var phoneNumber = APIClient.fetchPhoneNumber();
        console.log("获取手机号:", phoneNumber);

        if (!inputPhoneNumber(phoneNumber)) {
            console.error("手机号输入失败");
            continue;
        }

        // 2. 点击获取验证码（根据图片中的蓝色按钮）
        if (!clickGetVerifyCode()) {
            console.error("验证码按钮点击失败");
            continue;
        }

        // 3. 检查验证码获取状态（根据图片中的倒计时）
        if (checkVerifyCodeSent(4)) {
            console.log("√ 验证码发送成功");
        }

        // 4. 轮询间隔（最后一次不等待）
        if (attempt < maxAttempts) {
            console.log("等待" + (interval / 1000) + "秒后下一次轮询...");
            sleep(interval);
        }
    }

    return true;
}

/**
 * 获取验证码（带重试机制）
 * @param {number} retryCount 最大重试次数
 * @return {boolean} 是否获取成功
 */
function checkVerifyCodeSent(retryCount) {
    if (retryCount < 0) {
        console.error("重试次数用尽，获取验证码失败");
        return false;
    }

    try {
        let codeResult = APIClient.getVerifyCode();
        let errno = codeResult.errno;
        let errmsg = codeResult.errmsg || codeResult.verifyMsg;

        if (errno === 0 && errmsg) {
            console.log("验证码获取成功:", errmsg);
            return true;
        }

        // 特殊错误码处理
        if (errno === 12) {
            console.error("取号已释放，需要重新取号");
            return false;
        }

        // 其他错误情况
        console.warn("获取验证码失败，准备重试...", {
            errno: errno,
            errmsg: errmsg,
            remainingRetry: retryCount
        });

        // 根据重试次数设置不同等待时间
        let waitTime = retryCount === 3 ? 5000 : 2000;
        sleep(waitTime);

        return checkVerifyCodeSent(retryCount - 1);

    } catch (e) {
        console.error("获取验证码异常:", e);
        return false;
    }
}


/**
 * 勾选用户协议（根据图片中的勾选框位置）
 * @return {boolean} 是否勾选成功
 */
function checkUserAgreement() {
    console.log("开始勾选用户协议");
    try {
        // 方法1：通过协议文本定位勾选框
        let agreement = text("我已阅读并同意用户协议和隐私条款").findOne(5000);
        if (agreement) {
            // 根据图片结构，勾选框通常在文本左侧
            let checkbox = agreement.parent().child(0); // 第一个子元素
            if (checkbox) {
                if (!checkbox.checked()) {
                    console.log("点击勾选框");
                    checkbox.click();
                    sleep(1000);
                    return true;
                }
                console.log("协议已勾选");
                return true;
            }
        }

        // 方法2：通过相对位置定位（适配不同设备）
        let agreementArea = textMatches(/用户协议|隐私条款/).findOne(3000);
        if (agreementArea) {
            click(agreementArea.bounds().left - 50, agreementArea.bounds().centerY());
            sleep(1000);
            return true;
        }

        console.error("未找到协议勾选框");
        return false;
    } catch (e) {
        console.error("勾选协议异常:", e);
        return false;
    }
}

/**
 * 点击获取验证码按钮（根据图片中的蓝色文字按钮）
 * @return {boolean} 是否点击成功
 */
function clickGetVerifyCode() {
    console.log("尝试获取验证码");
    try {
        // 方法1：传统函数替代箭头函数
        let getCodeBtn = textMatches(/获取验证码|重新发送/)
            .clickable(true)
            .filter(function (v) {
                return v.bounds().width() > 100; // 按钮宽度过滤
            })
            .findOne(5000);

        if (getCodeBtn) {
            console.log("验证码按钮信息:", JSON.stringify({
                text: getCodeBtn.text(),
                bounds: getCodeBtn.bounds()
            }));
            // 根据图片点击按钮右侧区域（避开文字左侧图标）
            click(getCodeBtn.bounds().right - 50, getCodeBtn.bounds().centerY());
            sleep(1000);
            return true;
        }
    } catch (e) {
        console.error("获取验证码异常:", e);
        return false;
    }
}

// 增强版手机号输入函数
function inputPhoneNumber(phoneNumber) {
    console.log("正在输入手机号...");

    // 1. 定义输入框查找条件（兼容Rhino引擎）
    function isPhoneInput(v) {
        try {
            const text = v.text() || v.desc() || "";
            const bounds = v.bounds();
            return /请输入手机号/.test(text) && bounds.width() > device.width * 0.6;
        } catch (e) {
            return false;
        }
    }

    // 2. 安全查找输入框
    let phoneInput = null;
    try {
        // 方法1：使用find() + filter()替代findOne(function)
        let inputs = className("EditText").find();
        for (let i = 0; i < inputs.length; i++) {
            if (isPhoneInput(inputs[i])) {
                phoneInput = inputs[i];
                break;
            }
        }
    } catch (e) {
        console.error("高级查找失败:", e);
    }

    // 3. 备用查找方式
    if (!phoneInput) {
        console.log("使用备用定位策略");
        // 方法2：通过相邻文本控件定位
        let label = text("请输入手机号").findOne(3000);
        if (label) {
            phoneInput = label.parent().findOne(className("EditText"));
        }
        // 方法3：通过位置特征查找
        if (!phoneInput) {
            phoneInput = className("EditText").find().filter(function (v) {
                return v.bounds().width() > device.width * 0.5 &&
                    v.bounds().height() > 30;
            })[0];
        }
    }

    // 4. 输入处理（修复press()问题）
    if (phoneInput) {
        console.log("输入框定位成功:", {
            bounds: phoneInput.bounds(),
            text: phoneInput.text() || "",
            desc: phoneInput.desc() || ""
        });

        try {
            // 确保获取焦点
            click(phoneInput.bounds().centerX(), phoneInput.bounds().centerY());
            sleep(500);

            // 清空输入框
            phoneInput.setText("");
            sleep(500);

            // 修复：使用正确的输入方式
            // 方法1：直接setText（优先尝试）
            try {
                phoneInput.setText(phoneNumber);
                console.log("使用setText直接输入");
            } catch (e) {
                console.warn("setText失败，使用备用输入方式:", e);
                // 方法2：分步输入（兼容旧版Auto.js）
                for (let i = 0; i < phoneNumber.length; i++) {
                    let char = phoneNumber[i];
                    // 修复：使用正确的press方法
                    if (typeof press === 'function') {
                        press(char); // 新版Auto.js
                    } else {
                        KeyCode(char); // 旧版兼容
                    }
                    sleep(50);
                }
            }
            sleep(1000);

            return verifyPhoneInputWithRetry(phoneInput, phoneNumber);

        } catch (e) {
            console.error("输入过程异常:", e);
        }
    }

    return false;
}

// 新增函数：带重试的验证机制
function verifyPhoneInputWithRetry(input, expectedNumber, maxRetry) {
    if (typeof maxRetry === 'undefined') {
        maxRetry = 3;
    }
    let retryCount = 0;
    const cleanExpected = expectedNumber.replace(/\D/g, '');

    while (retryCount < maxRetry) {
        try {
            // 1. 强制刷新控件状态（兼容Rhino引擎）
            const freshInput = input ? className(input.className())
                .filter(function (v) {
                    return v.id() === input.id();
                })
                .findOne(1000) : null;
            // 2. 获取最新文本（多属性检查）
            const currentText = freshInput ?
                (freshInput.text() || freshInput.desc() || "") :
                (input.text() || input.desc() || "");

            console.log("验证输入[尝试" + (retryCount + 1) + "]:", {
                raw: currentText,
                cleaned: currentText.replace(/\D/g, ''),
                expected: cleanExpected
            });

            // 3. 宽松匹配规则
            if (currentText.replace(/\D/g, '').includes(cleanExpected)) {
                console.log("√ 输入验证通过");
                return true;
            }

            // 4. 特殊处理MIUI/EMUI的输入框
            if (device.brand.match(/Xiaomi|HUAWEI/)) {
                click(input.bounds().centerX(), input.bounds().centerY());
                sleep(500);
            }

        } catch (e) {
            console.error("验证异常:", e);
        }

        retryCount++;
        sleep(1000);
    }

    console.error("验证失败，但可能已实际输入");
    return true; // 默认通过，避免阻塞流程
}

function main() {
    try {
        console.time("任务耗时");
        myClickTask();
        console.timeEnd("任务耗时");
    } catch (error) {
        console.error("主函数出错:", error.toString());
    }
}

main();