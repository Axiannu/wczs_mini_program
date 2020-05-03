// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

// 调用云数据库引用
const db = cloud.database({
  throwOnNotFound: false
})
//选定数据库集合
const zx = db.collection('Articles_information')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('进入资讯页中间件')
    ctx.data = {}
    //ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出资讯页中间件')
  })

  //资讯页数据查询
  app.router('zx_all_Query', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]查询')
    ctx.data = {
      is_delete: 0
    }
    const MAX_LIMIT = 100
    const countResult = await zx.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    console.log("需连续查询：", batchTimes, " 次")
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = zx.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        is_delete: ctx.data.is_delete
      }).orderBy('time', 'desc')
      .get()
      tasks.push(promise)
      //console.log("第",i+1,"次查询完毕")

    }
    await next()
    const data01 = await Promise.all(tasks)
    const data02 = data01.reduce((acc, cur) => {

      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
    ctx.body = {
      data: data02.data,
      errMsg: data02.errMsg
    }

    console.log('查询文章结果数量共为：', ctx.body.data.length, "条。")
    console.log('结束-->数据库[Articles_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: 0

    }
  })

  //文章写入测试
  app.router('zx_Add', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]写入')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      /*
      createTime: db.serverDate(),
      time: new Date(),
      //_openid: 'crc测试openid',
      add_heart: 0,
      comment_number:0,
      is_delete: 0,
      //text_title:"这是文章的标题01",
      //text: "这是文章的正式正文部分。",
      //获取作者名字
      //author: user_name

      _openid: user_openid,
      text_title: event.text_title,
      text: event.text,
      */
      _openid : user_openid,  //用户openid唯一标识
      title : event.title,  //文章标题
      time : new Date(),  //创建时间
      isStar : false,  //是否被点赞
      starNum : 0,  //点赞数量，初始化为 0
      image : event.image,  //文章附带图片
      content : event.content,  //文章正文内容
      auther : event.auther,  //文章作者
      is_delete : 0,  //删除标识，初始化为 0

    }
    await zx.add({
      data: ctx.data
    }).then(res => {
      ctx.data = res
      ctx.data._id = res._id
      console.log('[帖子数据]插入成功，记录ID：', ctx.data._id)
    })
    console.log('结束-->数据库[Articles_information]写入')
    ctx.body = {
      data: ctx.data,

    }
  })

  //【搜索框】模糊查询搜索文章匹配
  app.router('zx_ss_Query', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]搜索')
    ctx.data = {
      //text_title: "三",

      title: event.other.title,
      is_delete: 0,
    }
    const _ = db.command
    const MAX_LIMIT = 100
    const countResult = await zx.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    console.log("需连续查询：", batchTimes, " 次")
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = zx.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        title: db.RegExp({
          regexp: ctx.data.title,
          options: 'i',
        }),
        is_delete: ctx.data.is_delete
      }).get()
      tasks.push(promise)
      //console.log("第",i+1,"次查询完毕")

    }
    await next()
    const data01 = await Promise.all(tasks)
    const data02 = data01.reduce((acc, cur) => {

      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
    ctx.body = {
      data: data02.data,
      errMsg: data02.errMsg
    }

    console.log('查询搜索结果数量共为：', ctx.body.data.length, "条。")
    console.log('结束-->数据库[Articles_information]搜索')
  }, async (ctx, next) => {
    ctx.body = {
      data: 0
    }
  })


  //文章标示为已删除状态
  app.router('zx_delete', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]更新状态')
    ctx.data = {
      //_id: "6aebd2215e7c4adf000e480a76299a99",

      _id: event.other._id,
    }
    try {
      await zx.where({
        _id: ctx.data._id
      }).update({
        data: {
          is_delete: 1
        }
      }).then(res => {
        ctx.data = res
        console.log('数据更新成功,状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[Articles_information]更新')
    ctx.body = {
      data: ctx.data
    }
  })

  //资讯页文章进行点赞
  app.router('zx_add_heart', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "42d70ff05e8045ac001dabdb0af1b2f0",

      _id: event.other._id,
      isStar: event.other.isStar
    }
    try {
      await zx.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum: _.inc(1),
          isStar: ctx.data.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('文章点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[Articles_information]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  //资讯页文章取消点赞
  app.router('zx_del_heart', async (ctx, next) => {
    console.log('进入-->数据库[Articles_information]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "42d70ff05e8045ac001dabdb0af1b2f0",

      _id: event.other._id,
      isStar: event.other.isStar
    }
    try {
      await zx.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum: _.inc(-1),
          isStar: ctx.data.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('文章取消点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[Articles_information]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  /*

  //用户搜索历史删除
  app.router('user_ls_Del', async (ctx, next) => {
    console.log('进入-->数据库[Users_information]查询')
    ctx.data = {
      _openid: "crc02"
    }
    await yh.where({
      _openid: ctx.data._openid
    }).update({
      data: {
        ll_history_id: []
      },
    }).then(res => {
      user_datas = res
      //user_datas01 = res.data[0].ll_history_id.length
      //user_datas02 = res.data[0].ll_history_id
      console.log('搜索历史清除成功')

    })
    await next()
    console.log('结束-->数据库[Users_information]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: user_datas,
    }
  })

  */



  return app.serve()
}
