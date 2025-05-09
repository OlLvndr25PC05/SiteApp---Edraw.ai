var testHost = ["localhost", "10.90.135.140", "cms40.wondershare.cn"];

var token = ""
if(["localhost", "10.90.135.140"].indexOf(location.hostname) > -1){
  token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJFZHJhd0FJIiwic3ViIjoie1wiY29ycFVzZXJJZFwiOlwiXCIsXCJvcGVuSWRcIjpcIlwiLFwiY29ycElkXCI6XCJcIn0iLCJleHAiOjE3MzcwMTk5MzcsImlhdCI6MTczNzAxMjY3NywiYXVkIjoiMTAwMTEiLCJzcmMiOiJ3c2NvZGUifQ.DAuyOnZHA-TJQGo5vetLlJj0LOHXZS5Tbxv-rmyZCzc"

}

if (testHost.indexOf(location.hostname) > -1) {
  // window.nativeBaseUrl = "dev-en.edraw.ai";
  window.nativeBaseUrl = "api.edraw.ai"
} else {
  window.nativeBaseUrl = "api.edraw.ai";
}

var pathnameArr = location.pathname.split('/');
var diagramNames = ["ai-chart-generator","ai-diagram-generator","ai-graph-generator"]
var diagramCodes = ["488483","488538","488539"];
var pathname = location.pathname;

// 判断路径是否包含 diagramCodes 或 diagramNames 中的字段
var containsDiagramName = diagramNames.some(function(name) {
  return pathname.includes(name);
});
var containsDiagramCode = diagramCodes.some(function(code) {
  return pathname.includes(code);
});

var isAiDiagram = containsDiagramName || containsDiagramCode;


AOS.init();
initForallSwiper()


$(document).ready(function () {

  $(".edrawai-navbar-btndownload").attr("target", "_blank");

  // 设置默认值
  $(".right-form textarea").val("The process of growing plants.");
  $(".right-form .font-number .input-number").text($("textarea").val().length);

  var numObj = null;
  var pathname = location.pathname;
  var pageType = pathname.split("/")[2].replace("ai-", "");
  // var match = pathname.match(/pages\/(\d+)/) || [];
  if (["diagram-generator","chart-generator","graph-generator"].indexOf(pageType)===-1) {
    numObj = {
      index: getCurrentPageItem().index,
      key: getCurrentPageItem().key,
    };
  }

  // if(numObj&&(numObj.index>0 || numObj.key===0&&numObj.key>2)){
  //   localStorage.removeItem("wx_EdrawAINaitve_default_template")
  // }
  var localItems = localStorage.getItem("wx_EdrawAINaitve_default_template");
  if (localItems) {
    var localDay = JSON.parse(localItems).day;
    if (localDay === new Date().getDate()) {
      items = JSON.parse(localItems).items;
      if (!numObj) {
        previewItemsImgs(0);
      }
      changeTopic(!!numObj);
      if (numObj) {
        initTopicList(numObj.index, numObj.key);
      }
    } else {
      getDefaultTpl(null, numObj ? numObj : null);
    }
  } else {
    getDefaultTpl(null, numObj ? numObj : null);
  }

  // 当 textarea 获得焦点时全选内容
  $("textarea").focus(function () {
    $(this).select();
  });

  var type = getActiveType().name;
  var searchVal = type === "Random Type" ? null : type;

  // searchTemplates(searchVal);

  if (isMobileDevice()) {
    if (getActiveType().path === "diagram") {
      window.aiTypeSwiper.on("slideChange", function () {
        nativeSensors("aiNativeChangeDiagramType");
        changeActiveRadio(aiTypeSwiper.activeIndex);
      });
    }
    window.customerSwiper&&window.customerSwiper.destroy(true, true);

    $(".customer-item").each(function () {
      $(this).on("load", function () {
        this.style.setProperty("width", `${width}px`, "important");
      });
      var width = $("#customers .section-content").outerWidth();
    });
    var mobileCustomerSwiper = new Swiper(".customer-list", {
      slidesPerView: 1,
      autoplay: true, //可选选项，自动滑动
      // loop: true,
      pagination: {
        el: ".customer-swiper-pagination",
        clickable: true,
      },
    });
  }

  if ($("img.lazy").Lazy) {
    $("img.lazy").Lazy({
      attribute: "data-src",
    });
  }

  nativeSensors("aiNativeVisit");

  observerTargetChange();

  createScatterFlowers();

  checkShare();

  console.log("pageType",pageType)
  if (["diagram-generator","chart-generator","graph-generator"].indexOf(pageType)===-1) {
    changePreviewSlides(
      items[getCurrentPageItem().index][getCurrentPageItem().key].templates
    );
  }

  // window.scatterFlowers.reStart()
});

function modifyScriptSrc(src) {
  // 在这里进行 src 的变更逻辑
  // 例如，将 "example.com" 替换为 "newexample.com"
  return src.replace('www.edraw.ai/edauth/main.js', 'account.edrawsoft.com/utils/edauth.js');
}

$(".click-flower").click(function () {
  createScatterFlowers();
});

function getUrlParams() {
  var url = window.location.href;
  var urlObj = new URL(url);
  var params = new URLSearchParams(urlObj.search);
  var obj = {};
  for (var pair of params.entries()) {
    obj[pair[0]] = pair[1];
  }
  return obj;
}

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}

function formatToCamelCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map( function(word, index) {
      if (index != 0) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join("");
}

function nativeSensors(key, obj) {
  var _obj = Object.assign(obj || {}, { Catalogues: "AINative" });

  if (window.sensors) {
    registerUid();
    window.sensors.track(key, _obj);
  } else {
    var num = 0;
    var nativeTimer = setInterval(function () {
      num++;
      if (window.sensors) {
        registerUid();
        window.sensors.track(key, _obj);
        clearInterval(nativeTimer);
        return;
      }
      if (num > 20) {
        clearInterval(nativeTimer);
      }
    }, 500);
  }
}

function registerUid() {
  if (document.referrer === "https://account.edrawsoft.com/") {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    result = _userInfo && !!_userInfo.user_id;
    if (!userInfo || !_userInfo || !result) {
      var num = 0;
      var timer = setInterval(function () {
        num++;
        if (result) {
          window.sensors.register({
            uid: _userInfo.user_id,
          });
          return;
        }
        if (num > 10) {
          clearInterval(timer);
        }
      }, 500);
    } else {
      window.sensors.register({
        uid: _userInfo.user_id,
      });
    }
  }
}

function openLink(link) {
  var _link = document.createElement("a");
  _link.href = link;
  _link.target = "_blank";
  _link.click();
}

function showMessage(message, type) {
  if (type === "success") {
    $("#toast img.warning").hide();
    $("#toast img.success").show();
  } else {
    $("#toast img.warning").show();
    $("#toast img.success").hide();
  }
  $("#toast span").text(message);
  $("#toast").css("display", "flex");
  $("#toast").css("align-items", "center");
  setTimeout(function () {
    $("#toast").css("opacity", "0");
  }, 3000);
  setTimeout(function () {
    $("#toast").css("display", "none");
    $("#toast").css("opacity", "1");
  }, 3500);
}

function getStrType(str) {
  var substr = str.split("/")[0];
  var words = substr.split(" ").slice(1);
  var result = words
    .map(function (word) {
      return word.toLowerCase().replace(/\s+/g, "");
    })
    .join("");

  return result;
}

function getDefaultTpl(mode, numObj) {
  if(getUrlParams().from === 'share'){
    return
  }
  $("#operationSection .progress-tip.tip-content").text("loading...");
  $("#operationSection .progress-tip.tip-content").css(
    "text-align",
    "center"
  );

  animateProgress("#operationSection .left-content", "operationSectionTimer");
  $("#previewTooltip").hide();
  var url = `https://${window.nativeBaseUrl}/api/ai/v1/completions/native/tpl?offset=0&count=100`;
  if (mode) {
    url = `${url}&mode=${mode}`;
  }
  $.ajax({
    type: "get",
    url,
    contentType: "application/json",
    dataType: "json",
    success: function (res) {
      var code = res.code;
      if (code === 0) {
        res.data.map(function (item) {
          item.type = getStrType(item.native_id);
          if (item.type === "radar") {
            item.type = "radarchart";
          }
          if (item.type === "pest") {
            item.type = "pestanalysis";
          }
          if (item.type === "funnel") {
            item.type = "funnelchart";
          }
          if (item.type === "candlestick") {
            item.type = "candlestickchart";
          }
          if (item.type === "sankey") {
            item.type = "sankeydiagram";
          }
          if (item.type === "swot") {
            item.type = "swotanalysis";
          }
          var arr = item.native_id.split("/") || [];
          if (arr[0] === "Infographic" || arr[0] === "poster") {
            item.type = arr[0].toLowerCase();
          }
          item.onlineName = arr[1] || "";
        });
        var randomTypeArr = res.data.filter(function (resItem) {
          return resItem.type === "randomtype";
        });
        randomTypeArr.map(function (item) {
          items[0][0].nameToTopic.map(function (temp) {
            if (item.onlineName == temp.name) {
              var obj = {
                id: item.native_id,
                img: item.img_link,
              };
              if (temp.templates) {
                temp.templates.push(obj);
              } else {
                temp.templates = [obj];
              }
            }
          });
        });
        items.map(function (item) {
          item.map(function (temp) {
            if (temp.nameToTopic) {
              var resArr = res.data.filter(function (resItem) {
                return (
                  resItem.type === temp.name.toLowerCase().replace(/\s/g, "")
                );
              });

              resArr.map(function (resItem) {
                temp.nameToTopic.map(function (tab) {
                  if (tab.name === resItem.onlineName.replace(/\u00A0/g, " ")) {
                    tab.img_link = resItem.img_link;
                    tab.native_id = resItem.native_id;
                  }
                });
                // temp
              });
            }
          });
        });
        previewItemsImgs(0);
        localStorage.setItem(
          "wx_EdrawAINaitve_default_template",
          JSON.stringify({ items, day: new Date().getDate() })
        );
        hideProgress("#operationSection", "operationSectionTimer");
        $("#previewTooltip").show();
        changeTopic();
        if (numObj) {
          initTopicList(numObj.index, numObj.key);
        }
        showGeneratingText()
      } else {
        hideProgress("#operationSection", "operationSectionTimer");
        $("#previewTooltip").show();
        showGeneratingText()
      }
    },
    error: function (err) {
      hideProgress("#operationSection", "operationSectionTimer");
      showGeneratingText()
    },
    fail: function () {
      hideProgress("#operationSection", "operationSectionTimer");
      showGeneratingText()
    },
  });
}

function showGeneratingText(){
  $("#operationSection .progress-tip.tip-content").text(
    "EdrawMax AI is generating, please wait..."
  );
  $("#operationSection .progress-tip.tip-content").css(
    "text-align",
    "unset"
  );
}


function previewItemsImgs(index) {
  var imgArr = [];
  items[index].map(function (temp) {
    temp.nameToTopic.map(function(tab) {
      if (tab.templates) {
        tab.templates.map(function (child) {
          imgArr.push(child.img);
        });
      } else {
        imgArr.push(tab.img_link);
      }
    });
  });
  previewImgs(imgArr);
}

var previewSwiper = new Swiper(".preview-box", {});
window.previewSwiper = previewSwiper;

var items = [
  [
    {
      name: "Random Type",
      iconName: "random-type",
      mode: "native",
      path: "diagram",
      topic: [
        "The process of growing plants.",
        // "The relationship between sales and advertising budget.",
        "How passengers and taxi drivers use an online taxi booking App.",
      ],
      templates: [],
      nameToTopic: [
        {
          name: "How to grow plant",
          topic: "The process of growing plants.",
        },
        // {
        //   name: "Sales and budget relationship",
        //   topic: "The relationship between sales and advertising budget.",
        // },
        {
          name: "Online taxi user story",
          topic:
            "How passengers and taxi drivers use an online taxi booking App.",
        },
      ],
    },
    {
      name: "Flowchart",
      iconName: "flow-chart",
      mode: "flowchart",
      path: "flowchart-geneartor,text-to-flowchart-generator,code-to-flowchart-generator",
      testCode: "488540,488542,488543",
      topic: [
        "Necessary steps to create a flowchart, including process planning, checking order, and finalizing.",
        "The payment processing workflow involves steps for current and new customers, including approvals for non-US customers.",
        "A troubleshooting flow for starting a computer, including checks for power connection and boot-up issues.",
        "Workflow for resolving customer issues, from ticket submission to issue resolution, including steps for different business hours.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Payment processing workflow",
          topic:
            "The payment processing workflow involves steps for current and new customers, including approvals for non-US customers.",
        },
        {
          name: "Start computer process",
          topic:
            "A troubleshooting flow for starting a computer, including checks for power connection and boot-up issues.",
        },
        {
          name: "How to draw flowchart",
          topic:
            "Necessary steps to create a flowchart, including process planning, checking order, and finalizing.",
        },
        {
          name: "Issue resolution workflow",
          topic:
            "Workflow for resolving customer issues, from ticket submission to issue resolution, including steps for different business hours.",
        },
      ],
    },
    {
      name: "Mind Map",
      iconName: "mind-map",
      mode: "mindmap-md",
      path: "text-to-mind-map-generator,ai-tree-diagram-generator,ai-concept-map-generator",
      testCode: "488544,488545,488546",
      topic: [
        "The process of growing plants, including the stages of growth, care requirements, tools needed, and conditions for germination.",
        "Various time management strategies include planning, dealing with distractions, and effective communication.",
        "The qualities and practices of a good teacher include communication, leadership, creativity, and approach to student learning and feedback.",
        "The health benefits of different fruits, including peaches, watermelons, apples, strawberries, grapes, and cantaloupes.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "How to grow plant",
          topic:
            "The process of growing plants, including the stages of growth, care requirements, tools needed, and conditions for germination.",
        },
        {
          name: "How to manage time",
          topic:
            "Various time management strategies include planning, dealing with distractions, and effective communication.",
        },
        {
          name: "How to be a good teacher",
          topic:
            "The qualities and practices of a good teacher include communication, leadership, creativity, and approach to student learning and feedback.",
        },
        {
          name: "Benefits of fruits",
          topic:
            "The health benefits of different fruits, including peaches, watermelons, apples, strawberries, grapes, and cantaloupes.",
        },
      ],
    },
    // {
    //   name: "Infographic",
    //   iconName: "infographic",
    //   mode: "infographic",
    //   path: "infographic",
    //   testCode: "470689",
    //   topic: [
    //     "Modern technology's emerging trend, and its impact on society.",
    //     "The rise of electric vehicles.",
    //     "Music festivals around the world.",
    //   ],
    //   templates: [],
    //   nameToTopic: [
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic:
    //         "Modern technology's emerging trend, and its impact on society.",
    //     },
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic: "The rise of electric vehicles.",
    //     },
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic: "Music festivals around the world.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic:
    //         "The importance of environmental sustainability for the future.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic: "Strategies for effective online education.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic: "The future of remote work.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Key trends in digital transformation and innovation.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Recent breakthroughs in space exploration.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Smart home technologies and privacy.",
    //     },

    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "5 essentials of a healthy lifestyle.",
    //     },
    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "Emerging trends in global cuisine.",
    //     },
    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "The renaissance of board games.",
    //     },
    //   ],
    // },
    // {
    //   name: "Poster",
    //   iconName: "poster",
    //   mode: "poster",
    //   path: "poster",
    //   testCode: "471051",
    //   topic: [
    //     "Modern technology's emerging trend, and its impact on society.",
    //     "The rise of electric vehicles.",
    //     "Music festivals around the world.",
    //   ],
    //   templates: [],
    //   nameToTopic: [
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic:
    //         "Modern technology's emerging trend, and its impact on society.",
    //     },
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic: "The rise of electric vehicles.",
    //     },
    //     {
    //       name: "Exploring the Trends of Future Technology",
    //       topic: "Music festivals around the world.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic:
    //         "The importance of environmental sustainability for the future.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic: "Strategies for effective online education.",
    //     },
    //     {
    //       name: "The Future of Environmental Sustainability",
    //       topic: "The future of remote work.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Key trends in digital transformation and innovation.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Recent breakthroughs in space exploration.",
    //     },
    //     {
    //       name: "Key Trends in Digital Transformation",
    //       topic: "Smart home technologies and privacy.",
    //     },

    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "5 essentials of a healthy lifestyle.",
    //     },
    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "Emerging trends in global cuisine.",
    //     },
    //     {
    //       name: "Key Elements of a Healthy Lifestyle",
    //       topic: "The renaissance of board games.",
    //     },
    //   ],
    // },
    {
      name: "Pie Chart",
      iconName: "pie-chart",
      mode: "echart-pie",
      path: "ai-pie-chart-generator",
      testCode: "488561",
      topic: [
        // "Show data for eight types, with distinct color segments for each type and varying segment radii to represent data values.",
        // "Display the sources of website traffic, with breakdowns for each access.",
        "Compare different traffic sources to amazon.com, including search engine, direct, email, union, and video ads.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        // {
        //   name: "Nightingale rose chart",
        //   topic:
        //     "Show data for eight types, with distinct color segments for each type and varying segment radii to represent data values.",
        // },
        // {
        //   name: "Nested pie chart",
        //   topic:
        //     "Display the sources of website traffic, with breakdowns for each access.",
        // },
        {
          name: "Pie chart with rounded edges",
          topic:
            "Compare different traffic sources to amazon.com, including search engine, direct, email, union, and video ads.",
        },
      ],
    },
    {
      name: "Bar Chart",
      iconName: "bar-chart",
      mode: "echart-bar",
      path: "ai-bar-chart-generator",
      testCode: "488560",
      topic: [
        "The daily breakdown of website traffic sources from Monday to  Sunday.",
        // "Annual changes in wildlife populations across different habitats: Forest, Steppe, Desert, and Wetland, from 2012 to 2016.",
        // "Show positive and negative costs for various items labeled 1 through 10.",
        "The daily income and expenses for a week.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Horizontal stacked bar chart",
          topic:
            "The daily breakdown of website traffic sources from Monday to  Sunday.",
        },
        // {
        //   name: "Radial bar chart labels",
        //   topic:
        //     "Annual changes in wildlife populations across different habitats: Forest, Steppe, Desert, and Wetland, from 2012 to 2016.",
        // },
        // {
        //   name: "Positive negative bar chart labels",
        //   topic:
        //     "Show positive and negative costs for various items labeled 1 through 10.",
        // },
        {
          name: "Stacked waterfall chart",
          topic: "The daily income and expenses for a week.",
        },
      ],
    },
    {
      name: "Line Chart",
      iconName: "line-chart",
      mode: "echart-line",
      path: "ai-line-chart-generator",
      testCode: "488559",
      topic: [
        "Display weekly website traffic sources, including email, union ads, video ads, direct ads, and search engines.",
        "A stacked area chart with gradient colors represents the daily measurements of 5 lines over a week.",
        "Display total sales over a week.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Stacked area chart",
          topic:
            "Display weekly website traffic sources, including email, union ads, video ads, direct ads, and search engines.",
        },
        {
          name: "Stacked gradient area chart",
          topic:
            "A stacked area chart with gradient colors represents the daily measurements of 5 lines over a week.",
        },
        {
          name: "Basic area chart",
          topic: "Display total sales over a week.",
        },
      ],
    },
  ],
  [
   
    {
      name: "PEST Analysis",
      iconName: "pest-analysis",
      mode: "pest",
      path: "ai-pest-analysis-generator",
      testCode: "488554",
      topic: [
        "The main factors influencing the market for the electric vehicle industry.",
        "Explains how the political, economic, sociological, and technological factors affect business environments.",
        "Highlight critical factors affecting business environments in political, economic, social, technological, legal, and environmental categories.",
        "The business environments for Arc'teryx, a high-end outdoor clothing and sporting goods company.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Electric vehicle industry Pest Analysis",
          topic:
            "The main factors influencing the market for the electric vehicle industry.",
        },
        {
          name: "PEST analysis",
          topic:
            "Explains how the political, economic, sociological, and technological factors affect business environments.",
        },
        {
          name: "Pestle analysis introduction",
          topic:
            "Highlight critical factors affecting business environments in political, economic, social, technological, legal, and environmental categories.",
        },
        {
          name: "Arc'teryx PESTEL analysis",
          topic:
            "The business environments for Arc'teryx, a high-end outdoor clothing and sporting goods company.",
        },
      ],
    },
    {
      name: "SWOT Analysis",
      iconName: "swot-analysis",
      mode: "swot",
      path: "ai-swot-analysis-generator",
      testCode: "488553",
      topic: [
        "Strengths, weaknesses, opportunities, and threats of the takeout food industry.",
        "Personal strengths, weaknesses, and external factors affect career development in technology.",
        "Analyze global financial services companies, focusing on challenges with interest rates and external threats like security breaches.",
        "TESLA SWOT Analysis in the Global Market.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Takeout industry SWOT analysis",
          topic:
            "Strengths, weaknesses, opportunities, and threats of the takeout food industry.",
        },
        {
          name: "Interview Project SWOT analysis",
          topic:
            "Personal strengths, weaknesses, and external factors affect career development in technology.",
        },
        {
          name: "Bank of America SWOT analysis",
          topic:
            "Analyze global financial services companies, focusing on challenges with interest rates and external threats like security breaches.",
        },
        {
          name: "TESLA SWOT analysis",
          topic: "TESLA SWOT Analysis in the Global Market.",
        },
      ],
    },
    {
      name: "User Profile",
      iconName: "user-profile",
      mode: "userProfile",
      path: "ai-user-profile-generator",
      testCode: "488558",
      topic: [
        "Typical tablet user profile, including demographic information, characteristics, and usage scenarios.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Tablet user profile",
          topic:
            "Typical tablet user profile, including demographic information, characteristics, and usage scenarios.",
        },
      ],
    },
    {
      name: "User Story",
      iconName: "user-story",
      mode: "userStory",
      path: "ai-user-story-generator",
      testCode: "488557",
      topic: [
        "How passengers and taxi drivers use an online taxi booking App.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Online taxi user story",
          topic:
            "How passengers and taxi drivers use an online taxi booking App.",
        },
      ],
    },
    {
      name: "Timeline",
      iconName: "timeline",
      mode: "timeline",
      path: "timeline",
      testCode: "443740",
      topic: [
        "Hi-tech company's strategic planning timeline for the year 2021.",
        "A research project's phases which are carried out by a medical institution.",
        "Essential steps of developing a marketing strategy.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Company planning timeline",
          topic:
            "Hi-tech company's strategic planning timeline for the year 2021.",
        },
        {
          name: "Project timeline",
          topic:
            "A research project's phases which are carried out by a medical institution.",
        },
        {
          name: "Business development timeline",
          topic: "Essential steps of developing a marketing strategy.",
        },
      ],
    },
    {
      name: "Lean Canvas",
      iconName: "lean-canvas",
      mode: "leanCanvas",
      path: "ai-lean-canvas-generator",
      testCode: "488556",
      topic: [
        "Business plan for new search engine technology aimed at providing more relevant search results to users.",
        "A business plan for a web-based platform designed for freelancers to improve productivity in remote work environments.",
        "Business plan of a photo-sharing App targeting young couples to create baby photo albums.",
        "Comprehensive analysis of Disney's business model.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Search engine lean canvas",
          topic:
            "Business plan for new search engine technology aimed at providing more relevant search results to users.",
        },
        {
          name: "User experience canvas",
          topic:
            "A business plan for a web-based platform designed for freelancers to improve productivity in remote work environments.",
        },
        {
          name: "Product positioning",
          topic:
            "Business plan of a photo-sharing App targeting young couples to create baby photo albums.",
        },
        {
          name: "Disney's business model",
          topic: "Comprehensive analysis of Disney's business model.",
        },
      ],
    },
  ],
  [
    
    {
      name: "Scatter Plot",
      iconName: "scatter-plot",
      mode: "echart-scatter",
      path: "ai-scatter-plot-generator",
      topic: ["The relationship between sales and advertising budget."],
      testCode: "488572",
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Sales and budget relationship",
          topic: "The relationship between sales and advertising budget.",
        },
      ],
    },
    {
      name: "Box Plot",
      iconName: "box-plot",
      mode: "echart-boxplot",
      path: "ai-box-plot-generator",
      testCode: "488562",
      topic: [
        // "Compare distributions of speed within five different, and identify outliers.",
        "Compare the values distribution of three different categories across five distinct groups.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        // {
        //   name: "Basic box plot",
        //   topic:
        //     "Compare distributions of speed within five different, and identify outliers.",
        // },
        {
          name: "Multi-series box plot",
          topic:
            "Compare the values distribution of three different categories across five distinct groups.",
        },
      ],
    },
    {
      name: "Heat Map",
      iconName: "heat-map",
      mode: "echart-heatmap",
      testCode: "488564",
      path: "ai-heat-map-generator",
      topic: [
        "Compare the frequency of activities over a week, mapped against different times of the day.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Cartesian coordinate system-based heat map",
          topic:
            "Compare the frequency of activities over a week, mapped against different times of the day.",
        },
      ],
    },
    {
      name: "Radar Chart",
      iconName: "radar-chart",
      mode: "echart-radar",
      path: "ai-radar-chart-generator",
      testCode: "488567",
      topic: [
        "Compare budget versus actual spending across different departments of a company.",
        // "Evaluate different product aspects and service quality over time.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Basic radar chart",
          topic:
            "Compare budget versus actual spending across different departments of a company.",
        },
        // {
        //   name: "Multiple radar charts",
        //   topic:
        //     "Evaluate different product aspects and service quality over time.",
        // },
      ],
    },
    {
      name: "Candlestick Chart",
      iconName: "candlestick-chart",
      mode: "ai-candlestick-chart-generator",
      testCode: "488565",
      topic: [
        "Daily price movement for a fictional financial asset over four days, with distinct colors for positive and negative days.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Basic candlestick chart",
          topic:
            "Daily price movement for a fictional financial asset over four days, with distinct colors for positive and negative days.",
        },
      ],
    },
    {
      name: "Sankey Diagram",
      iconName: "sankey-diagram",
      mode: "echart-sankey",
      path: "ai-sankey-diagram-generator",
      testCode: "488568",
      topic: [
        "Illustrate the flow between different stages with distinct pathways and volumes.",
        "A vertical Sankey diagram flows from 'a' to 'b1' and 'a1' and from 'b1' to 'b' and 'c'.",
        "Credit card usage (Distinguish, Vista, ColonialVoice, SuperiorCard) among different currencies (FRF, DEM, GBP, CAD) and tracking spending across various cities globally.",
        "The sustainability impacts (like climate) of organic ingredients (like cocoa butter) in product manufacturing.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Basic sankey diagram",
          topic:
            "Illustrate the flow between different stages with distinct pathways and volumes.",
        },
        {
          name: "Vertical sankey diagram",
          topic:
            "A vertical Sankey diagram flows from 'a' to 'b1' and 'a1' and from 'b1' to 'b' and 'c'.",
        },
        {
          name: "Sankey diagram custom node styles",
          topic:
            "Credit card usage (Distinguish, Vista, ColonialVoice, SuperiorCard) among different currencies (FRF, DEM, GBP, CAD) and tracking spending across various cities globally.",
        },
        {
          name: "Sankey diagram custom layer styles",
          topic:
            "The sustainability impacts (like climate) of organic ingredients (like cocoa butter) in product manufacturing.",
        },
      ],
    },
  ],
  [
   
    {
      name: "Funnel Chart",
      iconName: "funnel-chart",
      mode: "echart-funnel",
      path: "ai-funnel-chart-generator",
      testCode: "488566",
      topic: [
        "Customer journey stages, including Show, Click, Visit, Inquiry, and Order.",
        "A side-by-side comparison funnel chart for products A to E, showing their performance or sales stages, with distinct colors for each product and segmented layers.",
        // "The expected conversion rates for each stage of the customer journey.",
        // "The customer journey stages for two different scenarios.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Basic funnel chart",
          topic:
            "Customer journey stages, including Show, Click, Visit, Inquiry, and Order.",
        },
        {
          name: "Custom funnel chart",
          topic:
            "A side-by-side comparison funnel chart for products A to E, showing their performance or sales stages, with distinct colors for each product and segmented layers.",
        },
        // {
        //   name: "Multi-type funnel chart",
        //   topic:
        //     "The expected conversion rates for each stage of the customer journey.",
        // },
        // {
        //   name: "funnel chart comparison",
        //   topic: "The customer journey stages for two different scenarios.",
        // },
      ],
    },
    {
      name: "Parallel Coordinate",
      iconName: "parallel-coordinate",
      mode: "echart-parallel",
      testCode: "488576",
      path: "ai-parallel-coordinate-generator",
      topic: [
        "Evaluate products based on metrics: Price, Net Weight, Amount, and Score, with score categories labeled as Bad, OK, Good, and Excellent.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Basic parallel coordinates",
          //     Basic parallel coordinates
          //     Basic parallel coordinates
          topic:
            "Evaluate products based on metrics: Price, Net Weight, Amount, and Score, with score categories labeled as Bad, OK, Good, and Excellent.",
        },
      ],
    },
    // {
    //   name: "Relational Graph",
    //   iconName: "relational-graph",
    //   mode: "echart-graph",
    //   topic: [
    //     "Daily sales of a cafeteria near a school in a week.",
    //     "A Calendar for 2017 with data points in February and March overlaid with a trend line and annotations to indicate significant events.",
    //   ],
    //   previewImg:
    //     "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
    //   previewId: "1029429",
    //   templates: [],
    //   nameToTopic: [
    //     {
    //       name: "Cartesian coordinate system-based relational graph",
    //       topic: "Daily sales of a cafeteria near a school in a week.",
    //     },
    //     {
    //       name: "Calendar relational graph",
    //       topic:
    //         "A Calendar for 2017 with data points in February and March overlaid with a trend line and annotations to indicate significant events.",
    //     },
    //   ],
    // },
    {
      name: "Sunburst Chart",
      iconName: "sunburst-chart",
      mode: "echart-sunburst",
      testCode: "488571",
      path: "ai-sunburst-chart-generator",
      topic: [
        "A family tree, with layers for me, parents, siblings, and extended family members.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1029429.jpeg",
      previewId: "1029429",
      templates: [],
      nameToTopic: [
        {
          name: "Basic sunburst chart",
          topic:
            "A family tree, with layers for me, parents, siblings, and extended family members.",
        },
      ],
    },
    {
      name: "Table",
      iconName: "table",
      mode: "form",
      path: "ai-table-generator,ai-form-generator",
      testCode: "488551,488552",
      topic: [
        "The top 10 cities for hotel bookings in Europe in 2022, including the total number of bookings, city name, and hotel type.",
        "The monthly sales of smartphones in 2022, including the number of units sold, brand, and type of phone.",
        "The monthly sales of Iphone in the UK in 2022, including the total number of sales, price range",
        "A new energy vehicle sales for 2022, including the number of units sold, as well as information such as vehicle type (electric or hybrid), brand, and month, and categorize by type and country.",
      ],
      previewImg:
        "https://images.edrawmax.com/images2024/ai-native/1046184.jpeg",
      previewId: "1046184",
      templates: [],
      nameToTopic: [
        {
          name: "Top 10 cities for hotel bookings table",
          topic:
            "The top 10 cities for hotel bookings in Europe in 2022, including the total number of bookings, city name, and hotel type.",
        },
        {
          name: "Sales of smartphones table",
          topic:
            "The monthly sales of smartphones in 2022, including the number of units sold, brand, and type of phone.",
        },
        {
          name: "Sales of Iphone Table",
          topic:
            "The monthly sales of Iphone in the UK in 2022, including the total number of sales, price range",
        },
        {
          name: "New energy vehicle sales table",
          topic:
            "A new energy vehicle sales for 2022, including the number of units sold, as well as information such as vehicle type (electric or hybrid), brand, and month, and categorize by type and country.",
        },
      ],
    },
  ]
];
var itemConcatObj = {
  native: {
    icon: "random-type",
    enName: "Random Type",
  },
  flowchart: { icon: "flow-chart", enName: "Flowchart" },
  "mindmap-md": { icon: "mind-map", enName: "Mind Map" },
  "echart-pie": { icon: "pie-chart", enName: "Pie Chart" },
  "echart-bar": { icon: "bar-chart", enName: "Bar Chart" },
  "echart-line": { icon: "line-chart", enName: "Line Chart" },
  pest: { icon: "pest-analysis", enName: "PEST Analysis" },
  swot: { icon: "swot-analysis", enName: "SWOT Analysis" },
  userProfile: { icon: "user-profile", enName: "User Profile" },
  userStory: { icon: "user-story", enName: "User Story" },
  timeline: { icon: "timeline", enName: "Timeline" },
  leanCanvas: { icon: "lean-canvas", enName: "Lean Canvas" },
  "echart-scatter": { icon: "scatter-plot", enName: "Scatter Plot" },
  "echart-boxplot": { icon: "box-plot", enName: "Box Plot" },
  "echart-heatmap": { icon: "heat-map", enName: "Heat Map" },
  "echart-radar": { icon: "radar-chart", enName: "Radar Chart" },
  "echart-candlestick": {
    icon: "candlestick-chart",
    enName: "Candlestick Chart",
  },
  "echart-sankey": { icon: "sankey-diagram", enName: "Sankey Diagram" },
  "echart-funnel": { icon: "funnel-chart", enName: "Funnel Chart" },
  "echart-parallel": {
    icon: "parallel-coordinate",
    enName: "Parallel Coordinate",
  },
  "echart-graph": { icon: "relational-graph", enName: "Relational Graph" },
  "echart-sunburst": { icon: "sunburst-chart", enName: "Sunburst Chart" },
  form: { icon: "table", enName: "Table" },
  infographic: { icon: "infographic", enName: "Infographic" },
  poster: { icon: "poster", enName: "Poster" },
};
items.map(function (item) {
  item.map(function (temp) {
    temp.iconName = itemConcatObj[temp.mode]?.icon;
    temp.enName = itemConcatObj[temp.mode]?.enName;
    temp.currentTopicIndex = 0
  });
});

function changePreviewSlides(templates) {
  $("#operationSection .swiper-wrapper.preview-content").html("");
  var previewSlidesDom = "";
  $.each(templates, function (index, item) {
    previewSlidesDom += `<div class="swiper-slide">
            <img src="${item.img}" style="max-height: 90%;max-width: 90%;object-fit:cover"/>
          </div>`;
  });
  $("#operationSection .swiper-wrapper.preview-content").css(
    "width",
    templates.length === 1 ? "unset" : "100%"
  );
  $("#operationSection .swiper-wrapper.preview-content").append(
    previewSlidesDom
  );
}

function getActiveType() {
  if (isAiDiagram) {
    var indexArr = $("#operationSection .type-item.active")
      .data("index")
      .split(",");
    var _index = indexArr[0];
    var _key = indexArr[1];
    return items[_index][_key];
  } else {
    return getCurrentPageItem().pageItem;
  }
}

function getCurrentPageItem() {
  var pathname = location.pathname;
  var type = pathname.split("/")[2];
  var match = pathname.match(/pages\/(\d+)/) || [];
  var _index = 0;
  var _key = 1;
  items.map(function (item, index) {
    item.find(function (temp, key) {
      if (
        temp.path&&temp.path.includes(type) ||
        (match && match[1] && temp.testCode && temp.testCode.includes(match[1]))
      ) {
        _index = index;
        _key = key;
      }
    });
  });
  
  return { pageItem: items[_index][_key], index: _index, key: _key };
}

function changeTopic(showLoading, changeText) {
  var mode = getActiveType().mode;
  var noResetAipreview = (mode == "infographic" || mode === "poster" || mode === 'native') && window.isAiPreview
  if (!isMobileDevice() && !noResetAipreview) {
    resetGenerate(showLoading);
  }
  var currentTopic = $("#diagram-topic").val();
  var item = getActiveType();

  var topic = "";
  if (changeText) {
    topic = changeText;
  } else {
    var topics = item.topic;
    topic = topics[item.currentTopicIndex]
    item.currentTopicIndex++ 
    if(item.currentTopicIndex===topics.length){
      item.currentTopicIndex = 0
    }
  }
  var current = item.nameToTopic.find(function (temp) {
    return temp.topic === topic;
  });
  if (!current) {
    current = {
      native_id: "",
      img_link: "",
    };
  }
  if (item.name !== "Random Type") {
    if (item.templates[0]) {
      item.templates[0].id = current.native_id;
      item.templates[0].img = current.img_link;
    } else {
      item.templates.push({
        id: current.native_id,
        img: current.img_link,
      });
    }
    window.previewSwiper.destroy(true, true);
    changePreviewSlides(getActiveType().templates);
    if((item.mode == 'infographic' || item.mode == 'poster') && !getActiveType().firstViewed ){
      hideProgress("#operationSection", "operationSectionTimer");
    }
  } else {
    item.templates = current.templates;
    window.previewSwiper.destroy(true, true);
    changePreviewSlides(getActiveType().templates);
    window.previewSwiper = new Swiper(".preview-box", {
      slidesPerView: 1,
      simulateTouch: false,
      autoplay: true,
      loop: true,
    });
  }
  var allTopics = []
  getActiveType().nameToTopic.forEach( function(item){
    allTopics = allTopics.concat(item.topic)
  })
  
  if (
    !isAiDiagram && (item.mode == "infographic" || item.mode === "poster") &&
    currentTopic && currentTopic !== 'The process of growing plants.' && allTopics.indexOf(currentTopic) === -1
  ) {
  } else {
    $("#diagram-topic").val(topic);
    $(".right-form .font-number .input-number").text(topic.length);
  }
  $("#operationSection .generate-btn span").text("Generate For Free");
  $("#operationSection .left-content .right-btns").show();
  if($("#diagram-topic").val()){
    $(".right-form .font-number .input-number").removeClass("red");
    $(".generate-btn").removeClass("disabled");
  }
}

$("#diagram-topic").on("input", function () {
  var textLength = $(this).val().length;
  if (getActiveType().topic.indexOf($(this).val()) === -1) {
    $("#operationSection .topic-item").removeClass("active");
  }
  if (textLength === 0 || textLength > 1000) {
    $(".right-form .font-number .input-number").addClass("red");
    if (textLength > 1000) {
      $(this).val($(this).val().substring(0, 999));
      $(".right-form .font-number .input-number").text(1000);
      $(".right-form .font-number .input-number").removeClass("red");
    }
    if (textLength === 0) {
      var mode = getActiveType().mode;
      if (mode === "infographic" || mode === "poster") {
        var file = $("#fileInput")[0].files[0];
        var website = $(".website-input input").val();
        if (file || website) {
          $(".right-form .font-number .input-number").removeClass("red");
          $(".generate-btn").removeClass("disabled");
          return;
        }
      }
      $(".right-form .font-number .input-number").text(0);
      $(".generate-btn").addClass("disabled");
    }
    return;
  } else {
    $(".right-form .font-number .input-number").removeClass("red");
    $(".generate-btn").removeClass("disabled");
  }

  $(".right-form .font-number .input-number").text(textLength);
  $("#operationSection .generate-btn span").text("Generate For Free");
});

function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      func.apply(context, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
$("#diagram-topic").on(
  "input",
  debounce(function () {
    nativeSensors("aiNativeEditTopic");
  }, 2000)
);

// generated 相关
$(".generate-btn").click(function () {
  if ($(this).hasClass("disabled")) {
    return;
  }
  var type = formatToCamelCase(getActiveType().name);
  var buttonText = $(".generate-btn span").text();
  if (buttonText != "Stop Generating") {
    var buttom_name =
      buttonText === "Generate For Free" ? "generate" : "regenerate";
    var sensorsObj = { type, buttom_name }
    var mode = getActiveType().mode
    if (mode === "infographic" || mode === "poster") {
      var file = $("#fileInput")[0].files[0];
      var website = $(".website-input input").val();
      sensorsObj.upload_file = !!file;
      sensorsObj.upload_website = !!website;
      var _items = $(".second-form-item .design-format .design-item ");
      var activeIndex = _items.index(_items.filter(".active"));
      var designArr = ['lightAqua','limeGreen','darkBluePurple','apricot']
      sensorsObj.design_format = designArr[activeIndex]
    }
    nativeSensors("aiNativeGenerate", sensorsObj);
  } else {
    nativeSensors("aiNativeGenerateFinish", { result: "stop" });
  }
  if (validateLogin("generateNeeded")) {
    if (
      isMobileDevice() &&
      isAiDiagram &&
      buttonText != "Stop Generating"
    ) {
      var currentScrollTop = $(window).scrollTop();
      var newScrollTop = currentScrollTop + 400;
      $("html, body").animate({ scrollTop: newScrollTop }, 500);
    }
    if (
      getUrlParams().needShareGive &&
      getUrlParams().needShareGive.indexOf("true") > -1
    ) {
      var needStr = getUrlParams().needShareGive;
      var nativeIdMatch = needStr.match(/nativeId=([^]*?)\*sharerId=/);
      var sharerIdMatch = needStr.match(/sharerId=(\d+)/);
      var nativeId = nativeIdMatch ? nativeIdMatch[1] : null;
      var sharerId = sharerIdMatch ? sharerIdMatch[1] : null;

      shareGenerate(nativeId, sharerId);
    }
    startGenerate();
  } else {
    nativeSensors("aiNativeGenerateFinish", { result: "signInNeeded" });
  }
});
function startGenerate() {
  var prompt = $("#diagram-topic").val();
  var mode = getActiveType().mode;
  if (mode === "infographic" || mode === "poster") {
    var file = $("#fileInput")[0].files[0];
    var website = $(".website-input input").val();
    if (!file && !website && prompt.length > 1000) {
      showMessage("The Maximum Topic is 1000");
      return;
    }
  } else {
    if (prompt.length > 1000) {
      showMessage("The Maximum Topic is 1000");
      return;
    }
  }
  if ($(".generate-btn span").text() === "Stop Generating") {
    generateRequest.abort();
    showMessage("Generation stopped");
    hideProgress("#operationSection", "operationSectionTimer");
    $("#operationSection .preview-content").show();
    $("#operationSection .left-content .right-btns").show();
    resetGenerate();
    return;
  }
  hideProgress("#operationSection", "operationSectionTimer");
  $("#operationSection .fail-box").hide();
  $("#operationSection .ai-preview").hide();
  $("#operationSection .comment-btns").hide();
  $("#operationSection .preview-content").hide();
  $("#operationSection .left-content .right-btns").hide();
  $(".free-limit-modal").hide();
  animateProgress(
    "#operationSection .left-content",
    "operationSectionTimer",
    mode === "infographic" || mode === "poster" ? 2 : 5
  );
  $("#operationSection .type-item").addClass("disabled");
  $("#operationSection .topic-item").addClass("disabled");
  $("#operationSection .refresh-btn").addClass("disabled");
  $("#operationSection .form-item").addClass("disabled");
  $("#operationSection .design-format .design-item").addClass("disabled");
  $("#operationSection .textarea-box .cover").show();
  $("#operationSection .generate-btn span").text("Stop Generating");
  $("#operationSection .generate-btn img").attr(
    "src",
    "https://images.edrawmax.com/images2024/ai-native/stop.png"
  );
  if (mode === "infographic" || mode === "poster") {
    var file = $("#fileInput")[0].files[0];
    if (file) {
      analysisFile($("#fileInput")[0].files[0]);
      return;
    }
  }
  generateDiagram();
}

function generateDiagram(nativeMode, fileText) {
  var prompt = $("#diagram-topic").val();

  var mode = nativeMode || $(".type-item.active").data("mode");
  if (
    !isAiDiagram
  ) {
    mode = getActiveType().mode;
  }
  $("#downloadModal .ai-img").attr("src", "");
  $(".download-watermark-container .ai-img").attr("src", "");
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140" 
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    token = _userInfo.token;
  }

  if (mode.indexOf("echart") === -1 && mode !== "native") {
    var params = {
      prompt,
      mode,
      user_lang: "en",
      is_dark: true
    };
    if (mode === "infographic" || mode === "poster") {
      var activeIndex = 0;
      if(isAiDiagram){
        activeIndex = getActiveType().activeDesignIndex
      } else {
        var _items = $(".second-form-item .design-format .design-item");
        activeIndex = _items.index(_items.filter(".active"));
      }
      params.tpl_id =
        activeIndex === 1 ? 3 : activeIndex === 3 ? 1 : activeIndex;
      if (fileText) {
        params.extra = fileText;
      }
      var website = $(".website-input input").val();
      if (website) {
        params.website = website.substring(0, 1000);
      }
      var obj = {
        mode: params.mode,
        tpl_id: params.tpl_id,
        time: new Date().valueOf()
      }
      params.client_uuid = Object.values(obj).join('_')
    }
    window.generateRequest = $.ajax({
      type: "post",
      url: `https://${window.nativeBaseUrl}/api/ai/v1/completions/native`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(params),
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (res) {
        var code = res.code;
        if (code === 0) {
          if (!isMobileDevice()) {
            checkLimitNum();
          }
          if (!window.almostUsedUp) {
            $(".free-limit-modal").hide();
          }
          $(".vip-limit-modal").hide();
          window.aiPreviewImg = res.data.img_link;
          window.native_id = res.data.native_id;
          window.isAiPreview = true;
          if (mode === "infographic" || mode === "poster") {
            $("#operationSection .ai-preview").addClass('ai-scroll-preview')
            $("#operationSection .ai-preview").html(
              `<div class="ai-pireview-wrapper"> <img src="${res.data.img_link}"/></div>`
            );
          } else {
            $("#operationSection .ai-preview").removeClass('ai-scroll-preview')
            $("#operationSection .ai-preview").html(
              `<img src="${res.data.img_link}" />`
            );
          }
          $("#operationSection .ai-preview").show();
          $("#operationSection .ai-preview").css("opacity", "0");
          setTimeout(function () {
            $("#operationSection .ai-preview img").on("load", function () {
              generateSuccess();
              $("#operationSection .ai-preview").css("opacity", "1");
            });
          }, 0);
          $("#downloadModal .ai-img").attr("src", res.data.img_link);
          $(".download-watermark-container .ai-img").attr(
            "src",
            res.data.img_link
          );
        } else {
          generateFailed();
        }
      },
      error: function (err) {
        if (err.statusText === "abort") {
          return;
        }
        var data = err.responseJSON;
        if (data && data.code === 3009) {
          nativeSensors("aiNativeGenerateFinish", { result: "upgradeNeeded" });
          $(".free-limit-modal .free-limit-modal-close").css("display", "none");
          $(".free-limit-modal .first-limit-tip").text(
            `The usage limit for today has been exceeded.`
          );
          window.almostUsedUp = false;
          resetGenerate();
          $(".free-limit-modal").show();
          $("#previewTooltip").hide();
          return;
        }
        if (data && data.code === 3000) {
          nativeSensors("aiNativeGenerateFinish", { result: "runOutAIToken" });
          resetGenerate();
          $(".vip-limit-modal").show();
          $("#previewTooltip").hide();
          return;
        }
        if((mode === "infographic" || mode === "poster") && err.status === 504){
          timeoutPoling(params.client_uuid);
          return
        }
        generateFailed();
      },
      fail: function () {
        generateFailed();
      },
    });
  } else {
    var params = {
      prompt,
      mode,
      user_lang: "en",
      platform: "web",
    };
    window.generateRequest = $.ajax({
      type: "post",
      url: `https://${window.nativeBaseUrl}/api/ai/v1/completions/na`,
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify(params),
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (res) {
        if (res.code === 0) {
          if (!isMobileDevice() && mode !== "native") {
            checkLimitNum();
          }
          if (!window.almostUsedUp) {
            $(".free-limit-modal").hide();
          }
          $(".vip-limit-modal").hide();
          if (mode === "native") {
            generateDiagram(res.data.content);
            window.nativeGenerateMode = res.data.content;
            items.map(function (item) {
              item.map(function (temp) {
                if (temp.mode === res.data.content) {
                  window.sensorsDiagramType =
                    formatToCamelCase(temp.name) || "randomType";
                }
              });
            });
            return;
          }
          window.native_id = res.data.native_id;
          createEchart(res.data.content);
        } else {
          generateFailed();
        }
      },
      error: function (err) {
        if (err.statusText === "abort") {
          return;
        }
        var data = err.responseJSON;
        if (data && data.code === 3009) {
          nativeSensors("aiNativeGenerateFinish", { result: "upgradeNeeded" });
          $(".free-limit-modal .free-limit-modal-close").css("display", "none");
          $(".free-limit-modal .first-limit-tip").text(
            `The usage limit for today has been exceeded.`
          );
          window.almostUsedUp = false;
          resetGenerate();
          $(".free-limit-modal").show();
          $("#previewTooltip").hide();
          return;
        }
        if (data && data.code === 3000) {
          nativeSensors("aiNativeGenerateFinish", { result: "runOutAIToken" });
          resetGenerate();
          $(".vip-limit-modal").show();
          $("#previewTooltip").hide();
          return;
        }
        generateFailed();
      },
      fail: function () {
        generateFailed();
      },
    });
  }
}

function analysisFile(file) {
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    token = _userInfo.token;
  }
  var formData = new FormData();
  formData.append("file", file);
  formData.append("lang", "en");
  window.generateRequest = $.ajax({
    type: "post",
    url: `https://${window.nativeBaseUrl}/api/ai/v1/parse`,
    dataType: "json",
    data: formData,
    processData: false,
    contentType: false,
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (res) {
      var code = res.code;
      if (code === 0) {
        generateDiagram("", res.data.substring(0, 1000));
      } else {
        generateFailed();
      }
    },
    error: function (err) {
      generateFailed();
      var data = err.responseJSON;
      showMessage(data.msg);
    },
    fail: function (res) {
      generateFailed();
      showMessage(res.msg);
    },
  });
}

function timeoutPoling(client_uuid){
  var polingNum = 0;
  var polingTimer = setInterval(function(){
    polingNum++
    if(polingNum>=24){
      clearInterval(polingTimer);
      generateFailed();
      return
    }
    var url = `https://${window.nativeBaseUrl}/api/ai/v1/completions/native/url?client_uuid=${client_uuid}`;
    $.ajax({
      type: "get",
      url: url,
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        var code = res.code;
        if (code === 0) {
          window.aiPreviewImg = res.data.img_link;
          window.native_id = res.data.native_id;
          window.isAiPreview = true;
          $("#operationSection .ai-preview").addClass('ai-scroll-preview')
          $("#operationSection .ai-preview").html(
            `<div class="ai-pireview-wrapper"> <img src="${res.data.img_link}"/></div>`
          );
          $("#operationSection .ai-preview").show();
          setTimeout(function () {
            $("#operationSection .ai-preview img").on("load", function () {
              generateSuccess();
            });
          }, 0);
          $("#downloadModal .ai-img").attr("src", res.data.img_link);
          $(".download-watermark-container .ai-img").attr(
            "src",
            res.data.img_link
          );
          clearInterval(polingTimer);
        } 
      }
    });
  },5000)
}

function animateProgress(mainClass, timerName, gapWidth) {
  $(`${mainClass} .progress-box .active-progress`).css("width", "10%");
  $(`${mainClass} .progress-box`).show();
  var currentWidth = 10;
  window[timerName] = setInterval(function () {
    currentWidth = currentWidth + (gapWidth ? gapWidth : 5);
    if (currentWidth > 99) {
      currentWidth = 99;
      clearInterval(window[timerName]);
    }
    $(`${mainClass} .progress-box .active-progress`)
      .stop()
      .animate({ width: currentWidth + "%" });
  }, 1000);
}

function hideProgress(mainClass, timerName) {
  clearInterval(window[timerName]);
  $(`${mainClass} .progress-box .active-progress`).css("width", "10%");
  $(`${mainClass} .progress-box`).hide();
}

function generateFailed() {
  nativeSensors("aiNativeGenerateFinish", { result: "fail" });
  // clearInterval(window.progressTimer);
  $("#operationSection .left-content .right-btns").hide();
  // $("#operationSection .progress-box .active-progress").css("width", "10%");
  // $("#operationSection .progress-box").hide();
  hideProgress("#operationSection", "operationSectionTimer");
  $("#operationSection .fail-box").show();
  $("#operationSection .type-item").removeClass("disabled");
  $("#operationSection .topic-item").removeClass("disabled");
  $("#operationSection .refresh-btn").removeClass("disabled");
  $("#operationSection .form-item").removeClass("disabled");
  $("#operationSection .design-format .design-item").removeClass("disabled");
  $("#operationSection .textarea-box .cover").hide();
  $("#operationSection .generate-btn span").text("Re-Generating");
  $("#operationSection .generate-btn img").attr(
    "src",
    "https://images.edrawmax.com/images2024/ai-native/white-star.png"
  );
  // myLazyLoad.update();
  $("#operationSection .edit-btn>img").removeClass("edit-arrow");
  $("#operationSection .ai-preview").removeClass('ai-scroll-preview')
  window.isAiPreview = false;
}

function generateSuccess() {
  nativeSensors("aiNativeGenerateFinish", { result: "success" });
  hideProgress("#operationSection", "operationSectionTimer");
  $("#operationSection .type-item").removeClass("disabled");
  $("#operationSection .topic-item").removeClass("disabled");
  $("#operationSection .refresh-btn").removeClass("disabled");
  $("#operationSection .form-item").removeClass("disabled");
  $("#operationSection .design-format .design-item").removeClass("disabled");
  $("#operationSection .textarea-box .cover").hide();
  $("#operationSection .preview-box .tooltip-custom").hide();
  $("#operationSection .generate-btn span").text("Re-Generate");
  $("#operationSection .generate-btn img").attr(
    "src",
    "https://images.edrawmax.com/images2024/ai-native/white-star.png"
  );
  $("#operationSection .left-content .right-btns").css("display", "flex");
  $("#operationSection .left-content .right-btns .ai-img-section").show();
  $("#operationSection .left-content .right-btns .tooltip-custom").show();
  if (this.isMobileDevice()) {
    $("#operationSection .left-content .preview-box.swiper").css(
      "overflow",
      "unset"
    );
  }
  $("#operationSection .comment-btns").show();
  $("#operationSection .edit-btn>img").addClass("edit-arrow");
  $("#operationSection .ai-preview").css("opacity", 1);
  $("#scatterCanvas").addClass("visible");
  window.scatterFlowers.reStart();
  window.isAiPreview = true;
}

function resetGenerate(showLoading) {
  if (!showLoading) {
    hideProgress("#operationSection", "operationSectionTimer");
    $("#operationSection .preview-box .tooltip-custom").show();
  }
  // hideProgress("#community", "communityTimmer");
  $("#operationSection .left-content .right-btns .ai-img-section").hide();
  $("#operationSection .left-content .right-btns .tooltip-custom").hide();
  $("#operationSection .comment-btns").hide();
  $("#operationSection .fail-box").hide();
  $("#operationSection .type-item").removeClass("disabled");
  $("#operationSection .topic-item").removeClass("disabled");
  $("#operationSection .refresh-btn").removeClass("disabled");
  $("#operationSection .form-item").removeClass("disabled");
  $("#operationSection .design-format .design-item").removeClass("disabled");
  $("#operationSection .textarea-box .cover").hide();
  $("#operationSection .generate-btn span").text("Generate For Free");
  $("#operationSection .generate-btn img").attr(
    "src",
    "https://images.edrawmax.com/images2024/ai-native/white-star.png"
  );
  
  $("#operationSection .ai-preview").hide();
  $("#operationSection .echart-preview").hide();
  $("#operationSection .swiper-wrapper.preview-content").show();
  $("#operationSection .edit-btn>img").removeClass("edit-arrow");
  window.isAiPreview = false;
}

$("#operationSection .refresh-btn").click(function () {
  if ($(this).attr("class").indexOf("disabled") > -1) {
    return;
  }
  if (window.topicSwiper.isEnd) {
    window.topicSwiper.slideTo(0);
    return;
  }
  window.topicSwiper.slideNext();
});

function getCookie(name) {
  var v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
  return v ? decodeURIComponent(v[2]) : null;
}

$(".close-eidt-tip").click(function () {
  $("#operationSection .top-tip").hide();
});

$("#operationSection .left-content .top-bar .edit-btn").click(function () {
  if (isMobileDevice()) {
    // openApp();
    var generateText = $("#operationSection .generate-btn span").text();
    var editMsg = generateText !== "Generate For Free" || window.isAiPreview? "Please click 'Share Drawing' to copy the link. Open the link on your computer to edit." : "Please open the link on your computer to edit."
    showMessage(editMsg,"none")
    return;
  }
  var generateText = $("#operationSection .generate-btn span").text();
  var name = getActiveType().name;
  var mode = getActiveType().mode;
  var native_id = "";
  // var aiPreviewDom = $(".ai-preview").css;
  var sensorsObj = {
    diagram_source: "builtInTemplate",
    diagram_type: "randomType",
  };
  if (name !== "Random Type") {
    native_id = getActiveType().templates[0].id;
    sensorsObj.diagram_type = formatToCamelCase(getActiveType().name);
  } else {
    var index = window.previewSwiper.activeIndex;
    var imgSrc = $(
      `.preview-box .swiper-wrapper.preview-content .swiper-slide:eq(${index}) img`
    ).attr("src");
    getActiveType().templates.find(function (item) {
      if (item.img === imgSrc) {
        native_id = item.id;
      }
    });
    if (mode === "native" && window.nativeGenerateMode) {
      mode = window.nativeGenerateMode;
    }

    sensorsObj.diagram_type = window.sensorsDiagramType;
    nativeSensors("aiNativeToEdrawMax", {
      source: "diagramEdit",
    });
  }

  if (generateText !== "Generate For Free" || window.isAiPreview) {
    native_id = window.native_id;
    sensorsObj.diagram_source = "aiGenerated";
  }

  if (getUrlParams.from === "share") {
    native_id = window.native_id;
  }

  nativeSensors("aiNativeEditOnline", sensorsObj);
  goOnlineEdit(native_id, mode, generateText, $("#diagram-topic").val());
});

$(".free-limit-modal .modal-btn").click(function () {
  if (!isMobileDevice()) {
    window.toChartSource = window.almostUsedUp
      ? "generateLimitedSoon"
      : "generateLimited";
    $("#startFreeModal").modal("show");
  } else {
    openLink("https://www.edraw.ai/pricing.html");
    nativeSensors("aiNativeToPurchasePage", {
      source: "generateLimit",
    });
  }
});

$(".vip-limit-modal .modal-btn").click(function () {
  openLink("https://www.edraw.ai/pricing.html");
  nativeSensors("aiNativeToPurchasePage", {
    source: "runOutAIToken",
  });
});

function initTopicList(index, key) {
  var topicDom = "";
  var currentTopic = $("#diagram-topic").val();
  var imgs = [];
  items[index][key].nameToTopic.map(function (temp) {
    imgs.push(temp.img_link);
  });
  previewImgs(imgs);
  // items[index][key].topic  = [items[index][key].topic[0]]
  if (items[index][key].topic.length < 3) {
    $(".topic-title .refresh-btn").hide();
  }
  items[index][key].topic.map(function (item, index) {
    if (index % 2 === 0) {
      topicDom += `${
        index === 0 ? "" : "</div>"
      }<div class="topic-list swiper-slide"><div class="topic-item ${
        currentTopic === item ? "active" : ""
      }" title="${item}">
          <div class="content">${item}</div>
        </div>${index === items[index][key].topic.length - 1 ? "</div>" : ""}`;
    } else {
      topicDom += `<div class="topic-item ${
        currentTopic === item ? "active" : ""
      }" title="${item}">
          <div class="content">${item}</div>
        </div>`;
    }
  });
  $("#operationSection .topic-swiper .swiper-wrapper").append(topicDom);

  window.topicSwiper = new Swiper(".topic-swiper", {
    slidesPerView: 1,
    simulateTouch: false,
  });

  $(".topic-list").each(function (index, element) {
    if ($(element).find(".topic-item.active").length > 0) {
      topicSwiper.slideTo(index);
    }
  });

  $(".topic-list").on("click", ".topic-item", function (event) {
    if ($(this).attr("class").indexOf("disabled") > -1) {
      return;
    }
    $("#previewTooltip").css("opacity", "0");
    $(".swiper-wrapper.preview-content").css("opacity", "0");
    $("#operationSection .progress-tip.tip-content").text("loading...");
    $("#operationSection .progress-tip.tip-content").css(
      "text-align",
      "center"
    );
    animateProgress("#operationSection .left-content", "operationSectionTimer");

    nativeSensors("aiNativeChangeTopic");
    changeTopic(false, $(event.target).text());
    $("#operationSection .topic-item").removeClass("active");
    $(event.target).parent().addClass("active");

    $("#operationSection .swiper-wrapper.preview-content .swiper-slide img")
      .on("load", function () {
        hideProgress("#operationSection", "operationSectionTimer");
        $("#operationSection .progress-tip.tip-content").text(
          "Edraw.AI is generating, please wait..."
        );
        $("#operationSection .progress-tip.tip-content").css(
          "text-align",
          "unset"
        );
        $("#previewTooltip").css("opacity", "1");
        $("#previewTooltip").show();
        $(".swiper-wrapper.preview-content").css("opacity", "1");
      })
      .each(function () {
        if (this.complete) {
          $(this).trigger("load");
        }
      });
  });
}

$(".change-topics").click(function () {
  nativeSensors("aiNativeChangeTopic");
  if (getActiveType().topic.length === 1) {
    return;
  }
  changeTopic();
});

if (window.LazyLoad) {
  var myLazyLoad = new LazyLoad();
}


// 问答部分
$("#FAQs .FAQ-item").click(function () {
  if ($(this).hasClass("active")) {
    $(".answer").slideUp();
    $("#FAQs .FAQ-item").removeClass("active");
    return;
  }
  $("#FAQs .FAQ-item").removeClass("active");
  $(this).addClass("active");
  $(".answer").slideUp();
  $(this).find(".answer").slideDown();
});

// 免费试用及立即购买
// $(".try-free").click(function () {
//   openLink("https://www.edrawmax.com/online/en/");
// });
$(".top-main .try-free").click(function () {
  openLink("https://www.edraw.ai/app/aitool/diagram");
  nativeSensors("aiNativeToEdrawMax", {
    source: "topGetStarted",
  });
});
$("#slogan .try-free").click(function () {
  openLink("https://www.edraw.ai/app/aitool/diagram");
  nativeSensors("aiNativeToEdrawMax", {
    source: "bottomGetStarted",
  });
});
$("#aiCanDo .try-free").click(function () {
  if (isMobileDevice()) {
    openApp();
    return;
  }
  openLink("https://www.edraw.ai/app/aitool/diagram");
  nativeSensors("aiNativeToEdrawMax", {
    source: "productIntro",
  });
});
$(".top-main .buy-now").on("click", function () {
  if (validateLogin("topTryEdrawMaxPro")) {
    openLink("https://www.edraw.ai/pricing.html");
    nativeSensors("aiNativeToPurchasePage", {
      source: "topTryEdrawMaxPro",
    });
  }
});
$("#slogan .buy-now").on("click", function () {
  if (validateLogin("bottomTryEdrawMaxPro")) {
    nativeSensors("aiNativeToPurchasePage", {
      source: "bottomTryEdrawMaxPro",
    });
    openLink("https://www.edraw.ai/pricing.html");
  }
});
$("#pricing-drop").click(function () {
  nativeSensors("aiNativeToEdrawMax", {
    source: "topNavigationBarOnline",
  });
});
$(".right-side a:nth-child(2)").click(function () {
  nativeSensors("aiNativeToEdrawMax", {
    source: "rightNavigationBarOnline",
  });
});

// 获取当前是否为会员
function getIsPro(type, templateId) {
  var user_id = "";
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    if (!userInfo) {
      return;
    }
    var _userInfo = JSON.parse(userInfo);
    user_id = _userInfo.user_id;
    token = _userInfo.token;
  }

  $.ajax({
    type: "get",
    url: `https://${window.nativeBaseUrl}/api/user/base/info?ext=1`,
    contentType: "application/json",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (res) {
      if (res.code === 0) {
        if (type === "download") {
          if (!res.data || (Date.now() > res.data.ext_info?.pro_exp_tm && Date.now() > res.data.ext_info?.unl_exp_tm)) {
            // openLink("https://www.edraw.ai/pricing.html");
            // nativeSensors("aiNativeDownload", {
            //   type: "noWatermark",
            //   result: "upgradeNeeded",
            //   is_vip: false,
            // });
            // nativeSensors("aiNativeToPurchasePage", {
            //   source: "downloadNeeded",
            //   is_vip: false,
            // });
            nativeSensors("aiNativeClickDownload", { is_vip: false });
            window.toChartSource = "downloadNeeded";
            $("#tryFreeTipModal").modal("show");
          } else {
            nativeSensors("aiNativeClickDownload", { is_vip: true });
            downloadNoWaterImg();
          }
        }
      } else {
        showMessage(res.msg);
      }
    },
    error: function (err) {
      var data = err.responseJSON;
      showMessage(data.msg);
    },
    fail: function (res) {
      showMessage(res.msg);
    },
  });
}


// feedbackmodal点击事件
$("#feedbackModal .check-box").click(function () {
  var dom = $("#feedbackModal .check-box .checkbox-icon");
  if (dom.hasClass("active")) {
    $("#feedbackModal .check-box .checkbox-icon").removeClass("active");
    $("#feedbackModal .email-input-box").hide();
  } else {
    $("#feedbackModal .check-box .checkbox-icon").addClass("active");
    $("#feedbackModal .email-input-box").show();
  }
});

$("#feedbackModal .submit-btn").click(function () {
  if (!validateLogin()) {
    return;
  }
  var inputText = $("#feedbackModal .input-box textarea").val();
  var emailText = $("#feedbackModal .email-input-box textarea").val();
  if (!inputText) {
    $("#feedbackModal").modal("hide");
  }
  var userInfo = getCookie("EDCurrent");
  var _userInfo = JSON.parse(userInfo);
  var token = _userInfo.token;
  var params = {
    native_id: window.native_id,
    score: "1",
    reason: inputText,
    email: emailText,
  };
  window.generateRequest = $.ajax({
    type: "put",
    url: `https://${window.nativeBaseUrl}/api/ai/v1/completions/na/score`,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify(params),
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function () {
      $("#feedbackModal").modal("hide");
      showMessage("Submit successfully", "success");
      $("#feedbackModal .input-box textarea").val("");
      $(".comment-btns").hide();
    },
    error: function (err) {
      var data = err.responseJSON;
      $("#feedbackModal").modal("hide");
      showMessage(data.msg);
      $("#feedbackModal .input-box textarea").val("");
    },
    fail: function (res) {
      $("#feedbackModal").modal("hide");
      showMessage(res.msg);
      $("#feedbackModal .input-box textarea").val("");
    },
  });
});

// downloadmodal
$("#downloadModal .download-item").click(function () {
  $("#downloadModal .download-item").removeClass("active");
  $(this).addClass("active");
});

$("#downloadModal").on("show.bs.modal", function () {
  // 在这里，你可以执行你想要在模态框显示时进行的操作
  setTimeout(function(){
    setCanvasSize();
    // setDownloadCanvasSize();
  }, 0);
});

// 创建一个函数来设置canvas的尺寸
function setCanvasSize() {
  var canvas = document.getElementById("watermark");
  var container = document.getElementById("watermark-container");

  if(!container){
    return
  }

  var downloadCanvas = document.querySelector(".download-watermark");
  var downloadContainer = document.querySelector(
    ".download-watermark-container"
  );

  // 设置canvas的宽度和高度为其父元素宽高
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;

  downloadCanvas.width = downloadContainer.offsetWidth;
  downloadCanvas.height = downloadContainer.offsetHeight;

  // 创建一个临时canvas用于调整水印的尺寸
  var tempCanvas = document.createElement("canvas");
  tempCanvas.width = 220; // 水印的宽度
  tempCanvas.height = 220; // 水印的高度

  var tempCtx = tempCanvas.getContext("2d");

  var ctx = canvas.getContext("2d");
  var downloadCtx = downloadCanvas.getContext("2d");
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    // 将图像绘制到临时canvas上
    tempCtx.drawImage(img, 0, 0, 220, 220);

    var pattern = ctx.createPattern(tempCanvas, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var downloadPattern = downloadCtx.createPattern(tempCanvas, "repeat");
    downloadCtx.fillStyle = downloadPattern;
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
  };
  img.src = "https://images.edraw.ai/native/water-mark.svg";
}

function setDownloadCanvasSize() {
  var downloadCanvas = document.querySelector(".download-watermark");
  var downloadContainer = document.querySelector(
    ".download-watermark-container"
  );

  // 设置canvas的宽度和高度为其父元素宽高
  downloadCanvas.width = downloadContainer.offsetWidth;
  downloadCanvas.height = downloadContainer.offsetHeight;

  // 创建一个临时canvas用于调整水印的尺寸
  var tempCanvas = document.createElement("canvas");
  tempCanvas.width = 115; // 水印的宽度
  tempCanvas.height = 120; // 水印的高度

  var tempCtx = tempCanvas.getContext("2d");

  var downloadCtx = downloadCanvas.getContext("2d");
  var img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    // 将图像绘制到临时canvas上
    tempCtx.drawImage(img, 20, 20, 75, 80);

    var downloadPattern = downloadCtx.createPattern(tempCanvas, "repeat");
    downloadCtx.fillStyle = downloadPattern;
    downloadCtx.fillRect(0, 0, downloadCanvas.width, downloadCanvas.height);
  };
  img.src = "https://images.edrawmax.com/images2024/ai-native/water-mark.png";
}

// 监听窗口的resize事件
window.addEventListener("resize", function () {
  // 窗口大小改变时，重新设置canvas的尺寸和生成水印
  setCanvasSize();
  // 窗口大小改变时，重新设置canvas的尺寸
  initScatterFlowers();
});

// 监听窗口的scroll事件
window.addEventListener("scroll", function () {
  // myLazyLoad.update();
});

// 监听下载按钮的点击事件
$("#downloadModal .submit-btn").click(function () {
  if ($(".download-item.active").hasClass("no-watermark")) {
    // getIsPro('download');
    if (validateLogin("downloadNeeded")) {
      getIsPro("download");
      return;
    } else {
      nativeSensors("aiNativeDownload", {
        type: "noWatermark",
        result: "signInNeeded",
      });
    }
  } else {
    downloadWatermarkImg();
    // domtoimage
    //   .toPng(document.querySelector(".download-watermark-container"))
    //   .then(function (dataUrl) {
    //     // 下载图片
    //     downloadImg(dataUrl);
    //   })
    //   .catch(function () {
    //     nativeSensors("aiNativeDownload", {
    //       type: "watermark",
    //       result: "fail",
    //     });
    //   });
  }
});

function downloadWatermarkImg() {
  domtoimage
    .toPng(document.querySelector(".download-watermark-container"))
    .then(function (dataUrl) {
      // 下载图片
      downloadImg(dataUrl);
    })
    .catch(function () {
      nativeSensors("aiNativeDownload", {
        type: "watermark",
        result: "fail",
      });
    });
}

function downloadNoWaterImg() {
  var mode = getActiveType().mode;
  var urlParam = getUrlParams();
  if (urlParam.from && urlParam.from === "share") {
    mode = getUrlParams().mode
  }

  if (mode.indexOf("echart") > -1) {
    try {
      var canvas = window.aiEchart.getRenderedCanvas({
        pixelRatio: 2,
        backgroundColor: "#fff",
      });

      var image = new Image();
      image.src = canvas.toDataURL("image/png");

      var link = document.createElement("a");
      link.href = image.src;
      link.download = "Edraw.AI-diagram.png";
      link.click();
      // nativeSensors("aiNativeDownload", {
      //   type: "noWatermark",
      //   result: "success",
      //   is_vip: true,
      // });
      nativeSensors("aiNativeDownloadSucess", {
        type: "noWatermark",
        is_vip: true,
      });
    } catch {
      nativeSensors("aiNativeDownload", {
        type: "noWatermark",
        result: "fail",
        is_vip: true,
      });
    }
  } else {
    downloadImg(window.aiPreviewImg, true);
  }
}

// 禁用右键
document
  .querySelector(".download-item")
  .addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
document
  .querySelector("#watermark")
  .addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });
document
  .querySelector(".download-watermark")
  .addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

document
  .querySelector(".preview-box")
  .addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

function downloadImg(url, isNoWater) {
  fetch(url)
    .then((response) => response.blob())
    .then(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "Edraw.AI-diagram.png";
      a.click();
      var obj = {
        type: isNoWater ? "noWatermark" : "watermark",
        // result: "success",
      };
      if (isNoWater) {
        obj.is_vip = true;
      }
      nativeSensors("aiNativeDownloadSucess", obj);
    })
    .catch(() => {
      var _obj = {
        type: isNoWater ? "noWatermark" : "watermark",
        // result: "success",
      };
      if (isNoWater) {
        _obj.is_vip = true;
      }
      nativeSensors("aiNativeDownloadSucess", _obj);
    });
}

$(".ai-img-section.popover-btn.download-btn").click(function () {
  // $("#downloadModal").modal("show");
  if (validateLogin("downloadNeeded")) {
    getIsPro("download");
  }
});

$(".comment-btn.like").click(function () {
  $(".comment-btns").hide();
  showMessage("Thanks for feedback", "success");
  nativeSensors("aiNativeComment", { result: "like" });
});
$(".comment-btn.unlike").click(function () {
  $("#feedbackModal").modal("show");
  nativeSensors("aiNativeComment", { result: "dislike" });
});

function copyStr(str) {
  var oInput = document.createElement("input");
  oInput.value = str;
  document.body.appendChild(oInput);
  oInput.select();
  document.execCommand("Copy");
  oInput.style.display = "none";
  document.body.removeChild(oInput);
}

function validateLogin(source) {
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
    return true;
  }
  var userInfo = getCookie("EDCurrent");
  if (!userInfo) {
    if (source) {
      nativeSensors("aiNativeToSignIn", { source });
      // if(source==='')
    }
    if (window.edAiAuth) {
      window.edAiAuth.show();
    } else {
      if (isMobileDevice()) {
        $("button.navbar-toggler")[0].click();
      }
      setTimeout(function () {
        $("#ed-uinfo-signin")[0].click();
      }, 100);
    }
    return false;
  } else {
    return true;
  }
}

function analyzeJsonContent(jsonString,isShare) {
  // 使用正则表达式匹配函数并将其转换为字符串
  var functionRegex = /function.*?\(.*?\).*?{.*?}/gs;
  var modifiedJsonString = jsonString.replace(functionRegex, function (match) {
    return JSON.stringify(match);
  });

  // 使用 JSON.parse() 解析 JSON 字符串
  var jsonObject = JSON.parse(modifiedJsonString);

  addEchartColor(jsonObject,isShare);

  if (
    getUrlParams().typeName === "heat map" ||
    getActiveType().mode === "echart-heatmap"
  ) {
    if (jsonObject.grid) {
      jsonObject.grid.left = "20%";
      jsonObject.grid.top = "-10%";
    }
    if (jsonObject.visualMap) {
      jsonObject.visualMap.top = "10px";
    }
  }

  // 使用递归函数将所有的函数字符串转换回函数
  function convertFunctions(obj) {
    for (var key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        convertFunctions(obj[key]);
      } else if (
        typeof obj[key] === "string" &&
        obj[key].startsWith("function")
      ) {
        obj[key] = eval("(" + obj[key] + ")");
      }
    }
  }

  convertFunctions(jsonObject);

  // 输出转换后的 JSON 对象
  return jsonObject;
}

function loopSetIdAndColor(item, parentId = "", index = 0, color) {
  if (parentId) {
    item.id = `${parentId}-${index + 1}`;
  } else {
    item.id = `${index + 1}`;
  }
  if (item.itemStyle) {
    item.itemStyle.color = color;
  } else {
    item.itemStyle = { color: color };
  }
  if (item?.children?.length > 0) {
    item.children.forEach((child, childIndex) => loopSetIdAndColor(child, item.id, childIndex, color));
  }
}

var itemStyleColor = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
function addEchartColor(obj,isShare){
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140" 
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    if(userInfo) {
      var _userInfo = JSON.parse(userInfo);
      token = _userInfo.token;
    } 
  }

  var dataModes = ['echart-pie','echart-radar','echart-funnel'];
  var seriesModes = ['echart-bar',"echart-line","echart-scatter","echart-boxplot","echart-heatmap","echart-parallel"];
  var otherModes = ['echart-sunburst'];
  var echartModes = dataModes.concat(seriesModes).concat(otherModes);
  var mode = getActiveType().mode;
  
  if(!token || isShare || echartModes.indexOf(mode)===-1){
    return
  }
 

  if(dataModes.indexOf(mode)>-1){
    var data = Array.isArray(obj.series) ? obj.series[0].data || [] : obj.series.data || [];
    mapSetColor(data)
  } else if(seriesModes.indexOf(mode)>-1){
    var data = Array.isArray(obj.series) ? obj.series || [] : [obj.series] || [];
    mapSetColor(data)
  } else if(mode==='echart-sunburst'){
    var data = Array.isArray(obj.series) ? obj.series || [] : [obj.series] || [];
    data.forEach((item) => {
      const tempData = Array.isArray(item.data) ? item.data : [item.data];
      tempData.forEach((tempDataItem, tempDataItemIndex) => {
        const color = itemStyleColor[(tempDataItemIndex + 1) % itemStyleColor.length];
        loopSetIdAndColor(tempDataItem, "", tempDataItemIndex, color);
      });
    });
  }

  $.ajax({
    type: "put",
    url: `https://${window.nativeBaseUrl}/api/ai/v1/completions/native/asst`,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      native_id: window.native_id,
      content: JSON.stringify(obj)
    }),
    headers: {
      Authorization: "Bearer " + token,
    }
  });

}

function mapSetColor(data){
  data?.forEach((function(dataItem,index){
    var currentColor = itemStyleColor[index % itemStyleColor.length];
    if(dataItem.itemStyle){
      dataItem.itemStyle.color = currentColor
    } else {
      dataItem.itemStyle = {
        color: currentColor
      }
    }
  }))
}

// 当页面的可见性改变时，取消延时函数
document.addEventListener("visibilitychange", function () {
  // if (document.visibilityState === "visible") {
  //   clearTimeout(oldTimer);
  //   clearTimeout(timer);
  // }
  if (document.hidden) {
    clearTimeout(window.oldTimer);
    clearTimeout(window.timer);
  }
});

function openApp() {
  var type = "pre_edit";
  var generateText = $("#operationSection .generate-btn span").text();
  var name = getActiveType().name;
  var mode = getActiveType().mode;
  var native_id = "";
  if (name !== "Random Type") {
    native_id = getActiveType().templates[0].id;
  } else {
    var index = window.previewSwiper.activeIndex;
    // native_id = getActiveType().templates[index - 2 || 0].id;
    var imgSrc = $(
      `.preview-box .swiper-wrapper.preview-content .swiper-slide:eq(${index}) img`
    ).attr("src");
    getActiveType().templates.find(function (item) {
      if (item.img === imgSrc) {
        native_id = item.id;
      }
    });
    if (mode === "native" && window.nativeGenerateMode) {
      mode = window.nativeGenerateMode;
    }
  }

  if (
    generateText !== "Generate For Free" ||
    window.isAiPreview ||
    getUrlParams().from === "share"
  ) {
    native_id = window.native_id;
  }

  mode = mode || getUrlParams().mode;

  var file_id = native_id;
  var echart_id = native_id;
  var ai4type = mode;
  var ai4text = $("#diagram-topic").val();
  var url = `type=${type}&file_id=${file_id}&ai4type=${ai4type}&ai4text=${ai4text}`;
  if (mode.indexOf("echart") > -1 && generateText !== "Generate For Free") {
    type = "create_echart";
    url = `type=${type}&echart_id=${echart_id}&ai4type=${ai4type}&ai4text=${ai4text}`;
  }

  var appScheme = "myapp://edrawmax.app/main?from=native";
  // var newAppScheme = "edrawmax://?from=native";
  // url = 'type=pre_edit&file_id=be24e22b26d2427eb88dd702c129c2f2&ai4type=flowchart&ai4text=The process of growing plants.'
  var newAppScheme = `edrawmax://mobile?from=native&${url}`;

  var iosAppUrl =
    "https://apps.apple.com/us/app/edrawmax-ai-diagram-maker/id1663182670";
  var androidAppUrl =
    "https://play.google.com/store/apps/details?id=com.edrawsoft.edrawmax.oversea.mobile";


  // 尝试打开新版本应用
  creatHiddenLink(newAppScheme);

  // 尝试打开老版本应用
  window.oldTimer = setTimeout(function () {
    creatHiddenLink(appScheme);
  }, 2000);

  // 如果应用没有打开，那么可能是用户没有安装这个应用
  // 根据设备类型跳转到不同的应用商店
  window.openAppTimer = setTimeout(function () {
    var isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (
      confirm(
        "The app did not open successfully. Do you want to go to the app store to download it?"
      )
    ) {
      window.location = isIOS ? iosAppUrl : androidAppUrl;
    }
  }, 3000);

  window.onblur = function () {
    clearTimeout(window.openAppTimer);
  };
}

function creatHiddenLink(url) {
  var hiddenLink = document.createElement("a");
  hiddenLink.style.display = "none";
  hiddenLink.href = url;
  document.body.appendChild(hiddenLink);
  hiddenLink.click();
}

function isMobileDevice() {
  return window.matchMedia("only screen and (max-width: 600px)").matches;
}

if (isMobileDevice()) {
  $(".change-topics").show();

  // 1.2 新增
  $("#moreDiagram .section-content").addClass("swiper");
  $("#moreDiagram .section-content .more-diagram-list").addClass(
    "swiper-wrapper"
  );
  var $items = $(".more-diagram-item");
  var $swiperWrapper = $(".more-diagram-list.swiper-wrapper");

  var slideWidth = $("#moreDiagram .section-content").width();
  for (var i = 0; i < $items.length; i += 6) {
    var $slide = $(
      `<div class="swiper-slide" style="width:${slideWidth}px !important"></div>`
    ); // 创建一个新的 swiper-slide 元素
    $slide.append($items.slice(i, i + 6)); // 将当前组的元素添加到 swiper-slide 中
    $swiperWrapper.append($slide); // 将 swiper-slide 添加到 swiper-wrapper 中
  }
  var moreDiagramSwiper = new Swiper("#moreDiagram .section-content", {
    autoplay: true,
    loop: true,
    pagination: {
      el: ".moreDiagram-swiper-pagination",
      clickable: true,
    },
  });

  // function createSlideDom(selectedElements){
  //   var slideDom = `<div class='swiper-slide'></div>`
  //   var selectedElements = $('.more-diagram-list .more-diagram-item').slice(0, 7)
  // }

  $('.medal-bar .medal-2022').attr('data-src','https://images.edrawmax.com/images2024/ai-native/medal-2023.png')
} else {
  console.log("Desktop Device");
}

$('.right-side img[alt*="download Edraw.AI"]').hide();

initSensors();
function initSensors() {
  var script = document.createElement("script");
  script.src = "https://dev-en-statics.edraw.ai/app/js/sensorsdata.min.js";
  script.onload = function () {
    var sensors = window["sensorsDataAnalytic201505"];
    var project = ["localhost", "10.90.135.140"].indexOf(location.hostname) > -1 ?"PC_test_project":"UA_EdrawAI_web"

    sensors.init({
      server_url:
        `https://analytics.300624.com:8106/sa?project=${project}`,
      is_track_single_page: true,
      use_client_time: true,
      send_type: "beacon",
      show_log: false,
      heatmap: {
        clickmap: "default",
        scroll_notice_map: "not_collect",
      },
    });
    var registerObj = {
      tid: "UA_EdrawAI_web",
      pid: 20032,
      pver: "1.0.7",
      oszone: 0,
      pbrand: "Wondershare",
      psource: "20032",
      plang: "en",
      ai_native_website: "default",
      // ai_native_share: false,
      ai_native_device: isMobileDevice() ? "mobile" : "pc",
      ai_native_share: getUrlParams().from === "share",
    };
    var userInfo = getCookie("EDCurrent");
    if (userInfo) {
      var _userInfo = JSON.parse(userInfo);
      registerObj.uid = _userInfo.user_id;
      registerObj.register_time = formateDate(_userInfo.reg_time);
    }
    var pathname = location.pathname;
    if (
      location.hostname === "www.edraw.ai" ||
      location.hostname === "localhost" ||
      location.hostname === "10.90.135.140"
    ) {
      var type = pathname.split("/")[2].replace("ai-", "");
      registerObj.ai_native_website = toCamelCase(type);
      if (["diagram-generator","chart-generator","graph-generator"].includes(type)) {
        registerObj.ai_native_website = "diagramB";
      }
    } else {
      if (containsDiagramCode) {
        registerObj.ai_native_website = "diagramB";
      } else {
        registerObj.ai_native_website = formatToCamelCase(
          getCurrentPageItem().pageItem.name
        );
      }
    }

    sensors.registerPage(registerObj);
    sensors.quick("autoTrack");

    window.sensors = sensors;
  };
  document.body.appendChild(script);
}

window.addEventListener("beforeunload", function () {
  nativeSensors("aiNativeExit");
});

function formateDate(timestamp) {
  var date = new Date(timestamp * 1000); // 转换为毫秒级时间戳

  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return year + "-" + month + "-" + day;
}

function observerTargetChange() {
  // 选择需要观察变动的节点
  var targetNode = document.getElementById("edraw-authorization");

  // 观察器的配置（需要观察什么变动）
  var config = { attributes: true, childList: false, subtree: false };

  var callback = function (mutationsList) {
    for (var mutation of mutationsList) {
      if (mutation.type === "attributes" && targetNode) {
        if (targetNode.style.visibility == "hidden") {
          var userInfo = getCookie("EDCurrent");
          var result = false;
          if (userInfo) {
            var _userInfo = JSON.parse(userInfo);
            result = !!_userInfo.user_id;
            window.sensors.register({
              uid: _userInfo.user_id,
            });

            if (result) {
              // $(".wsc-ad-plugin-container").css('display:none !important');
              if (
                !localStorage.getItem(
                  `edrawmax_survey_completed_${_userInfo.user_id}`
                )
              ) {
                $("#top-ad-bar").show();
              }

              if(getUrlParams().from !== 'share'){
                $(".right-form .generate-btn").click();
              }

            }
          }
          nativeSensors("aiNativeSignInResult", {
            result,
          });
        }
      }
    }
  };

  // 创建一个观察器实例并传入回调函数
  var observer = new MutationObserver(callback);

  // 创建一个定期运行的函数，每秒检查一次弹窗的显示状态
  var checkInterval = setInterval(function () {
    if (targetNode && targetNode.style.visibility == "visible") {
      observer.observe(targetNode, config);
      clearInterval(checkInterval);
    }
  }, 1000);
}

function changeABstyle() {
  var num = Math.random();
  var from = getUrlParams().from;
  var diagramType = getUrlParams().diagramType;
  if (diagramType) {
    if (diagramType === "A") {
      $("#topSection").css("opacity", "1");
      $("#operationSection").css("opacity", "1");
      return 0.1;
    } else {
      num = 0.6;
    }
  }
  if (num > 0.5 && !isMobileDevice() && from !== "share") {
    $("#operationSection .right-form").prepend(`<div class="sectionB-title">
    <div class="main-title">EdrawMax <span>AI Diagram Generator</span></div>
    <p class="describe">Convert text to diagrams online for free</p>
    </div>`);
    $("#topSection").addClass("topSectionB");
    $("#operationSection").addClass("operationSectionB");
    $("#operationSection .sectionB-title").show();
  }
  $("#topSection").css("opacity", "1");
  $("#operationSection").css("opacity", "1");
  return num;
}

// v1.1 新增
var topAdNum = 0;
var topAdTimer = setInterval(function () {
  topAdNum++;
  var userInfo = getCookie("EDCurrent");
  if (userInfo) {
    var _userInfo = JSON.parse(userInfo);
    if (
      localStorage.getItem(`edrawmax_survey_completed_${_userInfo.user_id}`)
    ) {
      clearInterval(topAdTimer);
      return;
    }
    $("#top-ad-bar").show();
  }
  if (topAdNum > 10 || userInfo) {
    clearInterval(topAdTimer);
  }
}, 1000);
$("#top-ad-bar .close-ad").click(function () {
  $("#top-ad-bar").hide();
  // $(".wsc-ad-plugin-container").css('display:block !important');
});
$("#top-ad-bar .top-ad-container a").click(function () {
  var userInfo = getCookie("EDCurrent");
  var _userInfo = JSON.parse(userInfo);
  result = !!_userInfo.user_id;
  localStorage.setItem(`edrawmax_survey_completed_${_userInfo.user_id}`, true);
  $("#top-ad-bar").hide();
  // $(".wsc-ad-plugin-container").css('display:block !important');
  survey();
});

function survey() {
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    token = _userInfo.token;
  }

  $.ajax({
    type: "post",
    url: `https://${window.nativeBaseUrl}/api/ai/act/survey`,
    contentType: "application/json",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (res) {
      var code = res.code;
      if (code === 0) {
      } else {
        // generateFailed();
      }
    },
    error: function (err) {
      var data = err.responseJSON;
      showMessage(data.msg);
    },
    fail: function (res) {
      showMessage(res.msg);
    },
  });
}

function createScatterFlowers() {
  /*
    撒花效果

    必传项
    canvas
    flowersColor    彩带color
    faceColor   笑脸颜色
    eyeColor    眼睛颜色
    mouthColor  笑嘴颜色

    颜色传参格式及描述
    彩带:[[
        '250,174,255-60-11', '244,150,255-80-63', '247,197,255-100-100'
    ], [
        '255,255,255-80-25', '255,169,108-100-100'
    ], [
        '195,255,176-80-0', '69,197,117-100-100'
    ], [
        '79,213,255-80-0', '43,187,250-100-100'
    ]]
    彩带为多种颜色，所以传数组-----每条彩带为线性渐变，所以传二位数组-----250,174,255：rgb三色值---60：透明度---11：线性渐变结束为止百分比
    笑脸：'255,200,44-100'
    255,200,44：rgb三色值---100：透明度

    为保持运动一致，字段精简，笑脸运动基于彩带字段
*/

  var devicePixelRatio = window.devicePixelRatio;
  if (devicePixelRatio >= 3) {
    dpr = 3;
  } else if (devicePixelRatio >= 2) {
    dpr = 2;
  } else {
    dpr = 1;
  }
  window.dpr = dpr;
  window.rem = 86;
  function ScatterFlowers(opts) {
    this.canvas = opts.canvas;
    this.canvas.width = this.canvas.offsetWidth * window.dpr;
    this.canvas.height = this.canvas.offsetHeight * window.dpr;
    this.ctx = opts.canvas.getContext("2d");

    this.flowersColor = opts.flowersColor; // 彩带颜色
    this.flowersLength =
      opts.flowersLength || Math.floor(this.canvas.offsetWidth / 20); // 彩带个数
    this.flowersWidth =
      (opts.flowersWidth || Math.floor(this.canvas.offsetWidth / 60)) *
      window.dpr; // 彩带宽度
    this.flowersHeight =
      (opts.flowersHeight || Math.floor(this.canvas.offsetWidth / 20)) *
      window.dpr; // 彩带长度
    this.flowersArr = []; // 彩带数组

    this.animationFrequency = opts.animationFrequency || 10; // 彩带上升运动步数
    this.animationFrequencyTime = opts.animationFrequencyTime || 10; // 彩带上升运动时间间隔
    this.animationFrequencyEd = 0; // 彩带上升运动当前步数
    this.fallingFrequency = opts.fallingFrequency || 100; // 彩带飘落运动步数
    this.fallingFrequencyTime = opts.fallingFrequencyTime || 10; // 彩带飘落运动时间间隔
    this.fallingSwingNum = opts.fallingSwingNum || 3; // 彩带一次摇摆所需帧长  奇数
    this.fallingSwing = opts.fallingSwing || 0.05; // 彩带摇摆帧步长
    this.fallingFrequencyEd = 0; // 彩带飘落运动当前步数

    this.faceFlag = opts.faceFlag === false ? false : true; // 是否显示笑脸
    this.faceR = opts.faceR || (12 * window.dpr * window.rem) / 75; // 笑脸半径
    this.eyeR = opts.eyeR || (2 * window.dpr * window.rem) / 75; // 眼睛半径
    this.mouthR = opts.mouthR || (8 * window.dpr * window.rem) / 75; // 笑嘴半径
    this.faceColor = opts.faceColor; // 笑脸颜色
    this.eyeColor = opts.eyeColor; // 眼睛颜色
    this.mouthColor = opts.mouthColor; // 笑嘴颜色
    this.faceData = {}; // 笑脸中心坐标

    this.debugStartPoint = opts.debugStartPoint || false;

    this.timer = null;
    this.opts = opts;

    // 是否立即执行
    if (opts.autoStart) {
      this.reStart();
    }
  }

  window._ScatterFlowers = ScatterFlowers;

  // 开始或重新开始
  ScatterFlowers.prototype.reStart = function (cb) {
    this.clear();

    this.cb = cb;
    this.initData(this.opts);

    this.animationFrequencyEd = 0; // 彩带上升运动当前步数
    this.fallingFrequencyEd = 0; // 彩带飘落运动当前步数

    this.drawFlowers();
    this.drawFace();
    this.run();
  };
  // 初始话彩带、笑脸数据
  ScatterFlowers.prototype.initData = function (opts) {
    this.start = opts.start || {
      x: this.canvas.width / 2,
      y: (this.canvas.height / 5) * 3,
    };

    this.flowersArr = [];
    for (var i = 0; i < this.flowersLength; i++) {
      // 四象限
      var flag = this.rand(1, 4);
      // 弯曲2次flag
      var bendingFlag = this.rand(0, 1);
      var control = null;
      var control2 = null;
      var end = {};
      var deviation = {};
      if (bendingFlag) {
        switch (flag) {
          case 1:
            control = {
              x: this.rand(this.start.x, this.start.x + this.flowersHeight),
              y: this.rand(this.start.y - this.flowersHeight, this.start.y),
            };
            end = {
              x:
                this.start.x +
                this.rand(this.flowersHeight / 2, this.flowersHeight),
              y:
                this.start.y -
                this.rand(this.flowersHeight / 2, this.flowersHeight),
            };
            deviation = {
              w: this.flowersWidth,
              h: this.flowersWidth,
            };
            break;
          case 2:
            control = {
              x: this.rand(this.start.x, this.start.x + this.flowersHeight),
              y: this.rand(this.start.y, this.start.y + this.flowersHeight),
            };
            end = {
              x:
                this.start.x +
                this.rand(this.flowersHeight / 2, this.flowersHeight),
              y:
                this.start.y +
                this.rand(this.flowersHeight / 2, this.flowersHeight),
            };
            deviation = {
              w: this.flowersWidth,
              h: -this.flowersWidth,
            };
            break;
          case 3:
            control = {
              x: this.rand(this.start.x - this.flowersHeight, this.start.x),
              y: this.rand(this.start.y, this.start.y + this.flowersHeight),
            };
            end = {
              x:
                this.start.x -
                this.rand(this.flowersHeight / 2, this.flowersHeight),
              y:
                this.start.y +
                this.rand(this.flowersHeight / 2, this.flowersHeight),
            };
            deviation = {
              w: this.flowersWidth,
              h: this.flowersWidth,
            };
            break;
          case 4:
            control = {
              x: this.rand(this.start.x - this.flowersHeight, this.start.x),
              y: this.rand(this.start.y - this.flowersHeight, this.start.y),
            };
            end = {
              x:
                this.start.x -
                this.rand(this.flowersHeight / 2, this.flowersHeight),
              y:
                this.start.y -
                this.rand(this.flowersHeight / 2, this.flowersHeight),
            };
            deviation = {
              w: this.flowersWidth,
              h: -this.flowersWidth,
            };
            break;
        }
      } else {
        var endStartX = 0;
        var endStartY = 0;
        var controlIndex = this.rand(2, 4) / 10;
        var controlIndex2 = this.rand(6, 8) / 10;
        var controlIndexNum = this.rand(2, 3);
        var flowersHeightIndex = 3 / 5;
        switch (flag) {
          case 1:
            end = {
              x:
                this.start.x +
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
              y:
                this.start.y -
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
            };
            endStartX = end.x - this.start.x;
            endStartY = end.y - this.start.y;
            control = {
              x:
                this.start.x +
                endStartX * controlIndex +
                ((endStartY / 3) * controlIndexNum) / 2,
              y:
                this.start.y +
                endStartY * controlIndex +
                (endStartY / 3) * controlIndexNum,
            };
            control2 = {
              x:
                this.start.x +
                endStartX * controlIndex2 +
                (endStartY / 3) * (-controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex2 +
                (endStartY / 3) * -controlIndexNum,
            };
            deviation = {
              w: this.flowersWidth,
              h: this.flowersWidth,
            };
            break;
          case 2:
            end = {
              x:
                this.start.x +
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
              y:
                this.start.y +
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
            };
            endStartX = end.x - this.start.x;
            endStartY = end.y - this.start.y;
            control = {
              x:
                this.start.x +
                endStartX * controlIndex +
                (endStartY / 3) * (controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex +
                (endStartY / 3) * -controlIndexNum,
            };
            control2 = {
              x:
                this.start.x +
                endStartX * controlIndex2 +
                (endStartY / 3) * (-controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex2 +
                (endStartY / 3) * controlIndexNum,
            };
            deviation = {
              w: this.flowersWidth,
              h: -this.flowersWidth,
            };
            break;
          case 3:
            end = {
              x:
                this.start.x -
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
              y:
                this.start.y +
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
            };
            endStartX = end.x - this.start.x;
            endStartY = end.y - this.start.y;
            control = {
              x:
                this.start.x +
                endStartX * controlIndex +
                ((endStartY / 3) * controlIndexNum) / 2,
              y:
                this.start.y +
                endStartY * controlIndex +
                (endStartY / 3) * controlIndexNum,
            };
            control2 = {
              x:
                this.start.x +
                endStartX * controlIndex2 +
                (endStartY / 3) * (-controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex2 +
                (endStartY / 3) * -controlIndexNum,
            };
            deviation = {
              w: this.flowersWidth,
              h: this.flowersWidth,
            };
            break;
          case 4:
            end = {
              x:
                this.start.x -
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
              y:
                this.start.y -
                this.rand(
                  this.flowersHeight,
                  this.flowersHeight * flowersHeightIndex
                ),
            };
            endStartX = end.x - this.start.x;
            endStartY = end.y - this.start.y;
            control = {
              x:
                this.start.x +
                endStartX * controlIndex +
                (endStartY / 3) * (controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex +
                (endStartY / 3) * -controlIndexNum,
            };
            control2 = {
              x:
                this.start.x +
                endStartX * controlIndex2 +
                (endStartY / 3) * (-controlIndexNum / 2),
              y:
                this.start.y +
                endStartY * controlIndex2 +
                (endStartY / 3) * controlIndexNum,
            };
            deviation = {
              w: this.flowersWidth,
              h: -this.flowersWidth,
            };
            break;
        }
      }

      var obj = {
        start: {
          x: this.start.x,
          y: this.start.y,
          x2: this.start.x + deviation.w,
          y2: this.start.y + deviation.h,
        },
        control: {
          x: control.x,
          y: control.y,
          x2: control.x + deviation.w,
          y2: control.y + deviation.h,
        },
        end: {
          x: end.x,
          y: end.y,
          x2: end.x + deviation.w,
          y2: end.y + deviation.h,
        },
        deviation,
        color: this.flowersColor[i % this.flowersColor.length],
        step: {
          x: this.rand(
            -(this.start.x - this.flowersHeight) / this.animationFrequency,
            (this.canvas.width - this.start.x - this.flowersHeight) /
              this.animationFrequency
          ),
          y: this.rand(
            -(this.start.y - this.flowersHeight) / this.animationFrequency,
            -(this.start.y - this.canvas.height / 2 + this.flowersHeight) /
              this.animationFrequency
          ),
        },
        swingNum: this.rand(
          -(this.fallingSwingNum - 1) / 2,
          (this.fallingSwingNum - 1) / 2
        ), // 摇摆当前所在帧
        swing: this.fallingSwing, // 摇摆帧步长
        fallingDeg: opts.fallingDeg || this.rand(15, 30), // 彩带每帧旋转度数
        fallingRange:
          opts.fallingRange ||
          this.rand(this.flowersWidth / 2, this.flowersWidth), // 彩带每帧偏移
      };
      if (control2) {
        obj.control2 = {
          x: control2.x,
          y: control2.y,
          x2: control2.x + deviation.w,
          y2: control2.y + deviation.h,
        };
      }
      this.flowersArr.push(obj);
    }

    if (this.faceFlag) {
      this.faceData = {
        x: this.start.x,
        y: this.start.y,
        step: {
          x: this.rand(
            -(this.start.x - this.faceR * 2) / this.animationFrequency,
            (this.canvas.width - this.start.x - this.faceR * 2) /
              this.animationFrequency
          ),
          y: this.rand(
            -(this.start.y - this.faceR * 2) / this.animationFrequency,
            -(this.start.y - this.canvas.height / 2 + this.faceR * 2) /
              this.animationFrequency
          ),
        },
        swingNum: this.rand(
          -(this.fallingSwingNum - 1) / 2,
          (this.fallingSwingNum - 1) / 2
        ), // 摇摆当前所在帧
        swing: this.fallingSwing, // 摇摆帧步长
        fallingDeg: opts.fallingDeg || this.rand(15, 30), // 笑脸每帧旋转度数
        fallingRange:
          opts.fallingRange ||
          this.rand(this.flowersWidth / 2, this.flowersWidth), // 笑脸每帧偏移
        faceColor: opts.faceColor,
        eyeColor: opts.eyeColor,
        mouthColor: opts.mouthColor,
      };
    }
  };
  // 彩带上升运动数据处理
  ScatterFlowers.prototype.flowersArrMove = function () {
    this.flowersArr.forEach((item)=> {
      item.start = {
        x: item.start.x + item.step.x,
        y: item.start.y + item.step.y,
        x2: item.start.x2 + item.step.x,
        y2: item.start.y2 + item.step.y,
      };
      item.control = {
        x: item.control.x + item.step.x,
        y: item.control.y + item.step.y,
        x2: item.control.x2 + item.step.x,
        y2: item.control.y2 + item.step.y,
      };
      item.end = {
        x: item.end.x + item.step.x,
        y: item.end.y + item.step.y,
        x2: item.end.x2 + item.step.x,
        y2: item.end.y2 + item.step.y,
      };
      if (item.control2) {
        item.control2 = {
          x: item.control2.x + item.step.x,
          y: item.control2.y + item.step.y,
          x2: item.control2.x2 + item.step.x,
          y2: item.control2.y2 + item.step.y,
        };
      }
    });
  };
  // 笑脸上升运动数据处理
  ScatterFlowers.prototype.faceMove = function () {
    if (!this.faceFlag) {
      return;
    }
    this.faceData.x = this.faceData.x + this.faceData.step.x;
    this.faceData.y = this.faceData.y + this.faceData.step.y;
  };
  // 彩带飘落运动数据处理
  ScatterFlowers.prototype.flowersArrFalling = function () {
    var fallingHeight = this.canvas.height / 2 / this.fallingFrequency;
    this.flowersArr.forEach((item)=> {
      if (
        item.swingNum + item.swing > (this.fallingSwingNum - 1) / 2 ||
        item.swingNum + item.swing < -(this.fallingSwingNum - 1) / 2
      ) {
        item.swing = item.swing * -1;
      }
      item.swingNum += item.swing;

      item.start = {
        x: item.start.x,
        y: item.start.y + fallingHeight,
        x2: item.start.x2,
        y2: item.start.y2 + fallingHeight,
      };
      item.control = {
        x: item.control.x,
        y: item.control.y + fallingHeight,
        x2: item.control.x2,
        y2: item.control.y2 + fallingHeight,
      };
      item.end = {
        x: item.end.x,
        y: item.end.y + fallingHeight,
        x2: item.end.x2,
        y2: item.end.y2 + fallingHeight,
      };
      if (item.control2) {
        item.control2 = {
          x: item.control2.x,
          y: item.control2.y + fallingHeight,
          x2: item.control2.x2,
          y2: item.control2.y2 + fallingHeight,
        };
      }

      var color = [];
      item.color.forEach((colorItem)=> {
        var colorArr = colorItem.split("-");
        colorArr[1] = colorArr[1] - this.fallingFrequency / 100;
        color.push(colorArr.join("-"));
      });
      item.color = color;
    });
  };
  // 笑脸飘落运动数据处理
  ScatterFlowers.prototype.faceFalling = function () {
    if (!this.faceFlag) {
      return;
    }
    var fallingHeight = this.canvas.height / 2 / this.fallingFrequency;

    this.faceData.y = this.faceData.y + fallingHeight;

    if (
      this.faceData.swingNum + this.faceData.swing >
        (this.fallingSwingNum - 1) / 2 ||
      this.faceData.swingNum + this.faceData.swing <
        -(this.fallingSwingNum - 1) / 2
    ) {
      this.faceData.swing = this.faceData.swing * -1;
    }
    this.faceData.swingNum += this.faceData.swing;

    this.faceData.faceColor =
      this.faceData.faceColor.split("-")[0] +
      "-" +
      (this.faceData.faceColor.split("-")[1] - this.fallingFrequency / 100);
    this.faceData.eyeColor =
      this.faceData.eyeColor.split("-")[0] +
      "-" +
      (this.faceData.eyeColor.split("-")[1] - this.fallingFrequency / 100);
    this.faceData.mouthColor =
      this.faceData.mouthColor.split("-")[0] +
      "-" +
      (this.faceData.mouthColor.split("-")[1] - this.fallingFrequency / 100);
  };
  // 运动函数
  ScatterFlowers.prototype.run = function () {
    if (
      this.animationFrequencyEd > this.animationFrequency &&
      this.fallingFrequencyEd > this.fallingFrequency
    ) {
      this.cb && this.cb();
      this.clear();
      $("#scatterCanvas").removeClass("visible");
      return;
    }
    if (this.animationFrequencyEd > this.animationFrequency) {
      this.startAnimationFrame = 0;
      this.animationFrameFalling();
    } else {
      this.startAnimationFrame = 0;
      this.animationFrameMove();
    }
  };
  // 上升动画
  ScatterFlowers.prototype.animationFrameMove = function (timestamp) {
    if (!this.startAnimationFrame) {
      this.startAnimationFrame = timestamp;
    }
    if (timestamp - this.startAnimationFrame >= this.animationFrequencyTime) {
      this.startAnimationFrame = timestamp;
      this.animationFrequencyEd += 1;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawFlowers();
      this.drawFace();
      if (this.debugStartPoint) {
        this.drawStartPoint();
      }

      if (this.animationFrequencyEd <= this.animationFrequency) {
        this.faceMove();
        this.flowersArrMove();
      } else {
        window.cancelAnimationFrame(this.requestAnimationFrame);
        this.run();
        return;
      }
    }
    this.requestAnimationFrame = window.requestAnimationFrame(
      this.animationFrameMove.bind(this)
    );
  };
  // 飘落动画
  ScatterFlowers.prototype.animationFrameFalling = function (timestamp) {
    if (!this.startAnimationFrame) {
      this.startAnimationFrame = timestamp;
    }
    if (timestamp - this.startAnimationFrame >= this.fallingFrequencyTime) {
      this.startAnimationFrame = timestamp;
      this.fallingFrequencyEd += 1;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawFlowers();
      this.drawFace();
      if (this.debugStartPoint) {
        this.drawStartPoint();
      }

      if (this.fallingFrequencyEd <= this.fallingFrequency) {
        this.faceFalling();
        this.flowersArrFalling();
      } else {
        window.cancelAnimationFrame(this.requestAnimationFrame);
        this.run();
        return;
      }
    }
    this.requestAnimationFrame = window.requestAnimationFrame(
      this.animationFrameFalling.bind(this)
    );
  };
  // 随机数
  ScatterFlowers.prototype.rand = function (n, m) {
    var c = m - n + 1;
    return Math.floor(Math.random() * c + n);
  };
  // 清空canvas
  ScatterFlowers.prototype.clear = function () {
    if (this.requestAnimationFrame) {
      window.cancelAnimationFrame(this.requestAnimationFrame);
      this.requestAnimationFrame = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };
  // 绘制彩带
  ScatterFlowers.prototype.drawFlowers = function () {
    this.flowersArr.forEach((item)=> {
      this.ctx.save();
      this.ctx.beginPath();

      var grd = this.ctx.createLinearGradient(
        item.start.x,
        item.start.y,
        item.end.x2,
        item.end.y2
      );
      var grdColor = item.color;
      grdColor.forEach((colorItem)=> {
        grd.addColorStop(
          colorItem.split("-")[2] / 100,
          "rgba(" +
            colorItem.split("-")[0] +
            "," +
            colorItem.split("-")[1] / 100 +
            ")"
        );
      });
      this.ctx.fillStyle = grd;

      this.ctx.translate(
        (item.control.x + item.control.x2) / 2,
        (item.control.y + item.control.y2) / 2
      );
      this.ctx.rotate((item.fallingDeg * item.swingNum * Math.PI) / 180);
      this.ctx.translate(
        -(item.control.x + item.control.x2) / 2 +
          item.fallingRange * item.swingNum,
        -(item.control.y + item.control.y2) / 2
      );

      if (item.control2) {
        this.ctx.lineTo(item.start.x, item.start.y);
        this.ctx.bezierCurveTo(
          item.control.x,
          item.control.y,
          item.control2.x,
          item.control2.y,
          item.end.x,
          item.end.y
        );
        this.ctx.lineTo(item.end.x2, item.end.y2);
        this.ctx.bezierCurveTo(
          item.control2.x2,
          item.control2.y2,
          item.control.x2,
          item.control.y2,
          item.start.x2,
          item.start.y2
        );
        this.ctx.lineTo(item.start.x, item.start.y);
      } else {
        this.ctx.lineTo(item.start.x, item.start.y);
        this.ctx.quadraticCurveTo(
          item.control.x,
          item.control.y,
          item.end.x,
          item.end.y
        );
        this.ctx.lineTo(item.end.x2, item.end.y2);
        this.ctx.quadraticCurveTo(
          item.control.x2,
          item.control.y2,
          item.start.x2,
          item.start.y2
        );
        this.ctx.lineTo(item.start.x, item.start.y);
      }
      this.ctx.fill();

      this.ctx.closePath();
      this.ctx.restore();
    });
  };
  // 绘制笑脸
  ScatterFlowers.prototype.drawFace = function () {
    if (!this.faceFlag) {
      return;
    }
    this.ctx.save();

    this.ctx.translate(this.faceData.x, this.faceData.y);
    this.ctx.rotate(
      (this.faceData.fallingDeg * this.faceData.swingNum * Math.PI) / 180
    );
    this.ctx.translate(
      -this.faceData.x + this.faceData.fallingRange * this.faceData.swingNum,
      -this.faceData.y
    );

    this.ctx.beginPath();
    this.ctx.fillStyle =
      "rgba(" +
      this.faceData.faceColor.split("-")[0] +
      "," +
      this.faceData.faceColor.split("-")[1] / 100 +
      ")";
    this.ctx.arc(this.faceData.x, this.faceData.y, this.faceR, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.fillStyle =
      "rgba(" +
      this.faceData.eyeColor.split("-")[0] +
      "," +
      this.faceData.eyeColor.split("-")[1] / 100 +
      ")";
    this.ctx.arc(
      this.faceData.x - this.faceR / 3,
      this.faceData.y - this.faceR / 3,
      this.eyeR,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.fillStyle =
      "rgba(" +
      this.faceData.eyeColor.split("-")[0] +
      "," +
      this.faceData.eyeColor.split("-")[1] / 100 +
      ")";
    this.ctx.arc(
      this.faceData.x + this.faceR / 3,
      this.faceData.y - this.faceR / 3,
      this.eyeR,
      0,
      2 * Math.PI
    );
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.beginPath();
    this.ctx.fillStyle =
      "rgba(" +
      this.faceData.mouthColor.split("-")[0] +
      "," +
      this.faceData.mouthColor.split("-")[1] / 100 +
      ")";
    this.ctx.arc(this.faceData.x, this.faceData.y, this.mouthR, 0, Math.PI);
    this.ctx.fill();
    this.ctx.closePath();

    this.ctx.restore();
  };
  // 起始点调试
  ScatterFlowers.prototype.drawStartPoint = function () {
    this.ctx.save();
    this.ctx.beginPath();

    this.ctx.fillStyle = "rgba(0,255,0)";
    this.ctx.arc(
      this.start.x,
      this.start.y,
      ((4 * window.rem) / 75) * window.dpr,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    this.ctx.closePath();
    this.ctx.restore();
  };

  // window.scatterFlowers = new ScatterFlowers({
  //   canvas: document.getElementById("scatterCanvas"),
  //   flowersColor: [
  //     ["250,174,255-60-11", "244,150,255-80-63", "247,197,255-100-100"],
  //     ["255,255,255-80-25", "255,169,108-100-100"],
  //     ["195,255,176-80-0", "69,197,117-100-100"],
  //     ["79,213,255-80-0", "43,187,250-100-100"],
  //   ],
  //   faceColor: "255,200,44-100", // 笑脸颜色
  //   eyeColor: "76,64,65-100", // 眼睛颜色
  //   mouthColor: "255,109,64-100", // 笑嘴颜色
  //   flowersLength: 50,
  //   autoStart: false,
  // });
  initScatterFlowers();

  $("#runFlower").click(function () {
    window.scatterFlowers.reStart();
  });
}

function initScatterFlowers() {
  window.scatterFlowers = new window._ScatterFlowers({
    canvas: document.getElementById("scatterCanvas"),
    flowersColor: [
      ["250,174,255-60-11", "244,150,255-80-63", "247,197,255-100-100"],
      ["255,255,255-80-25", "255,169,108-100-100"],
      ["195,255,176-80-0", "69,197,117-100-100"],
      ["79,213,255-80-0", "43,187,250-100-100"],
    ],
    faceColor: "255,200,44-100", // 笑脸颜色
    eyeColor: "76,64,65-100", // 眼睛颜色
    mouthColor: "255,109,64-100", // 笑嘴颜色
    flowersLength: 50,
    autoStart: false,
  });
}

$(".share-link-btn.after-share").click(function () {
  shareCopy();
  showMessage("Copy link successfully", "success");
  nativeSensors("aiNativeShare", { source: "afterGenerate" });
});

$(".free-limit-modal .share-link-btn").click(function () {
  var native_id = window.native_id || getActiveType().templates[0].id;
  var userInfo = getCookie("EDCurrent");
  var _userInfo = JSON.parse(userInfo);
  var user_id = _userInfo.user_id;
  var url = `${location.href}${
    location.href.indexOf("?") > -1 ? "&" : "?"
  }needShareGive=true*nativeId=${native_id}*sharerId=${user_id}`;
  copyStr(url);
  showMessage("Copy link successfully", "success");
  nativeSensors("aiNativeShare", { source: "beforeGenerate" });
});

function shareCopy() {
  var mode = getActiveType().mode;
  var name =
    getActiveType().name === "Random Type"
      ? window.nativeGenerateMode || "Random Type"
      : getActiveType().name;
  var shareMode = mode === "native" ? window.nativeGenerateMode || mode : mode;
  var nativeId = window.native_id || getActiveType().templates[0].id;
  var copyLink = `${location.href}${
    location.href.indexOf("?") > -1 ? "&" : "?"
  }from=share&nativeId=${nativeId}&mode=${shareMode}&typeName=${name.toLowerCase()}`
  var file = $("#fileInput")[0]?$("#fileInput")[0].files[0]:''
  if((mode == "infographic" || mode === "poster")&& !$("#diagram-topic").val() && (file || $(".website-input input").val())){
    copyLink = copyLink + `&shareName=${$(".website-input input").val() || (file?(file.name):'upload file') }`
  }
  copyStr(copyLink);
}

function shareGenerate(native_id, sharer_id) {
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    token = _userInfo.token;
  }

  // var native_id = window.native_id || getActiveType().templates[0].id;

  $.ajax({
    type: "post",
    url: `https://${window.nativeBaseUrl}/api/ai/act/share`,
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      native_id,
      sharer_id,
    }),
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (res) {
      var code = res.code;
      if (code === 0) {
        // shareCopy();
        // showMessage("Copy link successfully", "success");
      } else {
        showMessage(res.msg);
      }
    },
    error: function (err) {
      var data = err.responseJSON;
      showMessage(data.msg);
    },
    fail: function (res) {
      showMessage(res.msg);
    },
  });
}

function createEchart(echartData, isShare) {
  $("#operationSection .ai-preview").html(
    `<div id="echart-preview" style="width: 90%;height: ${
      isMobileDevice() ? "70" : "90"
    }%;margin: auto" ></div>`
  );
  $("#operationSection .ai-preview").show();
  $("#operationSection .ai-preview").css("opacity", "0");

  var myChart = echarts.init(document.getElementById("echart-preview"));
  window.aiEchart = myChart;
  // 指定图表的配置项和数据
  var option = {};
  try {
    option = analyzeJsonContent(echartData,isShare);
    // option = JSON.parse(echartData)
  } catch {
    generateFailed();
    return;
  }

  myChart.on("finished", function () {
    var canvas = myChart.getRenderedCanvas({
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
    var imgUrl = canvas.toDataURL("image/png");
    $("#downloadModal .ai-img").attr("src", imgUrl);
    $(".download-watermark-container .ai-img").attr("src", imgUrl);
    $("#operationSection .ai-preview").css("opacity", "1");
    $("#echart-preview >div").css("margin", "auto");
  });

  // 使用刚指定的配置项和数据显示图表。
  myChart.setOption(option);

  setTimeout(function () {
    if (!isShare) {
      generateSuccess();
    }
    // myChart.on("finished", function () {
    //   var canvas = myChart.getRenderedCanvas({
    //     pixelRatio: 2,
    //     backgroundColor: "#fff",
    //   });
    //   var imgUrl = canvas.toDataURL("image/png");
    //   $("#downloadModal .ai-img").attr("src", imgUrl);
    //   $(".download-watermark-container .ai-img").attr("src", imgUrl);
    //   $("#operationSection .ai-preview").css("opacity", "1");
    // });
  }, 0);
}

function goOnlineEdit(native_id, mode, generateText, ai4text) {
  var type = "pre_edit";
  var file_id = native_id;
  var echart_id = native_id;
  var ai4type = mode;
  // var domain = "https://www.edrawmax.com/online/app.html?";
  var domain = "https://www.edrawmax.com/online/app.html?";
  if (testHost.indexOf(location.hostname) > -1) {
    domain = "https://dev.edrawmax.com/online/app.html?";
    // domain = "http://10.90.135.140:8081/app.html?";
  } else {
    domain = "https://www.edrawmax.com/online/app.html?";
  }
  var url = `type=${type}&file_id=${file_id}&ai4type=${ai4type}&ai4text=${ai4text}`;
  if (mode.indexOf("echart") > -1 && generateText !== "Generate For Free") {
    type = "create_echart";
    url = `type=${type}&echart_id=${echart_id}&ai4type=${ai4type}&ai4text=${ai4text}`;
  }

  // var result =
  //   domain +
  //   btoa(pako.deflateRaw(encodeURIComponent(url), { level: 6, to: "string" }));
  // openLink(result);

  var edrawAiBaseUrl = 'www.edraw.ai'
  if(testHost.indexOf(location.hostname) > -1){
    edrawAiBaseUrl = 'dev-en.edraw.ai';
    if(location.hostname==='10.90.135.140'){
      edrawAiBaseUrl = '10.90.135.140:5001'
      // edrawAiBaseUrl =  'dev-en.edraw.ai'
    }
  }
  

  var isEchart = mode.indexOf("echart") > -1 && generateText !== "Generate For Free"
  var edrawAiUrl = `http://${edrawAiBaseUrl}/app/aitool/diagram?from=native&native_id=${native_id}&isEchart=${isEchart}&utm_source=google&utm_medium=referral&utm_campaign=ai-native&isEdrawAiNative=${true}`
  var userInfo = getCookie("EDCurrent");

  if(userInfo){
    var _userInfo = JSON.parse(userInfo);
    var custom = {
      user_id: _userInfo.user_id || '',
      token: _userInfo.token,
      avatar_url: _userInfo.avatar_url,
      user_name: _userInfo.user_name
    }
    edrawAiUrl = `${edrawAiUrl}&custom=${window.btoa(JSON.stringify(custom))}`
  }


  if(generateText === "Generate For Free" && mode !== "infographic" && mode  !== "poster"){
    openLink(edrawAiUrl);
  } else {
    var url = isEchart?`https://${window.nativeBaseUrl}/api/ai/v1/completions/native/asst?native_id=${native_id}`:`https://${window.nativeBaseUrl}/api/ai/v1/completions/native/url?native_id=${native_id}`;
    $.ajax({
      type: "get",
      url: url,
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        var code = res.code;
        if (code === 0) {
          if(!isEchart){
            edrawAiUrl = edrawAiUrl+`&file_link=${res.data.file_link}`
          }
          openLink(edrawAiUrl);
        } 
      }
    });
  }

}

function checkShare() {
  var urlParam = getUrlParams();
  if (urlParam.from && urlParam.from === "share") {
    if (window.previewSwiper) {
      window.previewSwiper.destroy(true, true);
    }

    var isInfoPoster = urlParam.mode === "infographic" || urlParam.mode  === "poster"

    $("#topSection").addClass("shareTopSection");
    $("#operationSection").addClass("shareOperation");
    $(".shareOperation .right-form").hide();
    $(".shareOperation .share-section").show();
    if(isInfoPoster){
      $(".operationSectionB.shareOperation .swiper-wrapper").addClass("scroll-slide-wrapper")
    }

    if (urlParam.typeName === "mindmap-md") {
      urlParam.typeName = "mind map";
    }
    $("#operationSection .share-tip .mode").text(urlParam.typeName);

    $("#previewTooltip").hide();
    if (!isMobileDevice()) {
      $("#operationSection .top-bar .edit-btn").hide();
    }
    $("#operationSection .swiper-wrapper.preview-content").css("width", "100%");

    var isEchart = urlParam.mode.indexOf("echart") > -1;
    var url = `https://${window.nativeBaseUrl}/api/ai/${
      !isEchart ? "v1/completions/native/url" : "/v1/completions/native/asst"
    }?native_id=${urlParam.nativeId}`;
    $.ajax({
      type: "get",
      url: url,
      contentType: "application/json",
      dataType: "json",
      success: function (res) {
        var code = res.code;
        if (code === 0) {
          $("#operationSection .share-section .share-title").text(
            urlParam.shareName || res.data.prompt
          );
          $("#operationSection .share-section .share-title").attr(
            "title",
            urlParam.shareName || res.data.prompt
          );
          if (isEchart) {
            $("#operationSection .swiper-wrapper.preview-content").hide();

            createEchart(res.data.content, true);
          } else {
            var imgUrl = res.data.img_link;
            window.aiPreviewImg = imgUrl;
           
            $("#operationSection .swiper-wrapper.preview-content")
              .html("")
              .append(
                isInfoPoster?`<div class="img-box"><img style="max-width:95%;max-height:95%;margin:auto" src='${imgUrl}'/></div>`:`<img style="max-width:95%;max-height:95%;margin:auto" src='${imgUrl}'/>`
              );
            $("#downloadModal .ai-img").attr("src", imgUrl);
            $(".download-watermark-container .ai-img").attr("src", imgUrl);
          }

          $(".shareOperation .share-btn.edit-btn").click(function () {
            goOnlineEdit(
              getUrlParams().nativeId,
              getUrlParams().mode,
              null,
              res.data.prompt
            );
          });
        } else {
          // generateFailed();
          showMessage(res.msg);
        }
        $("#topSection").css("opacity", "1");
        $("#operationSection").css("opacity", "1");
      },
      error: function () {
        var data = err.responseJSON;
        showMessage(data.msg);
      },
      fail: function (res) {
        showMessage(res.msg);
      },
    });

    $(".shareOperation .share-btn.download").click(function () {
      if (validateLogin("downloadNeeded")) {
        getIsPro("download");
      }
    });

    if (isMobileDevice()) {
      // $("#community").css("margin-top", "120px");
      $(".share-tip span:first-child").text("Generated with");
    }
    $(".share-generate-btn").click(function () {
      var url = new URL(location.href);
      url.searchParams.delete("from");
      // url.searchParams.delete("nativeId");
      url.searchParams.delete("mode");
      // url.searchParams.set('needShareGive', 'true');
      nativeSensors("aiNativeTryItYourSelf");
      window.location.href = url;
    });
  } else {
    $("#topSection").css("opacity", "1");
    $("#operationSection").css("opacity", "1");
  }
}

// 1.2 新增
$("#moreDiagram .more-diagram-item .item-a").click(function (e) {
  e.preventDefault();
  var href = $(this).attr("href");
  if (href.indexOf("?") > -1) {
    href = href.split("?")[0];
  }
  openLink(href);
});

$(".diagram-child a.scroll-to-more-diagram").click(function () {
  var topNum = isMobileDevice() ? 180 : 80;
  $("html, body").animate(
    { scrollTop: $($(this).attr("href")).offset().top - topNum + "px" },
    500
  );
  return false;
});

$("#tryFreeTipModal .online-recommend .link").click(function () {
  openLink("https://www.edraw.ai/app/aitool/diagram");
});

$("#tryFreeTipModal .try-free").click(function () {
  $("#tryFreeTipModal").modal("hide");
  $("#startFreeModal").modal("show");
  // myLazyLoad.update();
});

$("#tryFreeTipModal .download-image").click(function () {
  downloadWatermarkImg();
});

$("#tryFreeTipModal").on("show.bs.modal", function () {
  // 在这里，你可以执行你想要在模态框显示时进行的操作
  setTimeout(function() {
    setCanvasSize();
    // setDownloadCanvasSize();
  }, 0);
});

$("#startFreeModal .plan-item").click(function () {
  $("#startFreeModal .plan-item").removeClass("active");
  $(this).addClass("active");
  // myLazyLoad.update();
});

$("#startFreeModal .upgrade").click(function () {
  openLink("https://www.edraw.ai/pricing.html");
});

$("#startFreeModal .next").click(function () {
  var items = $("#startFreeModal .plan-item ");
  var activeIndex = items.index(items.filter(".active"));
  var arr = [
    "https://store.edrawsoft.com/index.php?submod=checkout&method=index&activity_id=1675452290419658769&cy=USD&language=en_us&sku_id=24201011&ver=v5&verify=BAA5C3BCD991A4591DDF0E6CFEFB798A&url_ab_testing=eyJ0eXBlIjoidXJsX2FiX3Rlc3RpbmciLCJ2YWx1ZSI6IjE2Nzc1OTI4NzA0NjEzNzQ1MjdfQyJ9",
    "https://store.edrawsoft.com/index.php?submod=checkout&method=index&activity_id=1675452091731292223&cy=USD&language=en_us&sku_id=24201010&ver=v5&verify=94BAE1F938AD02EB495DAC4692A8567B&url_ab_testing=eyJ0eXBlIjoidXJsX2FiX3Rlc3RpbmciLCJ2YWx1ZSI6IjE2Nzc1OTI4NzA0NjEzNzQ1MjdfQyJ9",
  ];
  openLink(arr[activeIndex]);
  var _arr = ["annualBasicPlan", "monthlyBasicPlan"];
  nativeSensors("aiNativeToShoppingChart", {
    plan: _arr[activeIndex],
    source: window.toChartSource,
  });
});

$("#startFreeModal .info-title img.lazy").click(function () {
  $("#startFreeModal").modal("hide");
  $("#tryFreeTipModal").modal("show");
  // myLazyLoad.update();
});

$(".free-limit-modal .free-limit-modal-close").click(function () {
  $(".free-limit-modal").hide();
});

function checkLimitNum() {
  if (
    location.hostname === "localhost" ||
    location.hostname === "10.90.135.140"
  ) {
  } else {
    var userInfo = getCookie("EDCurrent");
    var _userInfo = JSON.parse(userInfo);
    token = _userInfo.token;
  }
  $.ajax({
    type: "get",
    url: `https://${window.nativeBaseUrl}/api/ai/act/asset?platform=web`,
    contentType: "application/json",
    dataType: "json",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (res) {
      var code = res.code;
      if (code === 0) {
        if (
          !res.data.is_subs &&
          !res.data.is_template_subs &&
          res.data.today_remg_free_times >= 0 &&
          res.data.today_remg_free_times <= 2
        ) {
          window.almostUsedUp = true;
          $(".free-limit-modal .free-limit-modal-close").css("display", "flex");
          $(".free-limit-modal .first-limit-tip").text(
            `${
              res.data.today_all_free_times - res.data.today_remg_free_times
            } of ${res.data.today_all_free_times} trials has been used today.`
          );
          $(".free-limit-modal").show();
          nativeSensors("aiNativeGenerateFinish", {
            result: "upgradeNeededSoon",
          });
        } else {
          $(".free-limit-modal .free-limit-modal-close").css("display", "none");
          $(".free-limit-modal .first-limit-tip").text(
            `The usage limit for today has been exceeded.`
          );
          window.almostUsedUp = false;
        }
      } else {
        window.almostUsedUp = false;
        return;
      }
    },
    error: function (err) {
      window.almostUsedUp = false;
    },
    fail: function () {
      window.almostUsedUp = false;
    },
  });
}

function previewImgs(urls) {
  urls.map(function (url) {
    if(!url) return
    var img = new Image();
    img.src = url;
  });
}

$(".upload-file-btn-main").click(function () {
  $("#fileInput").click();
});

$("#fileInput").on("change", function () {
  $(".upload-website").hide();
  var file = $(this)[0].files[0];
  // animateProgress(".upload-file", "uploadFileTimer")
  // $(".upload-file-wrapper").removeClass("show-website-input");
  $(".website-input").hide();
  $(".upload-website .close").hide();
  $(".website-input input").val("");
  $(".upload-file-btn .file-name").hide();
  if(file){
    $(".upload-file-wrapper").css('flex',1);
    $(".upload-file-wrapper").css('width', `calc(100% - ${$('.info-change-btn').width()+20}px)`);
    $(".right-form .font-number .input-number").removeClass("red");
    $(".generate-btn").removeClass("disabled");
    $("#diagram-topic").attr("placeholder",`Edraw.AI will transform your file content into a stunning ${getActiveType().mode} : )`)
  } else {
    if(!$(".website-input input").val()){
      $(".right-form .font-number .input-number").text(0);
      $(".generate-btn").addClass("disabled");
      $(".right-form .font-number .input-number").addClass("red");
    }
  }

  animateProgress(".upload-file-wrapper", "uploadFileTimer", 80);
  $(".upload-file-btn .close").show();
  var time = 0;
  window.intervalTime = setInterval( function() {
    time++;
    if (file && time >= 2) {
      clearInterval(window.intervalTime);
      hideProgress(".upload-file-wrapper", "uploadFileTimer");
      $(".upload-file-btn .file-name").text(file.name);
      $(".upload-file-btn .file-name").attr('title',file.name);
      $(".upload-file-btn .file-name").show();
      $(".upload-file-btn .file-name").addClass("upload-file-name");
      $(".upload-file-btn-main").css("width", "calc(100% - 20px)");
      $(".upload-file-btn .close").show();
      $(".website-label").show();
    }
  }, 1000);
});

$(".upload-file-btn .close").click(function (e) {
  e.stopPropagation();
  clearWebsite();
  clearInterval(window.intervalTime);
  $(".upload-file-btn .file-name").show()
  $("#diagram-topic").removeAttr("placeholder");
  $(".upload-file-wrapper").css('flex','unset');
  $(".upload-file-wrapper").css('width', 'unset');
  if(!$("#diagram-topic").val()){
    $(".right-form .font-number .input-number").text(0);
    $(".generate-btn").addClass("disabled");
    $(".right-form .font-number .input-number").addClass("red");
  }
});

function clearWebsite() {
  $("#fileInput").val("");
  $(".upload-file-btn .file-name").text("Upload File");
  $(".upload-file-btn .close").hide();
  $(".upload-file-btn-main").css("width", "100%");
  $(".upload-website").show();
  $(".upload-file-btn .file-name").removeClass("upload-file-name");
}

$(".upload-website").click(function (e) {
  e.stopPropagation();
  $("#fileInput").val("");
  $(".upload-file-wrapper").hide();
  $(".website-label").hide();
  $(".website-input").show();
  $(".upload-website").css('flex',1);
  $(".website-input").css("flex",1)
  $(".website-input input").focus();
  $(".upload-website .close").show();
});

$(document).click(function(){
  if($(".website-input").css('display')==='block' && !$(".website-input input").val() ){
    $(".upload-website .close").click()
  }
})


$(".upload-website .close").click(function (e) {
  e.stopPropagation();
  $(".website-input").hide();
  $(".upload-website").css('flex','unset');
  $(".upload-website .close").hide();
  $(".website-input").css("flex",'unset')
  $(".upload-file-wrapper").show();
  $(".website-label").show();
  $(".website-input input").val("");
  $("#diagram-topic").removeAttr("placeholder");
  if(!$("#diagram-topic").val()){
    $(".right-form .font-number .input-number").text(0);
    $(".generate-btn").addClass("disabled");
    $(".right-form .font-number .input-number").addClass("red");
  }
});

$(".website-input input").on("input", function () {
  if($(".website-input input").val()){
    $(".right-form .font-number .input-number").removeClass("red");
    $(".generate-btn").removeClass("disabled");
    type = getActiveType().mode 
    $("#diagram-topic").attr("placeholder",`Edraw.AI will transform your website content into a stunning ${getActiveType().mode} : )`)
  } else {
    var file = $("#fileInput")[0].files[0];
    if(!file){
      $(".right-form .font-number .input-number").text(0);
      $(".generate-btn").addClass("disabled");
      $(".right-form .font-number .input-number").addClass("red");
    }
  }
})

$(".design-format .design-item").click(function () {
  if ($(this).hasClass("disabled")) {
    return;
  }
  $(".design-format .design-item").removeClass("active");
  $(this).addClass("active");
  var topics = [
    [
      "Modern technology's emerging trend, and its impact on society.",
      "The rise of electric vehicles.",
      "Music festivals around the world."
    ],
    [
      "The importance of environmental sustainability for the future.",
      "Strategies for effective online education.",
      "The future of remote work."
    ],
    [
      "Key trends in digital transformation and innovation.",
      "Recent breakthroughs in space exploration.",
      "Smart home technologies and privacy.",
    ],
    [
      "5 essentials of a healthy lifestyle.",
      "Emerging trends in global cuisine.",
      "The renaissance of board games."
    ]
  ]

  var _items = $(".second-form-item .design-format .design-item ");
  var activeIndex = _items.index(_items.filter(".active"));
  var secondNum = getActiveType().mode == 'infographic'?3:4
  items[0][secondNum].topic = topics[activeIndex];
  changeTopic();
});


$(".website-input input").focus(function () {
  $(this).select();
});

$("#operationSection .swiper-wrapper.preview-content").scroll(function(){
  var scrollTop = $(this).scrollTop()
  if(window.isAiPreview || getUrlParams().from === 'share'){
    return
  }
  if(scrollTop===0){
    $('#previewTooltip').show()
  } else {
    $('#previewTooltip').hide()
  }
})

function initForallSwiper(){
  var forallContent = new Swiper ('#forallContent', {
    direction: 'horizontal',
    effect: 'fade',
    loop: true,
    autoplay: {
      delay: 3000,
      stopOnLastSlide: false,
      disableOnInteraction: true,
    },
    on:{
      slideChange: function(){
        $('.forall-nav-item').eq(this.realIndex).addClass('active').siblings().removeClass('active')
      },
    },
  })
  $('.forall-nav-item').on('click', function(){
    $(this).addClass('active').siblings().removeClass('active')
    forallContent.slideToLoop($(this).index())
  })
}

