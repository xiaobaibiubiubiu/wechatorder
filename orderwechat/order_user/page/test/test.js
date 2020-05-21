var app = getApp();
var server = require('../../utils/server');
var request = require('../../utils/requestServer.js');
Page({
  checkusername: function (e) {
    var username = e.detail.value;
    console.log(username);
    wx.request({
      url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Text/zhuce',
      method: 'POST',
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        username: username
      },
      success: function (res) {
        console.log(res.data);
        if (res.data == 0) {
          wx.showToast({
            title: '不可使用的用户名',
            icon: 'loading',
            duration: 2000,
          })
        } else {
          wx.showToast({
            title: '可以使用的用户名',
            icon: 'loading',
            duration: 2000,
          })
        }
      }
    })
  },
  formSubmit: function (e) {
    console.log(e);
    var username = e.detail.value.username;
    var age = e.detail.value.age;
    var gender = e.detail.value.gender;
    var mobile = e.detail.value.mobile;
    var password = e.detail.value.password;
    var repassword = e.detail.value.repassword;


    if (e.detail.value.username == "") {
      wx.showToast({
        title: '请输入姓名！',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.age == "") {
      wx.showToast({
        title: '请选择年龄！',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.gender == "") {
      wx.showToast({
        title: '请选择性别！',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.mobile == "") {
      wx.showToast({
        title: '请填手机号',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.password == "") {
      wx.showToast({
        title: '请输入密码',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.repassword == "") {
      wx.showToast({
        title: '请确认密码',
        icon: 'loading',
        duration: 1000
      })
    } else if (password != repassword) {
      wx.showToast({
        title: '密码输入不一致',
        icon: 'loading',
        duration: 1000
      })
    } else if (e.detail.value.hobby == "") {
      wx.showToast({
        title: '请选择爱好',
        icon: 'loading',
        duration: 1000
      })
    } else {
      wx.showLoading({
        title: '网络请求中......',
      })
      var that = this;
      wx.request({
        url: 'https://bjshuyiyuan.com.cn/wechatorder/index.php/Apiwx/Text/zhuce',
        method: 'GET',
        data: {
          username: username,
          age: age,
          gender: gender,
          mobile: mobile,
          password: password,


        },
        header: {
          'Content-Type': 'application/json'
        },

        success: (res) => {
          console.log(res.data);
          if (res.data == 0) {
            wx.showToast({
              title: '用户名已存在',
              icon: 'loading',
              duration: 2000,
            })
          } else {
            wx.showToast({
              title: '注册成功',
              icon: 'success',
              duration: 2000,


            })
          }
        }
      })
    }
  }
})