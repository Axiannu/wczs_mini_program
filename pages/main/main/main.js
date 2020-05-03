// pages/main/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toastHidden: true,
    list: [],
    currentTab: 0,
    sendSuccess: false
  },
  toastBtn: function(e){
    wx.showToast({
      title: '新功能即将到来',
      icon: 'loading',
    })
    setTimeout(function(){
      wx.hideToast()
    },2000)
    
  },
   
  star: function (e) {
    var that = this
    let index = e.currentTarget.dataset.index;
    var url = ""
    if (that.data.list[index].isStar) {
      url = "tz_del_heart"
    } else {
      url = "tz_add_heart"
    }
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'home_yun',
      // 传递给云函数的参数
      data: {
        $url: url,
        other: {
          _id: that.data.list[index]._id,
          isStar: !that.data.list[index].isStar
        }
      },
      success: res => {
        console.log(res)
        that.getList()
      },
      fail: err => {
        console.log(err)
      },
      complete: () => {
        console.log("res")
      }
    })
  },

  swichNav: function (e) {
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      this.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  
  bindChange: function (e) {
    this.setData({ currentTab: e.detail.current });
  },
  itemone: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/second/index'
    })
  },
  itemtwo: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/first/index'
    })
  },
  itemthree: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/third/index'
    })
  },
  sendPost: function (e) {
    wx.navigateTo({
      url: '/pages/main/sendpost/sendpost',
    })
  },

  getList: function() {
    var that = this;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'home_yun',
      // 传递给云函数的参数
      data: {
        $url: "home_Query",
        other: {
          "is_delete": "0"
        }
      },
      success: res => {
        console.log(res)
        var data = res.result.data;
        for (let key in data) {
          var date = new Date(data[key].time)
          data[key].time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
          if (data[key].isStar) {
            data[key].path = '/images/icon_little_star_select.png'
          } else {
            data[key].path = '/images/icon_little_star_normal.png'
          }
        }
        that.setData({
          list: data
        })
      },
      fail: err => {
        console.log(err)
      },
      complete: () => {
        console.log("res")
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.toast = this.selectComponent("#toast");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.sendSuccess) {
      this.toast.showToast('发布帖子成功');
      this.setData({
        sendSuccess: false
      })
    }
    wx.cloud.init({
      env: 'wczs-server-b8jyq'
    });
    this.getList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})