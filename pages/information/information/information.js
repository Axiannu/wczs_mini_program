// pages/information/information/information.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    currentTab: 0,
  },
  
  star: function (e) {
    var that = this
    let index = e.currentTarget.dataset.index;
    var url = ""
    if (that.data.list[index].isStar) {
      url = "zx_del_heart"
    } else {
      url = "zx_add_heart"
    }
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'zx_yun',
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

  openSearchPage: function (e) {
    wx.navigateTo({
      url: '/pages/information/search/search',
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
  itemClick: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/information/information-info/information-info?info=' + JSON.stringify(this.data.list[index]),
    })
    let ggg = '/pages/information/information-info/information-info?info=' + JSON.stringify(this.data.list[index]);
    console.log(ggg)
  },
  itemfirst: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/first/index'
    })
  },
  itemsecond: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/second/index'
    })
  },
  itemthird: function () {
    wx.navigateTo({
      url: '/pages/information/shipin/third/index'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.init({
      env: 'wczs-server-b8jyq'
    });
    this.getList()
  },

  getList: function() {
    var that = this;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'zx_yun',
      // 传递给云函数的参数
      data: {
        $url: "zx_all_Query",
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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