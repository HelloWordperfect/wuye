// pages/start/start.js
const app = getApp();
let userId, setInter, userInfo,userCode;
Page({

  data: {
    datas: '', //小程序信息
    showLoading: true, //加载中动画
    array: [], //编号数组
    index: 0, //选择编号的下标
    mask: false, //是否显示弹窗
    userCode: '', //绑定的家庭编号
    userInfo: false, //弹窗里判断是否授权
    arrayId:[],   //编号数组包括id
  },
  onLoad: function(options) {
    //获取userId和userInfo
    userId = wx.getStorageSync('userId');
    userInfo = wx.getStorageSync('userInfo');
    userCode = wx.getStorageSync('userCode');
    console.log(userId);
    //清空缓存时没有userId
    if (!userId) {
      console.log('没有userId时')
      //没有userId时 一直请求userId
      setInter = setInterval(() => {
        userId = wx.getStorageSync('userId');
        if (userId) {
          this.getList();
          console.log('结束')
          clearTimeout(setInter);
        }
      }, 50);
    } else {
      this.getList();
    }
    console.log(userCode)
    //判断是否授权 授权后直接跳转到index
    if (userInfo && userId && userCode) {
      wx.switchTab({
        url: '../index/index'
      });
    }
    console.log(userId);
    //获取配置信息接口
    wx.request({
      method: 'GET',
      url: `${app.globalData.api}index/loadConfigs`,
      success: res => {
        console.log(res);
        this.setData({
          datas: res.data.data,
          showLoading: false, //加载中动画
        })
        console.log(this.data.datas);
      },
      fail: res => {
        this.setData({
          showLoading: false,
        });
        console.log(res);
      }
    });
    //获取编号数组
    wx.request({
      method: 'GET',
      url: `${app.globalData.api}Users/getUserCodeList`,
      success: res => {
        console.log(res);
        let array = [];
        for (var i = 0; i < res.data.data.length; i++) {
          array = array.concat(res.data.data[i].areaName);
        }
        array.unshift('请选择您的家庭编号');
        console.log(array);
        this.setData({
          array: array,
          arrayId:res.data.data
        });
      },
      fail: res => {
        console.log(res);
      }
    });
  },
  //获取是否选择家庭编号
  getList() {
    wx.request({
      method: 'POST',
      url: `${app.globalData.api}Users/getUserInfo`,
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      data: {
        userId: userId
      },
      success: res => {
        console.log(res);
        this.setData({
          userCode: res.data.data.userCode
        });
        wx.setStorageSync('userCode', this.data.userCode);
      },
      fail: res => {
        console.log(res);
      }
    });
  },
  //选择编号
  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    });
  },
  //显示弹窗
  bindMask() {
    this.setData({
      mask: true
    });
  },
  //关闭弹窗
  bindClose() {
    this.setData({
      mask: false
    });
  },
  //分享
  onShareAppMessage: function(res) {
    return {
      title: app.globalData.applet,
      path: 'pages/start/start'
    };
  },
  //绑定家庭编号
  bindBang() {
    if (this.data.index == 0) {
      wx.showToast({
        title: '请选择您的家庭编号',
        icon: 'none',
        duration: 1500
      });
    } else {
      this.setData({
        userInfo: true
      });
      wx.request({
        method: 'POST',
        url: `${app.globalData.api}Users/bindUserCode`,
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        data: {
          userId: userId,
          codeId: this.data.arrayId[this.data.index].areaId
        },
        success: res => {
          console.log(res);
          console.log({
            userId: userId,
            codeId: this.data.arrayId[this.data.index].areaId
          });
          if (res.data.stauts == 1) {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            });
            setTimeout(() => {
              wx.switchTab({
                url: '../index/index'
              });
            }, 500);
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1500
            });
          }
        },
        fail: res => {
          console.log(res);
        }
      });
    }
  },
  //按钮的点击事件
  bindGetUserInfo(e) {
    console.log(userId);
    console.log(e);
    //查询是否授权
    wx.getSetting({
      success: res => {
        console.log(res);
        //未授权时
        if (res.authSetting['scope.userInfo'] == true) {
          userInfo = e.detail.userInfo;
          wx.setStorageSync('userInfo', userInfo);
          console.log(userInfo);
          console.log('已授权');
          //授权过后，传用户信息
          this.setData({
            showLoading: true
          });
          wx.request({
            method: 'POST',
            url: `${app.globalData.api}Users/modify`,
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
              userId: userId,
              userName: userInfo.nickName,
              userPhoto: userInfo.avatarUrl
            },
            success: res => {
              console.log(res);
              console.log({
                userId: userId,
                userName: userInfo.nickName,
                userPhoto: userInfo.avatarUrl
              });
              this.setData({
                showLoading: false
              });
              if (res.data.stauts == 1) {
                if (this.data.userCode) {
                  wx.switchTab({
                    url: '../index/index'
                  });
                }
              } else {
                wx.showToast({
                  title: res.msg,
                  icon: 'none',
                  duration: 1500
                })
              }
            },
            fail: res => {
              this.setData({
                showLoading: false
              });
              console.log(res);
              wx.showToast({
                title: res.msg,
                icon: 'none',
                duration: 1500
              })
            }
          });
        } else { //已授权
          this.bindClose();
          console.log('未授权');
        }
      }
    });
  },
});