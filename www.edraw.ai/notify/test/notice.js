const langList = [
    // "CN",
    "EN",
    "DE",
    "ES",
    "FR",
    "ID",
    "IT",
    "JP",
    "KO",
    "PT",
    "CH", // 繁体，对应pc
    "RU",
];
const NOTICE_URL_ONLINE = {
    edraw_config: "https://www.edraw.ai/notify/config.json",
    edraw_dialog: "https://www.edraw.ai/notify/dialog.html",
    edraw_notice: "https://www.edraw.ai/notify/notice.html",
    edraw_home: "https://www.edraw.ai/app/aipower",
    mind_config: "https://www.edrawmind.com/notify/config.json",
    mind_dialog: "https://www.edrawmind.com/notify/dialog.html",
    mind_notice: "https://www.edrawmind.com/notify/notice.html",
    mind_home: "https://www.edrawmind.com/app/create",
};

const NOTICE_URL_DEV = {
    edraw_config: "https://dev-en.edraw.ai/app/js/config.json",
    edraw_config_js: "https://www.edraw.ai/notify/test/config-test.js",
    edraw_dialog: "https://www.edraw.ai/notify/test/dialog.html",
    edraw_notice: "https://www.edraw.ai/notify/test/notice.html",
    edraw_home: "http://dev-en.edraw.ai/app",
    mind_config: "http://dev.master.com/app/assets/js/config.json",
    mind_config_js: "https://www.edrawmind.com/notify/test/config-test.js",
    mind_dialog: "https://www.edrawmind.com/notify/test/dialog.html",
    mind_notice: "https://www.edrawmind.com/notify/test/notice.html",
    mind_home: "http://dev.master.com/app/create/",
};


let _OPEN = true; // 线上环境 全局开关
let _OPEN_DEV = true; // dev环境 全局开关
let _IS_FIRST_SHOW = false; // 首次展示记录标识
// DEV
let DEV_LOCAL;
let NOTICE_URL;
let _TIMER = {
    _NOTICE: null,
    _GLOBALAPI: null,
    _FORCEOFF: null,
    _REDIRECT: null
};
let _CURRENT_DATA = null;
let _KEY = "";
let _NOTICE_CACHE = [];
let _NOTICE_TOAST = null;
let lang;
// 确定引用环境
let isEdrawAI;
let isMind;
// 确定是首页还是编辑页
let isEdrawEditor;
let isMindEditor;
let isEditor;

function useNotice() {
    // 判断OPEN
    setEnv()
    const open = DEV_LOCAL ? _OPEN_DEV : _OPEN;

    const nowEditor = isEdrawAI ? location.href.includes("/master/") || location.href.includes("/max/") : location.href.includes("/editor/")
    // 从首页跳到编辑页
    const homeToEditor = !isEditor && nowEditor
    // 从编辑页跳到首页
    const editorTohome = isEditor && !nowEditor
    const canStart = _IS_FIRST_SHOW ? homeToEditor : true

    if (open && (homeToEditor || editorTohome)) {
        clearTimer();
        setHomeEditor()
    }
    if (open && canStart) {
        const iframeMask = document.getElementById("notice-iframe-mask");
        if (iframeMask) {
            iframeMask.parentNode.removeChild(iframeMask);
        }

        setData();
        getJsonData();
        window.addEventListener("message", receiveMessage, false);
        window.addEventListener("beforeunload", beforeUnload);
    } else {
        window.removeEventListener("message", receiveMessage, false);
        window.removeEventListener("beforeunload", beforeUnload);
    }

    function receiveMessage(event) {
        const receiveData = event.data;
        const type = receiveData.type;
        if (type === "close") {
            removeIframe(receiveData.data);
            if (isEditor) {
                location.href = isEdrawAI ?
                    NOTICE_URL.edraw_home :
                    NOTICE_URL.mind_home;
            }
        }
    };

    // 确定时间
    function getJsonData() {
        if (DEV_LOCAL) {
            const script = document.createElement("script");
            script.src = isEdrawAI ? NOTICE_URL.edraw_config_js : NOTICE_URL.mind_config_js
            document.body.appendChild(script);
            script.onload = () => {
                success(window._NOTICE_CONFIG)
            }
            return
        }

        fetch(isEdrawAI ? NOTICE_URL.edraw_config : NOTICE_URL.mind_config)
            .then((response) => response.json())
            .then((data) => {
                success(data)
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                // const interval = (150 + Math.floor(60 * Math.random())) * 1000;
                // setTimeout(getJsonData, interval);
            });


        function success(data) {
            let list = data || [];

            if (isEdrawAI && isEdrawEditor) {
                // EdrawAI编辑页
                setCurrentData(list);
            } else if (isEdrawAI && !isEdrawEditor) {
                // EdrawAI首页 isEdrawAI && !isEdrawEditor
                if (canShowAtHome(list)) insertIframe();
            } else if (isMind && isMindEditor) {
                // Mind编辑页
                setCurrentData(list);
            } else if (isMind && !isMindEditor) {
                // Mind首页
                if (canShowAtHome(list)) {
                    insertIframe();
                }
            }
        }
    }

    function setCurrentData(arr) {
        // 依次从最高优先级开始判断
        const isRedirectInTime = getDataByType(arr, "redirect")
        if (isRedirectInTime) {
            _CURRENT_DATA = isRedirectInTime
            _NOTICE_CACHE.push(redirectPage);
        } else if (!isEditor) {
            _CURRENT_DATA = getDataByType(arr, "popover")
            timeToRedirect()
        } else {
            const isOffInTime = getDataByType(arr, "forceOff")
            const isToastInTime = getDataByType(arr, "notify")

            if (isOffInTime) {
                _CURRENT_DATA = isOffInTime;
                _NOTICE_CACHE.push(forceOffPage);
                timeToRedirect()
            } else if (isToastInTime) {
                _CURRENT_DATA = isToastInTime;
                _NOTICE_CACHE.push(showToast);
                // 强制下线开始时间 - 当前时间 = 弹出强制下线弹窗间隙
                const OffData = arr.filter((item) => item.type === "forceOff");
                const nowTime = new Date().getTime();
                const timeToOff = OffData.length ?
                    OffData[0].start_time * 1000 - nowTime :
                    0;
                if (timeToOff > 0) {
                    _TIMER._FORCEOFF = setTimeout(() => {
                        _CURRENT_DATA = OffData[0];
                        forceOffPage()
                    }, timeToOff);
                }
            }
        }
        watchGlobalApi();

        function timeToRedirect() {
            // 重定向开始时间 - 当前时间 = 重定向页面间隙
            const RedirectData = arr.filter((item) => item.type === "redirect");
            const nowTime = new Date().getTime();
            const timeToOff = RedirectData.length ?
                RedirectData[0].start_time * 1000 - nowTime :
                0;
            if (timeToOff > 0) {
                _TIMER._REDIRECT = setTimeout(() => {
                    _CURRENT_DATA = RedirectData[0];
                    redirectPage()
                }, timeToOff);
            }
        }
    }

    function canShowAtHome(arr) {
        setCurrentData(arr);
        if (!_CURRENT_DATA) return false;

        _KEY = `notice-${_CURRENT_DATA.interval}-${_CURRENT_DATA.start_time}`;
        const value = localStorage.getItem(_KEY);
        // 仅展示一次
        if (!_CURRENT_DATA.interval) {
            return value ? false : true;
        } else {
            const nowTime = new Date().getTime();
            // 有值 && 当前时间小于过期时间 = 不展示
            if (value && nowTime < value) return false;
        }

        return true;
    }

    function getTodayEndTimes() {
        // 获取今天的日期
        const today = new Date();
        // 设置时间为23:59:59
        today.setHours(23, 59, 59, 999);
        const timestamp = Math.floor(today.getTime());
        return timestamp;
    }

    function insertIframe() {
        const oldiframe = document.getElementById("notice-iframe");
        if (oldiframe) return;

        // 创建一个 iframe 元素
        const iframe = document.createElement("iframe");

        // 设置 iframe 的属性
        iframe.src = isEdrawAI ?
            NOTICE_URL.edraw_dialog :
            NOTICE_URL.mind_dialog;
        iframe.id = "notice-iframe"; // 动态设置 id 属性
        iframe.style.position = "absolute";
        iframe.style.top = "50%";
        iframe.style.left = "50%";
        iframe.style.transform = "translate(-50%, -50%)";
        iframe.style.width = isEdrawAI ? "400px" : "432px";
        iframe.style.height = isEdrawAI ? "364px" : "350px";
        iframe.style.borderRadius = "8px";
        iframe.style.border = "none";

        const mask = document.createElement("div");
        mask.id = "notice-iframe-mask";
        mask.classList.add("ed-mask");
        mask.style.zIndex = "9999";
        mask.style.display = "none";
        iframe.style.boxShadow = "0px 15px 30px 0px rgba(0, 0, 0, 0.15)";

        // 将 iframe 插入到 body 中
        mask.appendChild(iframe);
        document.body.appendChild(mask);

        iframe.addEventListener("load", function () {
            mask.style.display = "block";
            // update lang
            if (isMind) {
                let l = 'en'
                if (window.store) l = window.store.getters.currentLang
                if (langList.includes(l.toUpperCase())) {
                    lang = l.toLowerCase()
                }
            }
            iframe.contentWindow.postMessage({
                    type: "content",
                    data: {
                        ..._CURRENT_DATA.message[lang],
                        icon_url: _CURRENT_DATA.icon_url,
                        editor: isEditor,
                        from: isEdrawAI ? "edrawai" : "mind",
                        showToday: !isEditor && _CURRENT_DATA.interval
                    },
                },
                "*"
            );
            _TIMER._NOTICE && clearInterval(_TIMER._NOTICE);
            if (!_IS_FIRST_SHOW && !isEditor) _IS_FIRST_SHOW = true
        });
    }

    function removeIframe(data) {
        const {
            today
        } = data;
        if (!isEditor) {
            _TIMER._NOTICE && clearInterval(_TIMER._NOTICE);
            // 勾选今日不再提示
            if (today) {
                const todayEnd = getTodayEndTimes();
                _KEY && localStorage.setItem(_KEY, todayEnd);
            } else if (!_CURRENT_DATA.interval) {
                // 只展示一次
                _KEY && localStorage.setItem(_KEY, _CURRENT_DATA.end_time * 1000);
            } else {
                // 重置定时器
                _TIMER._NOTICE = setInterval(() => {
                    insertIframe();
                }, _CURRENT_DATA.interval * 1000);
            }
        }

        const iframeMask = document.getElementById("notice-iframe-mask");
        if (iframeMask) {
            iframeMask.parentNode.removeChild(iframeMask);
        }
    }

    function redirectPage() {
        const url = isEdrawAI ?
            NOTICE_URL.edraw_notice :
            NOTICE_URL.mind_notice;
        location.href = `${url}?lang=${lang}`
    }

    function forceOffPage() {
        // 弹出时保存文件(max)，点击确定时返回首页
        const isMaxEditor = location.href.includes("/max/");
        if (isMaxEditor) {
            window.globalApi.$bus.emit("savefile");
        }
        insertIframe();
    }

    function showToast() {
        if (_NOTICE_TOAST) return
        _NOTICE_TOAST = window.globalApi.$message({
            type: "warning",
            showClose: true,
            duration: 0,
            message: _CURRENT_DATA.message[lang].body,
            customClass: "ed_notice_toast"
        });
        const mesDom = document.querySelectorAll(".ed_notice_toast")
        if (mesDom && mesDom[0].style.display === "none") {
            mesDom[0].style.display = "flex"
        }
    }

    function watchGlobalApi() {
        _TIMER._GLOBALAPI = setInterval(() => {
            if (window.globalApi) {
                _NOTICE_CACHE.forEach((fun) => fun());
                clearInterval(_TIMER._GLOBALAPI);
                _TIMER._GLOBALAPI = null
                _NOTICE_CACHE = [];
            }
        }, 1000);
    }

    function setData() {
        setHomeEditor()
        // DEV
        NOTICE_URL = DEV_LOCAL ? NOTICE_URL_DEV : NOTICE_URL_ONLINE;

        _TIMER = {
            _NOTICE: null,
            _GLOBALAPI: null,
            _FORCEOFF: null,
            _REDIRECT: null,
        };
        _CURRENT_DATA = null;
        _KEY = "";
        _NOTICE_CACHE = [];

        // 确定语言环境
        const params = new URL(document.location).searchParams;
        const s_lang = params.get('lang')
        lang = s_lang && langList.includes(s_lang.toUpperCase()) ? s_lang.toLowerCase() : 'en'

        if (isMind) {
            // mind获取多语言
            _NOTICE_CACHE.push(setLangByStore)
        }
    }

    function setLangByStore() {
        // 需要调接口profile获取，等1s
        setTimeout(() => {
            let l = 'en'
            if (window.store) l = window.store.getters.currentLang
            if (langList.includes(l.toUpperCase())) {
                lang = l.toLowerCase()
            }
        }, 1000)
    }

    function clearTimer() {
        // 清除定时器
        if (_TIMER._NOTICE) {
            clearInterval(_TIMER._NOTICE);
            _TIMER._NOTICE = null
        }
        if (_TIMER._GLOBALAPI) {
            clearInterval(_TIMER._GLOBALAPI);
            _TIMER._GLOBALAPI = null
        }
        if (_TIMER._FORCEOFF) {
            clearInterval(_TIMER._FORCEOFF);
            _TIMER._FORCEOFF = null
        }
        if (_TIMER._REDIRECT) {
            clearInterval(_TIMER._REDIRECT);
            _TIMER._REDIRECT = null
        }
        if (_NOTICE_TOAST) {
            _NOTICE_TOAST.close()
            _NOTICE_TOAST = null
        }

        // 如果没有close方法，找到dom元素移除
        const mesDom = document.querySelectorAll(".ed_notice_toast")
        if (mesDom && mesDom[0]) {
            mesDom[0].style.display = "none"
        }
    }

    // 页面销毁
    function beforeUnload() {
        clearTimer();
    }

    function getDataByType(arr, type) {
        const nowTime = new Date().getTime();
        const res = arr.filter((item) => {
            return (
                item.type === type &&
                item.start_time * 1000 < nowTime &&
                item.end_time * 1000 > nowTime
            );
        });
        return res && res.length ? res[0] : null
    }

    function setEnv() {
        DEV_LOCAL =
            location.host.includes("127.0.0.1") ||
            location.host.includes("10.90") ||
            location.host.includes("dev-en") || location.host.includes("dev");

        // 确定引用环境
        isEdrawAI =
            location.host.includes("edraw.ai") ||
            location.host.includes(":5001");
        isMind = location.host.includes("edrawmind.com") || location.host.includes("dev.master.com") || location.host.includes(":3000");
    }

    function setHomeEditor() {
        // 确定是首页还是编辑页
        isEdrawEditor = location.href.includes("/master/") || location.href.includes("/max/");
        isMindEditor = location.href.includes("/editor/");
        isEditor = isMind ? isMindEditor : isEdrawAI ? isEdrawEditor : false;
    }
}