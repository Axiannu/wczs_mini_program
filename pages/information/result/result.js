// pages/information/result/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  itemClick: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/information/information-info/information-info?info=' + JSON.stringify(this.data.list[index]),
    })
  },

  star: function (e) {
    let index = e.currentTarget.dataset.index;
    let list = this.data.list;
    var path = '', states = !this.data.list[index].state
    if (states) {
      path = '/images/icon_little_star_select.png'
    } else {
      path = '/images/icon_little_star_normal.png'
    }
    list[index].state = states
    list[index].path = path
    this.setData({
      list: list
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var key = options.key;
    var that = this;
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'zx_yun',
      // 传递给云函数的参数
      data: {
        $url: "zx_ss_Query",
        other: {
          "title": key
        }
      },
      success: res => {
        console.log(res)
        var data = res.result.data;
        for (let key in data) {
          var date = new Date(data[key].time)
          data[key].time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
          data[key].state = false
          data[key].path = '/images/icon_little_star_normal.png'
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