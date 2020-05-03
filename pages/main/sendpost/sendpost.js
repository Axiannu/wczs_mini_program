// pages/main/sendpost/sendpost.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: ""
  },

  send: function (e) {
    var content = this.data.value;
    var that = this;
    wx.cloud.init({
      env: 'wczs-server-b8jyq'
    });
    wx.getUserInfo({
      success: res => {
        wx.cloud.callFunction({
          // 要调用的云函数名称
          name: 'home_yun',
          // 传递给云函数的参数
          data: {
            $url: "home_Add",
            other: {
              headImage : res.userInfo.avatarUrl, //用户头像
              name : res.userInfo.nickName, //用户昵称
              time: new Date(),  //创建客户端时间
              // _openid: 'crc测试openid01',  //注入创建者openid
              starNum: 0,  //点赞数统计
              is_delete: 0,  //删除标识**0为未删除，1为删除。
              content: content  //创建帖子的内容
            }
          },
          success: res => {
            console.log(res)
            let pages = getCurrentPages();  // 当前页的数据，可以输出来看看有什么东西
            let prevPage = pages[pages.length - 2];  // 上一页的数据，也可以输出来看看有什么东西
            /** 设置数据 这里面的 value 是上一页你想被携带过去的数据，后面是本方法里你得到的数据，我这里是detail.value，根据自己实际情况设置 */
            prevPage.setData({
              sendSuccess: true,
            })
            /** 返回上一页 这个时候数据就传回去了 可以在上一页的onShow方法里把 value 输出来查看是否已经携带完成 */
            wx.navigateBack({});
          },
          fail: err => {
            console.log(err)
          },
          complete: () => {
            console.log("res")
          }
        })
      },
      fail: res => {
        wx.showModal({
          title: '提示',
          content: '请先登录',
          success (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      },
      complete: (res) => {},
    })
  },

  bindKeyInput: function (e) {
    this.setData({
      value: e.detail.value
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