// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init()

// 调用云数据库引用
const db = cloud.database({
  throwOnNotFound: false
})
//选定数据库集合
const tiezi = db.collection('home_tiezi')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('进入首页中间件')
    ctx.data = {}
    //ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出首页中间件')
  })

  //首页总帖子数据查询
  app.router('home_Query', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]查询')
    ctx.data = {
      is_delete: 0,
      //isdelete: event.isdelete
    }
    const MAX_LIMIT = 100
    const countResult = await tiezi.count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 100)
    console.log("需连续查询：", batchTimes, " 次")
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = tiezi.skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
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

/*      
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
*/    
/*
    todos.where({
      is_delete: ctx.data.is_delete
    }).get().then(res => {
      ctx.data = res.data
      console.log('数据查询成功,帖子数量为：', res.data.length)
    })

    await next()
*/  console.log('查询结果数量共为：', ctx.body.data.length,"条。")
    console.log('结束-->数据库[home_tiezi]查询')
  }, async (ctx, next) => {
    ctx.body = {
      data: 0

    }
  })

  //帖子写入测试
  app.router('home_Add', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]写入')
    const wxContext = cloud.getWXContext()
    const user_openid = wxContext.OPENID
    ctx.data = {
      /*
      createTime: db.serverDate(),
      time: new Date(),
      add_heart: 0,
      is_delete: 0,
      //text: "这是帖子的正文部分,也是正式第一条测试内容输入。",
      _openid: user_openid,
      
      text: event.text,
      //_openid: 'crc测试openid01',
      */
      headImage : event.other.headImage,  //用户头像
      name : event.other.name,  //用户昵称
      content : event.other.content,  //帖子内容
      time : new Date(),  //创建时间
      isStar: false,  //是否被点赞
      starNum : 0,  //点赞数初始化为 0
      is_delete : 0,  //是否删除，初始化为 0
      _openid: user_openid, //用户openid唯一标识

    }
    await tiezi.add({
      data: ctx.data
    }).then(res => {
      ctx.data = res
      console.log('[帖子数据]插入成功，记录ID：', ctx.data._id)
    })
    console.log('结束-->数据库[home_tiezi]写入')
    ctx.body = {
      data: ctx.data,
      gr_release_id: ctx.data._id,
      //headImage: event.other.headImage,  //用户头像
      //name: event.other.name, 

      
    }
  })  


  //帖子标示为已删除状态
  app.router('home_delete', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]更新状态')
    ctx.data = {
      //_id: "f3db088f5e804416002558971a7eaaeb",
      
      _id: event.other._id,
    }
    try {
      await tiezi.where({
        _id: ctx.data._id
      }).update({
        data: {
          is_delete: 1
        }
      }).then(res => {
        ctx.data = res
        console.log('数据更新成功,修改个数：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[home_tiezi]更新')
    ctx.body = {
      data: ctx.data,
      //_id:"f3db088f5e79e0c50001461604515a42"
    }
  })

  //首页帖子进行点赞
  app.router('tz_add_heart', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]更新点赞状态')
    const _ = db.command
    
    ctx.data = {
      //_id: "f3db088f5e804416002558971a7eaaeb",
      
      _id: event.other._id,
      isStar: event.other.isStar,
    }
    
    try {
      await tiezi.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum : _.inc(1),
          isStar: ctx.data.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('帖子点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[home_tiezi]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar : event.other.isStar,
    }
  })

  //首页帖子取消点赞
  app.router('tz_del_heart', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "f3db088f5e804416002558971a7eaaeb",
      
      _id: event.other._id,
      isStar: event.other.isStar,
    }
    try {
      await tiezi.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum : _.inc(-1),
          isStar: event.other.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('帖子取消点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[home_tiezi]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  //首页帖子取消点赞
  app.router('tz_del_heart', async (ctx, next) => {
    console.log('进入-->数据库[home_tiezi]更新点赞状态')
    const _ = db.command
    ctx.data = {
      //_id: "f3db088f5e804416002558971a7eaaeb",
      
      _id: event.other._id,
      isStar: event.other.isStar,
    }
    try {
      await tiezi.where({
        _id: ctx.data._id
      }).update({
        data: {
          starNum : _.inc(-1),
          isStar: event.other.isStar
        }
      }).then(res => {
        ctx.data = res
        console.log('帖子取消点赞成功,修改状态码：', res.stats.updated)
      })
    } catch (e) {
      console.error(e)
    }

    console.log('结束-->数据库[home_tiezi]点赞状态更新')
    ctx.body = {
      data: ctx.data,
      isStar: event.other.isStar,
    }
  })

  return app.serve()
}
