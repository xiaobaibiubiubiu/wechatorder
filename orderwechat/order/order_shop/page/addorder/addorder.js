var app = getApp();
var server = require('../../utils/server');
var request = require('../../utils/requestServer.js');
Page({
  data: {
    filterId: 1,
    cart: {
      count: 0,
      total: 0,
      list: [],
      shop_id: -1
    },
    showCartDetail: false,
    shop: [],
    goodsList: [],
    classifySelected: '',
    classifyViewed: '',
    showCart: false,
    loading: false,
    shopId: '',
  },
  onLoad: function () {
   var that = this;
    that.setData({
      loading: true
    });
  },
  onReady:function(){
    console.log('hihi');
  },
  onShow: function () {
    //切换回该店时查看全局变量中的已存选菜信息
    var that = this;
    //切换回该店时查看全局变量中的已存选菜信息
    that.checkExistCartInfo();
    var s_id = wx.getStorageSync('s_id');
    var coin = wx.getStorageSync('s_coin');
    console.log(s_id + 'dsadsa');
    that.setData({
      shopId: s_id,
      coin: coin,
    })
    console.log('录入菜单的s_id'+s_id);
    this.getGoods();
    this.getFoodType();
    //this.checkExistCartInfo();
    console.log(wx.getStorageSync('pack_fee'));
    this.setData({
      'cart.shop_id': this.data.shopId
    });
    // this.getGoods();
    // this.getFoodType();
    this.setData({
      goodsList: this.data.goodsList,
      // classifySeleted: this.data.classifySeleted,
    });
    console.log(this.data.cart);
  },
  getShop: function (option) {
    var that = this;
    var url = '/Wxorder/getStore?s_id=' + option;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res);
        console.log(res.data[0].s_storename);
        wx.setStorageSync('storename', res.data[0].s_storename);
        that.setData({
          shop: res.data[0],
        });
      }, function (error) {
        console.log(error);
      });

  },
  //获取商店所有菜品
  getGoods: function () {
    console.log("获取所有菜品");
    var that = this;
    var url = '/Wxorder/getGoods?s_id=' + that.data.shopId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        // console.log(res.data);
        that.setData({
          goodsList: res.data[0],
          classifySeleted: res.data[0][0].gt_id,
        });
        wx.setStorageSync('pack_fee', res.data[1])
        console.log(res.data[1]);
        console.log(that.data.goodsList);
      }, function (error) {
        console.log(error);
      });
  },
  tapFilters: function (e) {
    switch (e.target.dataset.id) {
      case '1':

        break;
      case '2':

        break;
    }
    this.setData({
      filterId: e.target.dataset.id,
      shops: this.data.shops
    });
  },
  tapAddCart: function (e) {
    var goodId = parseInt(e.target.dataset.id.slice(1));
    if (e.target.dataset.md) {
      var typeId = parseInt(e.target.dataset.md.slice(2));//类型id
      var goodIndex = parseInt(e.target.dataset.gindex.slice(4));//菜品下标
      this.addCart(goodId, typeId, goodIndex);
    }
    else {
      this.addCart(goodId);
    }

  },
  tapReduceCart: function (e) {
    this.reduceCart(e.target.dataset.id);
  },
  addCart: function (goodid, typeid, goodIndex) {
    //id是该菜品的id
    var len = this.data.cart.list.length;
    var f_good = [];//待匹配good
    var good = {
      typeId: -1,
      goodId: -1,
      count: 0,
      goodPrice: -1,
      goodName: "",
      pack_num:0
    };
    //在购物车中已存在
    for (var i = 0; i < len; i++) {
      if (this.data.cart.list[i].goodId == goodid) {
        this.data.cart.list[i].count += 1;
        this.countCart();
        return;
      }
    }
    //从goodsList中获取添加的菜品的全部信息
    for (var i = 0; i < this.data.goodsList.length; i++) {
      if (parseInt(this.data.goodsList[i].gt_id) == typeid) {
        f_good = this.data.goodsList[i];
        break;
      }
    }
    if (f_good.goods[goodIndex].g_id == goodid) {
      good.goodPrice = f_good.goods[goodIndex].price;
      good.goodName = f_good.goods[goodIndex].g_name;
    }
    good.typeId = typeid;
    good.goodId = goodid;
    good.count += 1;
    //新选菜品内容push进当前购物车
    this.data.cart.list.push(good);
    this.countCart();


  },
  reduceCart: function (id) {
    //id:要删除的goodId
    for (var i = 0; i < this.data.cart.list.length; i++) {
      if (this.data.cart.list[i].goodId == id) {
        if (this.data.cart.list[i].count <= 1) {
          this.data.cart.list.splice(i, 1);
        } else {
          this.data.cart.list[i].count -= 1;
        }
        this.countCart();
      }
    }
    this.setData({
      showCart: this.data.cart.list.length == 0 ? false : true,
    })
  },
  countCart: function () {
    var count = 0,
      total = 0;
    for (var i = 0; i < this.data.cart.list.length; i++) {
      var good = this.data.cart.list[i];//所选商品
      console.log(good);
      // console.log(good.typeId);//菜品类型
      // console.log(good.goodId);//菜品
      // console.log(good.count);//菜品数量
      console.log(good.goodPrice);
      // console.log(parseFloat(good.goodPrice));
      count += good.count;
      total += Number((good.count * good.goodPrice).toFixed(2));
      console.log(total);
    }
    this.data.cart.count = count;
    this.data.cart.total = total;
    this.setData({
      cart: this.data.cart
    });
    this.checkAddGlbcar();
  },
  checkAddGlbcar: function () {
    var len = app.globalData.buyCar.length;
    //console.log("当前全局变量购物车内容长度："+len);
    if (len != 0) {
      //已经存在并且更新，直接替换
      for (var i = 0; i < len; i++) {
        if (app.globalData.buyCar[i].shop_id == this.data.cart.shop_id) {
          app.globalData.buyCar[i] = "";
          app.globalData.buyCar[i] = this.data.cart;
          //跳出循环
          return;
        }
      }
      //存入新店点餐信息
      app.globalData.buyCar.push(this.data.cart);
    }
    else {//存第一家店的点餐信息
      app.globalData.buyCar.push(this.data.cart);
    }
    console.log('删除后的样子：' + app.globalData.buyCar);
  },
  clearCartList: function () {
    //传进来一个s_id,定点清除
    console.log(this.data.cart.shop_id);
    for (var i = 0; i < app.globalData.buyCar.length; i++) {
      if (app.globalData.buyCar[i].shop_id == this.data.cart.shop_id) {
        app.globalData.buyCar.splice(i, 1);
        break;
      }
    }
    console.log('删除后的全局点餐信息：');
    console.log(app.globalData.buyCar);
    this.setData({
      cart: {
        count: 0,
        total: 0,
        list: [],
      },
      showCartDetail: false,
      showCart: false
    });

  },
  goOrder: function () {
    console.log(this.data.cart);
    console.log("测试：" + this.data.cart.shop_id);
    if (this.data.cart.total != 0) {
      wx.setStorageSync('cart.list', this.data.cart.list);
      wx.setStorageSync('cart.count', this.data.cart.count);
      wx.setStorageSync('cart.total', this.data.cart.total);
      wx.setStorageSync('cart.shop_id', this.data.cart.shop_id);

      wx.navigateTo({
        url: './orderdetail?shop_id=' + this.data.cart.shop_id
      })
    }
  },
  follow: function () {
    this.setData({
      followed: !this.data.followed
    });
    console.log(this.data.followed);
    wx.showToast({
      title: this.data.followed ? '收藏成功' : '已取消收藏',
      icon: 'success',
      duration: 1000
    });
  },
  onGoodsScroll: function (e) {
    if (e.detail.scrollTop > 10 && !this.data.scrollDown) {
      this.setData({
        scrollDown: true
      });
    } else if (e.detail.scrollTop < 10 && this.data.scrollDown) {
      this.setData({
        scrollDown: false
      });
    }

    var scale = e.detail.scrollWidth / 570,
      scrollTop = e.detail.scrollTop / scale,
      h = 0,
      classifySeleted,
      len = this.data.goodsList.length;
    this.data.goodsList.forEach(function (classify, i) {
      var _h = 70 + classify.goods.length * (46 * 3 + 20 * 2);
      if (scrollTop >= h - 100 / scale) {
        classifySeleted = classify.gt_id;
      }
      h += _h;
    });
    this.setData({
      classifySeleted: classifySeleted,
    });
    console.log("classifySeleted:" + classifySeleted);
  },
  tapClassify: function (e) {
    console.log(e);
    var id = e.target.dataset.id.slice(2);
    this.setData({
      classifyViewed: "gs" + id
    });
    var self = this;
    setTimeout(function () {
      self.setData({
        classifySeleted: id
      });
    }, 100);
    console.log(this.data.classifyViewed);
  },
  showCartDetail: function () {
    this.setData({
      showCartDetail: !this.data.showCartDetail
    });
  },
  hideCartDetail: function () {
    this.setData({
      showCartDetail: false
    });
    console.log('lalalla' + this.data.cart.list);
  },
  showCartList: function () {
    if (this.data.cart.list.length != 0) {
      this.setData({
        showCart: !this.data.showCart
      })
    }
  },
  //返回商铺所在商圈
  goBackToGroup: function () {
    console.log('全局变量|商圈id:' + this.data.groupId);
    if (app.globalData.groupId) {
      wx.navigateBack({
        url: '../index/index?uid=' + this.data.groupId,
      })
    }
    else {
      console.log('asdadasd');
      wx.redirectTo({
        url: '../index/index?uid=' + this.data.groupId,
      })
    }
    console.log('返回商圈函数');
  },
  //获取菜品类型
  getFoodType: function () {
    var that = this;
    var url = '/Wxgoodsupdate/findGoodsType?s_id=' + that.data.shopId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        app.globalData.crFoodType = res.data;
        that.setData({
          foodType: res.data
        });
        var array = [];//用于选择
        console.log(that.data.foodType.length);
        for (var i in res.data) {
          array.push(res.data[i].gt_name);
        }
        that.setData({
          array: array
        });

      }, function (error) {
        console.log(error);
      });
  },
 
  checkExistCartInfo: function () {
    console.log("检查是否已经有点菜信息");
    var that = this;
    console.log(app.globalData.buyCar);
    // console.log(app.globalData.buyCar.length);
    console.log(app.globalData.buyCar[0]);
    if (app.globalData.buyCar.length == 0) {
      that.setData({
        cart: {
          count: 0,
          total: 0,
          list: [],
        },
        showCartDetail: false,
        showCart: false
      });
    }
    if (app.globalData.buyCar.length != 0) {
      for (var i = 0; i < app.globalData.buyCar.length; i++) {
        if (app.globalData.buyCar[i].shop_id == this.data.cart.shop_id) {
          console.log('是全局购物车中第' + i + '家档口');
          that.setData({
            cart: app.globalData.buyCar[i]
          });
          break;
        }
      }
      //否则就是已经从全局中删掉啦
      // that.setData({
      //   cart: []
      // });
    }
  },
});

