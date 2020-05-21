// page/sales/sales.js
var wxCharts = require('../../utils/wxcharts-min');
var request = require('../../utils/requestServer');
var app = getApp();
var columnChart = null;
var lineChart=null;
Page({
  data: {
    shopId:-1,
    nowtab: '总体统计',
    nowCondition: 'best',
    nowPeriod: 0,
    goodsList: [],
    classify: [],
    goods: [],
    goodIndex: 0,
    classifyIndex: 0,
    //模拟数据
    //总体销售额
    overallSale:{},
    perWeek:{},
    perMonth: {},
    //优差查询
    bestFive: {},
    worstThree: {},
    //查询条件
    fSalesCount:true,//默认按销量
    tSalesCount: true,//默认按销量
    //单菜查询
    singleFoodSale: {},
    singleFoodWeek: {}, 
    singleFoodMonth:{},
    timePeriod: [
      { id: 0, periodName: '今日' },
      { id: 1, periodName: '本周' },
      { id: 2, periodName: '近一个月' },
      { id: 3, periodName: '近六个月' }
    ],
    index: 0,
    bestSaleStatus:0,//默认为前五按销量(0销量1销售额)
    worstSaleStatus: 2,//默认为末三按销量(2销量3销售额)
    bnodata:false,
    wnodata: false,
    nozerodata:false,//默认米有销量为0的菜品
    zeroSaleGood:{},
  },

  onLoad: function (options) {
    this.setData({
      shopId:wx.getStorageSync('s_id'),
      coin:wx.getStorageSync('s_coin'),
    });
    console.log(this.data.shopId);
    //获取总体统计
    this.getGlobalStatistic(this.data.shopId);
    this.getPerWeekSaleMoney(this.data.shopId);
    this.getPerMonthSaleMoney(this.data.shopId);
  },
  onReady: function () {
  },
  switchTabs: function (el) {
    if (el.currentTarget.dataset.nowtab == '总体统计') {
      this.paintMonthTotalChart(); 
      this.paintWeekTotalChart();
    }
    if (el.currentTarget.dataset.nowtab == '优差查询') {
      this.searchBestSale();
      this.searchWorstSale();
      this.serchZeroSale();//查询销量为0的菜品及销量
    }
    if (el.currentTarget.dataset.nowtab == '单菜查询') {
      console.log(app.globalData.goodsList);
      this.getGoods();
      // this.submitSearch();
    }
    this.setData({
      nowtab: el.currentTarget.dataset.nowtab
    })
  },
  //总体统计 今日 本周 本月
  getGlobalStatistic:function(shopId){
    var that=this;
    var url = '/Wxstatistic/getGlobalStatistic?s_id=' + shopId;
      request.sendRequest(url, 'GET', {}, {}).then(function(res){
        console.log(res.data);
        that.setData({
          overallSale:res.data
        });
        //console.log(that.data.overallSale);
      },function(error){
        console.log(error);
      });
  },
  //近一周销售额
  getPerWeekSaleMoney:function(shopId){
    var that = this;
    var url = '/Wxstatistic/getPerWeekSaleMoney?s_id=' + shopId;
    request.sendRequest(url, 'GET', {}, {}).then(function (res) {
      console.log(res.data);
      that.setData({ 
        perWeek:res.data
      });
      that.paintWeekTotalChart();
      console.log(that.data.perWeek);
    }, function (error) {
      console.log(error);
    });

  },
  //近六个月销售额
  getPerMonthSaleMoney: function (shopId) {
    var that = this;
    var url = '/Wxstatistic/getPerMonthSaleMoney?s_id=' + shopId;
    request.sendRequest(url, 'GET', {}, {}).then(function (res) {
      console.log(res.data.data);
        that.setData({
          perMonth: res.data
        });
        that.paintMonthTotalChart();
      console.log(that.data.perMonth);
    }, function (error) {
      console.log(error);
    });
  },
  //总体统计
  paintWeekTotalChart: function () {
    columnChart = new wxCharts({
      canvasId: 'weekcolumnCanvas',
      type: 'column',
      animation: true,
      categories: this.data.perWeek.categories,
      series: [{
        name: '销售额',
        data: this.data.perWeek.data,
        // format: function (val, name) {
        //   return val.toFixed(2);
        // }
      }],
      yAxis: {
        format: function (val) {
          return val;
        },
        title: '销售总额',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: 350,
      height: 200,
    });
  },
  paintMonthTotalChart:function(){
    columnChart = new wxCharts({
      canvasId: 'monthcolumnCanvas',
      type: 'column',
      animation: true,
      categories: this.data.perMonth.categories,
      series: [{
        name: '销售额',
        data: this.data.perMonth.data,
        // format: function (val, name) {
        //   return val.toFixed(2);
        // }
      }],
      yAxis: {
        format: function (val) {
          return val;
        },
        title: '销售总额',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 20
        }
      },
      width: 350,
      height: 200,
    });
  },
  //优差查询选完时间段
  bindPickerChange: function (e) {
    console.log('hihihi');
    console.log('picker发送选择改变，携带值为', e.detail.value)
    var nowPeriodId = this.data.timePeriod[this.data.index].id;
    console.log(nowPeriodId);
    this.data.nowPeriod=nowPeriodId;
    this.setData({
      index: e.detail.value
    })
    this.searchBestSale();
    this.searchWorstSale();
    this.serchZeroSale();
    //console.log(this.data.timePeriod[this.data.index].id);
  },

  //最佳查询
  searchBestSale: function () {
    console.log(this.data.shopId);
    console.log(this.data.index);
    console.log(this.data.bestSaleStatus);
    var that = this;
    var url = '/Wxstatistic/getBwSale?s_id=' + this.data.shopId + '&period_id=' + this.data.index + '&saleStatus=' + this.data.bestSaleStatus;
    request.sendRequest(url, 'GET', {}, {}).then(function (res) {
      console.log('获取数据了么？'+res.data.data.length);
      if(res.data.data.lenght!=0){
        console.log(res.data.data);
        //如果有一个不为零，则绘制
        for(var i=0;i<res.data.data.length;i++){
          if(res.data.data[i]!="0.00"){
            that.setData({
              bestFive: res.data,
              bnodata: false
            });
            that.paintBestSale();
            break;
          }else{
            that.setData({
              bnodata: true
            });
          }
        }
        console.log(that.data.bnodata);
      }else{
        that.setData({
          bnodata: true
        });
        console.log(that.data.bnodata);
      }
    }, function (error) {
      console.log(error);
    });
  },
  //最差查询
  searchWorstSale: function () {
    console.log(this.data.shopId);
    console.log(this.data.index);
    console.log(this.data.worstSaleStatus);
    var that=this;
    var url = '/Wxstatistic/getBwSale?s_id=' + this.data.shopId + '&period_id=' + this.data.index + '&saleStatus=' + this.data.worstSaleStatus;
    request.sendRequest(url, 'GET', {}, {}).then(function (res) {
      console.log('获取数据了么？：'+res.data.data.length);
      if(res.data.data.length!=0){
        that.setData({
          worstThree: res.data, 
          wnodata: false
        });
        that.paintWorstSale();
      }else{
        that.setData({
          wnodata:true
        });
      }
     
    }, function (error) {
      console.log(error);
    });
  },

//切换的触发事件
  //前五 按销量
  fSaleCount: function (){
    this.setData({
      fSalesCount: true,
      bestSaleStatus:0
    });
    this.searchBestSale();
  },
  //前五 按销售额
  fSaleMoney: function () {
    this.setData({
      fSalesCount: false,
      bestSaleStatus: 1
    });
    this.searchBestSale();
  },
  //末三 按销量
  tSaleCount: function () {
    this.setData({
      tSalesCount: true,
      worstSaleStatus: 2
    });
    this.searchWorstSale();
  },
  //末三 按销售额
  tSaleMoney: function () {
    this.setData({
      tSalesCount: false,
      worstSaleStatus: 3
    });
    this.searchWorstSale();
  },





  //绘制销量前五菜品：按销量
  paintBestSale: function () {
    //默认是今日最佳
    var unit = this.data.bestFive.unit;
    var status = this.data.bestFive.status;
    columnChart = new wxCharts({
      canvasId: 'bestFiveColumnCanvas',
      type: 'column',
      animation: false,
      categories: this.data.bestFive.categories,
      series: [{
        name: this.data.bestFive.title,
        data: this.data.bestFive.data,
      }],
      yAxis: {
        format: function (val) {
          return val + unit;
        },
        title: status,
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 20
        }
      },
      width: 350,
      height: 200,
    });
  },
  
  //绘制销售末三：按销量
  paintWorstSale: function (nowPeriod) {
    var unit = this.data.worstThree.unit;
    var status = this.data.worstThree.status;
    columnChart = new wxCharts({
      canvasId: 'WorstThreeColumnCanvas',
      type: 'column',
      animation: false,
      categories: this.data.worstThree.categories,
      series: [{
        name: this.data.worstThree.title,
        data: this.data.worstThree.data,
        color: '#f87f27'
      }],
      yAxis: {
        format: function (val) {
          return val + unit;
        },
        title: status,
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 20
        }
      },
      width: 350,
      height: 200,
    });
  },
  //单菜查询
  getGoods: function () {
    var that = this;
    if (app.globalData.goodsList) {
      console.log(app.globalData.goodsList);
      that.setData({
        goodsList: app.globalData.goodsList
      });
      that.linkageForm();
      that.submitSearch();
    }
    else {
      var url = '/Wxorder/getGoods?s_id=' + wx.getStorageSync('s_id');
      request.sendRequest(url, 'GET', {}, {})
        .then(function (res) {
          // app.globalData.goodsList = res.data;
          that.setData({
            goodsList: res.data[0]
          });
          console.log(that.data.goodsList);
          that.linkageForm();
          that.submitSearch();
        }, function (error) {
          console.log(error);
        });
    }
  },
  serchZeroSale:function(){
    var that=this;
    var url = '/Wxstatistic/getZeroSale?s_id=' + wx.getStorageSync('s_id');
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        if(res.data==1){
          that.setData({
            nozerodata: true
          });
        }
        else{
        that.setData({
          zeroSaleGood: res.data
        });
        console.log(that.data.zeroSaleGood);
        }
        // if (that.data.zeroSaleGood!={}){
        //   //列表展示
        //   that.showZeroSaleGood();
        // }
      }, function (error) {
        console.log(error);
      });
    // var zeroSaleGood= [
    //   { 'g_id': 18, 'g_name':'酸菜鱼','gt_name':'鱼类'},
    //   { 'g_id': 1, 'g_name': '番茄鱼', 'gt_name': '鱼类'},
    //   { 'g_id': 21, 'g_name': '酸辣汤', 'gt_name': '汤类'},
    //   { 'g_id': 22, 'g_name': '番茄汤', 'gt_name': '汤类' }
    // ];
    // that.setData({
    //   zeroSaleGood: zeroSaleGood
    // });
  },
  showZeroSaleGood:function(){
    console.log(this.data.zeroSaleGood);
  },

  //形成二级联动
  linkageForm: function () {
    console.log(this.data.goodsList);
    console.log(this.data.classifyIndex);
    var goodsArray = this.data.goodsList[this.data.classifyIndex].goods;
    console.log(goodsArray[0]);
    var classify = [];
    var goods = [];
    for (var i = 0; i < this.data.goodsList.length; i++) {
      classify.push(this.data.goodsList[i].gt_name)
    }
    for (var i = 0; i < goodsArray.length; i++) {
      goods.push(goodsArray[i].g_name)
    }

    this.setData({
      classify: classify,
      goods: goods
    })
    console.log(this.data.goods);
  },
  //选菜品类型
  bindPickerChange0: function (e) {
    console.log(e.detail);
    this.setData({
      classifyIndex: e.detail.value,
    })
    var goods = [];
    var goodsArray = this.data.goodsList[this.data.classifyIndex].goods;
    for (var i = 0; i < goodsArray.length; i++) {
      goods.push(goodsArray[i].g_name)
    }
    this.setData({
      goods: goods,
      goodIndex: 0
    });
    this.submitSearch();
  },
  //选菜
  bindPickerChange1: function (e) {
    this.setData({
      goodIndex: e.detail.value
    });
    this.submitSearch();
  },
  submitSearch: function () {
    console.log(this.data.classifyIndex);
    console.log(this.data.goodIndex);
    console.log(this.data.goodsList[this.data.classifyIndex].gt_id);
    var goodTypeId = this.data.goodsList[this.data.classifyIndex].gt_id;
    var goodId = this.data.goodsList[this.data.classifyIndex].goods[this.data.goodIndex].g_id;
    this.getGoodWeekSale(goodId);
    this.getGoodGlobalStatistic(goodId);
  },
  getGoodGlobalStatistic: function (goodId){
    var that = this;
    var url = '/Wxstatistic/getGoodGlobalStatistic?g_id=' + goodId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          singleFoodSale: res.data
        });
        console.log(that.data.singleFoodSale);
      }, function (error) {
        console.log(error);
      });
  },
  getGoodWeekSale: function (goodId){
    console.log(goodId);
    var that=this;
    var url1 = '/Wxstatistic/getGoodWeekSale?g_id=' + goodId;
    var url2 = '/Wxstatistic/getGoodMonthSale?g_id=' + goodId;
    request.sendRequest(url1, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          singleFoodWeek: res.data
        });
       //绘图
        that.paintSingleFoodSaleWeek();
      }, function (error) {
        console.log(error);
      });
    request.sendRequest(url2, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          singleFoodMonth: res.data
        });
        //绘图
        that.paintSingleFoodSaleMonth();
      }, function (error) {
        console.log(error);
      });
    //测试数据
    // var singleFoodMonth = {
    //   data: [13, 24, 34, 25, 25, 42, 10],
    //   categories: ['10月', '11月', '12月', '1月', '2月', '3月', '4月']
    // }
    // that.setData({
    //   singleFoodMonth: singleFoodMonth
    // });
    // that.paintSingleFoodSaleMonth();
  },
  //单菜查询
  paintSingleFoodSaleWeek: function () {
    lineChart=new wxCharts({
      canvasId: 'sfWeekLineCanvas',
      type: 'line',
      categories: this.data.singleFoodWeek.categories,
      series: [{
        name: this.data.goods[this.data.goodIndex] + '近周销售额',
        data: this.data.singleFoodWeek.data,
      }],
      yAxis: {
        title: '销售金额',
        format: function (val) {
          return val;
        },
        min: 0
      },
      width: 350,
      height: 200,
      animation:false
    });
  },
  paintSingleFoodSaleMonth: function () {
    lineChart = new wxCharts({
      canvasId: 'sfMonthLineCanvas',
      type: 'line',
      categories: this.data.singleFoodMonth.categories,
      series: [{
        name: this.data.goods[this.data.goodIndex] + '近六个月销售额',
        data: this.data.singleFoodMonth.data,
      }],
      yAxis: {
        title: '销售金额',
        format: function (val) {
          return val;
        },
        min: 0
      },
      width: 350,
      height: 200,
      animation: false
    });
  },
})