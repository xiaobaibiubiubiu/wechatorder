// page/mine/password.js
var app = getApp();
var request = require('../../utils/requestServer');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pwd:null,
    new_pwd1:null,
    new_pwd2:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  pwdInput:function(e){
    this.setData({
      pwd:e.detail.value
    })
  },
  newPwd1Input:function(e){
    this.setData({
      new_pwd1: e.detail.value
    })
  },
  newPwd2Input: function (e) {
    this.setData({
      new_pwd2: e.detail.value
    })
  },
  //提交密码
  formSubmit:function(){
    var that=this;
    var shopId = wx.getStorageSync('s_id');
    var openId = wx.getStorageSync('open_id');
    console.log(shopId);
    console.log(openId);
    console.log(that.data.new_pwd1);
    console.log(that.data.new_pwd2);
    if(that.data.pwd==null && that.data.new_pwd1==null && that.data.pwd2==null){
      console.log("输入密码");
      wx.showModal({
        title: '提示',
        content: '请输入密码',
        showCancel: false,
      })
    }
    else if (that.data.new_pwd1 != that.data.new_pwd2){
      console.log("两次输入密码不一致");
      wx.showModal({
        title: '提示',
        content: '两次输入的密码不一致',
        showCancel: false,
      })
    }
    else{
      var url ='/Wxorder/changePwd?open_id='+openId+'&s_id='+shopId+'&pwd='+that.data.pwd+'&new_pwd='+that.data.new_pwd1;
      console.log(url);
      request.sendRequest(url,'Get',{},{}).then(
        function(res){
          console.log(res);
          if (res.data == 2) {
            wx.showModal({
              title: '提示',
              content: '新密码不能与原密码相同',
              showCancel: false,
            })
          }
          else if (res.data == 3) {
            wx.showModal({
              title: '提示',
              content: '原始密码输入错误',
              showCancel: false,
            })
          }
          else if (res.data == 1) {
            wx.showToast({
              title: '密码修改成功',
              icon: 'success',
              duration: 2000
            })
            setTimeout(function(){
              wx.navigateBack({
                changed: true
              })
            },2100)
          }
          else {
            console.log("error");
          }
        })
    }
  },
  //重置
  formReset: function () {
    console.log('form发生了reset事件');
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
})