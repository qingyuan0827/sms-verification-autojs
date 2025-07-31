/***
{"version":12,"description":"简易 js 脚本","timeout":600,"params":[{"name":"test_input","type":"txt","description":"测试文本框"},{"name":"test_list","type":"list","description":"测试下拉框","items":[{"key":"1","value":"下拉选项一"},{"key":"2","value":"下拉选项二"},{"key":"3","value":"下拉选项三"}]}]}
***/

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

    // 方法2：WebView处理
    if (!loginButton) {
        clickWebViewButton();
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
                swipe(device.width/2, device.height*0.8, 
                      device.width/2, device.height*0.2, 800);
                sleep(1000);
            }
            
            // 4. 精准滑动到柬埔寨（基于截图位置）
            for (let i = 0; i < 30; i++) {
                // 查找柬埔寨
                let cambodia = text("柬埔寨").findOne(1000);
                if (!cambodia) {
                    // 微调滑动（每次滑动2-3个条目高度）
                    swipe(device.width/2, device.height*0.6,
                          device.width/2, device.height*0.4, 500);
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
        var list = context.getPackageManager().getInstalledPackages(0);
        console.log("已安装应用列表:");
        for (var i = 0; i < Math.min(list.size(), 10); i++) { // 只打印前10个避免刷屏
            console.log(i + ": " + list.get(i).packageName);
        }

        // 2. 修正应用包名并启动
        const apps = [
            { name: "虎扑", pkg: "com.hupu.games" } // 确保包名正确
        ];

        apps.forEach(function (app) {
            console.log("尝试启动 " + app.name + "..."); // 改用字符串拼接
            if (isAppInstalled(app.pkg)) {
                const success = launchApp(app.pkg);
                console.log(app.name + "启动结果:", success); // 改用字符串拼接
                if (!success) {
                    return;
                }
                // 点击登录按钮并验证
                if (clickLoginButton()) {
                    console.log("成功进入登录页面");
                    // 这里可以添加后续操作...
                    if (selectCountry()) {
                        // 验证是否成功切换到+855
                        let newCode = desc("+855").findOne(3000) ||
                            text("+855").findOne(3000);
                        if (newCode) {
                            console.log("成功选择柬埔寨(+855)");
                        }
                    }
                }
            } else {
                console.error(app.name + "未安装!"); // 改用字符串拼接
            }
            sleep(10 * 1000);
        });

    } catch (error) {
        console.error("任务执行出错:", error.toString());
    }
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