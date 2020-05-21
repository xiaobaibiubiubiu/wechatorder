var app = getApp();
var request = require('../../utils/requestServer');
//图片地址：Public/test
Page({
  data: {
    nowtab: '全部菜品',
    filterId: 1,
    goodsList: [],
    classifySelected: '',
    classifyViewed: '',
    addFood: {},
    addType:{},
    focus: false,
    index: 0,
    tempFilePaths: [],
    waitEdit: true,
    editTypeid: -1,
    formerText: "",
    newText: "",
    editFoodType:{},
    imgview: true,
    addTypeTab:false,
    addtypestatus:true,
    testData:[{ id: 0, value: 'a', name: 'A' }, { id: 1, value: 'b', name: 'B' }],
  },
  onLoad: function (data) {
    var that=this;
    var s_id=wx.getStorageSync('s_id');
    var coin=wx.getStorageSync('s_coin');
    that.setData({
        shopId:s_id,
        coin:coin,
    })
    this.getGoods();
    this.getFoodType();
    this.setData({
      nowtab: this.data.toTab
    });
  },
  //获取菜品类型
  getFoodType: function () {
    var that = this;
    var url = '/Wxgoodsupdate/findGoodsType?s_id=' + that.data.shopId;
    request.sendRequest(url, 'GET',{}, {})
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
  //获取商店所有菜品
  getGoods: function () {
    var that = this;
    var url = '/Wxorder/getGoods?s_id='+that.data.shopId;
    request.sendRequest(url, 'GET', {}, {})
      .then(function (res) {
      
        that.setData({
          goodsList: res.data[0],
          classifySeleted: res.data[0][0].gt_id,
        });
      }, function (error) {
        console.log(error);
      });
  },
  //增加商品类型
  toAddType: function () {
    console.log('增加商品类型');
    this.setData({
      addTypeTab:true
    });
    // console.log(this.data.addTypeTab);
  },
  //增加商品类型
  submitNewType: function (e) {
    var that=this;
    console.log(e.detail.value.name);
    this.setData({
      addType: e.detail.value
    });
    var url1 = '/Wxgoodsupdate/findGoodsType?s_id=' + that.data.shopId;
    request.sendRequest(url1, 'GET', {}, {})
      .then(function (res) {
        console.log(res.data);
        that.setData({
          addtypestatus:true
        })
        for(var i in res.data){
          console.log(res.data[i].gt_name);
          console.log(that.data.addtypestatus);
          if (e.detail.value.name == res.data[i].gt_name) {
            console.log("1");
            that.setData({
              addtypestatus:false
            })
           }
        }
        console.log(that.data.addtypestatus);
        if (that.data.addtypestatus == false) {
          wx.showToast({
            title: '该类型已存在',
            icon: 'none',
            duration: 1000,
            mask: false,
          });
        }
        else if (that.data.addtypestatus == true) {
          var url = '/Wxgoodsupdate/addGoodsType?s_id=' + that.data.shopId + '&gt_name=' + that.data.addType.name;
          request.sendRequest(url, 'GET', {}, {})
            .then(function (res) {
              console.log(res.data);
              that.setData({
                addTypeTab: false
              });
              that.getFoodType();

              wx.showToast({
                title: '添加成功',
                icon: 'success',
                duration: 2000,
                mask: false
              })
            }, function (error) {
              console.log(error);
              wx.showToast({
                title: '添加菜品失败',
                icon: 'loading',
                duration: 2000,
                mask: false,
              });
            });
        }
      }, function (error) {
        console.log(error);
      });      
  },
  //删除商品类型
  toDelType: function (e) {
    console.log(e);
    console.log(e.currentTarget.dataset.id);
    var that=this;
    console.log('删除商品类型');
    wx.showModal({
      title: '请慎重操作',
      content: '请确认该类型下菜品为空',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          var url = '/Wxgoodsupdate/delGoodsType?gt_id=' + e.currentTarget.dataset.id;
          request.sendRequest(url,'GET',{},{})
          .then(function(res){
            console.log(res.data);
            if(res.data=="havegoods"){
              wx.showToast({
                title: '请先删除该类型下菜品',
                icon: 'none',
                duration: 2000,
                mask: false
              });
            }else{
              that.getFoodType();
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000,
                mask: false
              });
            }
          },function(error){
            console.log(error);
          });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
    
  },
  //编辑已存在类型
  toEditType: function (e) {
    console.log(e);
    this.setData({
      editTypeid: e.currentTarget.dataset.id,
      waitEdit: false
    });
    console.log(this.data.editTypeid);
  },
  //获取原来内容，用于判断是否有修改
  getFormerText: function (e) {
    console.log('修改之前:' + e.detail.value);
    this.setData({
      formerText: e.detail.value
    });
  },
  //实时获取input内容
  getInputText: function (e) {
    console.log('修改菜品的id:' + e.currentTarget.dataset.id);
    console.log('修改菜品后的名:' + e.detail.value);
    this.setData({
      newText: e.detail.value
    });
    console.log(this.data.newText);
    if (this.data.formerText != this.data.newText) {
      for (var i in this.data.editFoodType) {
        if (this.data.editFoodType[i].typeId == e.currentTarget.dataset.id) {
          //先remove
          this.data.editFoodType.splice(i,1);
          break;
        }
      }
      var data = {
        typeId: e.currentTarget.dataset.id,
        typeName: this.data.newText
      }
      var jsonLen = this.getJsonLength(this.data.editFoodType);
      this.data.editFoodType[jsonLen]=data;
    }
  },
  //提交修改
  submitEditType: function () {
    var that=this;
    console.log(that.data.editFoodType);
    if (that.data.editFoodType.length == 0) {
      this.setData({
        editTypeid: -1
      });
      wx.showToast({
        title: '请作修改后再提交',
        duration: 2000,
        icon: 'none'
      })
    } else {
      console.log(JSON.stringify(that.data.editFoodType));
      var json={
        'editFoodType': JSON.stringify(that.data.editFoodType)
      }
      var header={
        'Content-Type':'application/x-www-form-urlencoded'
      }
      request.sendRequest('/Wxgoodsupdate/updateGoodsType','POST',json, header)
        .then(function (res) {
          console.log(res);
          that.setData({
            editTypeid: -1,
            waitEdit:true,
            editFoodType:{}
          });
          that.getFoodType();
          wx.showToast({
            title: '修改成功!',
            duration: 2000,
            icon: 'success'
          })
        }, function (error) {
          console.log(error);
        });
    }
  },
  //取消类型修改
  cancelEditType:function(){
    this.setData({
      editTypeid:-1,
      addTypeTab: false,
      waitEdit:true,
      editFoodType:[]
    });
  },
  //取消类型添加
  cancelAddType:function(){
    this.setData({
      addTypeTab: false
    });
  },
  //增加商品
  submitNewFood: function (e) {
    this.setData({
      addFood: e.detail.value
    });
    console.log(this.data.addFood);
    var data = {
      'g_name': e.detail.value.name,
      's_id': this.data.shopId,
      'price': e.detail.value.sales,
      'introduce': e.detail.value.intro,
      'g_type': this.data.foodType[e.detail.value.foodtype].gt_id,
      'accessories': 0,
      'taste': '1,2,3',
    };
    console.log(data);
    if (this.data.temp_path) {
      wx.uploadFile({
        url: 'https://bjshuyiyuan.top/wechatorder/index.php/Apiwx/Wxgoodsupdate/addGoods',
        filePath: this.data.temp_path,
        name: 'pic_url',
        formData: {
          'g_name': e.detail.value.name,
          's_id': this.data.shopId,
          'price': e.detail.value.sales,
          'introduce': e.detail.value.intro,
          'g_type': this.data.foodType[e.detail.value.foodtype].gt_id,
          'accessories': 0,
          'taste': ['1', '2', '3'],
        },
        success: function (res) {
          console.log(res.data);
          wx.showToast({
            title: '添加菜品成功',
            icon: 'success',
            duration: 2000,
            mask: false,
            success: function () {
              setTimeout(function () {
                wx.redirectTo({
                  url: "../food/index",
                })
              }, 500) //延迟时间 
            }
          });
        }
      })
    } else {
      wx.showToast({
        title: '请添加图片',
        icon: 'none',
        duration: 2000,
        mask: false,
      });
    }    
  },
  //编辑菜品
  toEditFood:function(e){
    console.log(e.currentTarget.dataset);
    var foodId = e.currentTarget.dataset.id.slice(1);
    var typeId = e.currentTarget.dataset.md.slice(2);
    var indexId = e.currentTarget.dataset.gindex.slice(4);
    console.log('foodId:'+foodId);
    console.log('typeId:'+typeId);
    console.log('indexId:' + indexId);
    for (var i = 0; i < this.data.goodsList.length; i++) {
      if (parseInt(this.data.goodsList[i].gt_id) == typeId) {
        var currentFood = this.data.goodsList[i].goods[indexId];
        break;
      }
    }
    console.log(currentFood);
    app.globalData.currentFood = currentFood;
    console.log(app.globalData.currentFood);
    wx.navigateTo({
      url: './editfood?typeId=' + typeId + '&g_id=' + foodId
    })
  },
  //删除菜品
  toDelFood: function (e) {
    var that=this;
    console.log(e.currentTarget.dataset);
    var foodId = e.currentTarget.dataset.id.slice(1);
    wx.showModal({
      title: '提示',
      content: '确定删除该菜品？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          var url = '/Wxgoodsupdate/delGoods?g_id=' + foodId;
          request.sendRequest(url,'GET',{},{})
          .then(function(res){
            console.log(res.data);
            wx.showToast({
              title:"删除成功",
              icon:"success",
              duration:2000
            });
            that.getGoods();
          },function(error){
            console.log(error);
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  switchTabs: function (el) {
    if (el.currentTarget.dataset.nowtab=='全部菜品'){
      this.getGoods();
    } 
    this.setData({
      nowtab: el.currentTarget.dataset.nowtab
    })
  },
  //滚动触发
  onGoodsScroll: function (e) {
    //console.log('进入滚动函数啦');
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
  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value,
      focus: true
    })
  },
  bindPickerChange: function (e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  
 
  formReset: function () {
    console.log('form发生了reset事件');
  },
  getJsonLength(jsonData) {  
    var length=0;  
    for(var ever in jsonData) {  
      length++;
    }
    return length;  
  },
  //上传图片
  upimg: function () {
    var self = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res);
        var tempFilePaths = res.tempFilePaths;
        self.setData({
          temp_path: tempFilePaths[0],
          imgview: false
        })
      },
    })
  },  
})
