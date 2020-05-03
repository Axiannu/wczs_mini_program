# 用户功能记录
本函数功能为帖子为针对【Users_information】数据库进行操作。
1、判断用户是否存在，若存在则告知并结束，若不存在则进行新用户添加。——> user_Add
2、查询对应——openid的用户所属文章 ——> user_wz_Query
3、进行浏览历史记录存储 ——> user_ls_Add
4、查询自身浏览历史 ——>user_ls_Query
5、(单条)删除自身浏览历史 ——>user_ls_Del
6、进行创建文章时记录文章ID入用户记录内 ——>user_tz_Add
7、搜索历史记录添加 ——>user_ss_Add
8、搜索历史记录查询 ——>user_ss_Query
9、搜索历史记录删除 ——>user_ss_Del
10、用户点赞信息记录 ————> user_admire_add