<?php
/**
 *
 * 版权所有：恰维网络<qwadmin.qiawei.com>
 * 作    者：寒川<hanchuan@qiawei.com>
 * 日    期：2015-09-15
 * 版    本：1.0.0
 * 功能说明：配置文件。
 *
 **/
return array(
    //网站配置信息
    'URL' => 'http://60.205.229.120', //网站根URL
    'COOKIE_SALT' => 'houziqiangshigedashuaige', //设置cookie加密密钥
    //备份配置
    'DB_PATH_NAME' => 'db',        //备份目录名称,主要是为了创建备份目录
    'DB_PATH' => './db/',     //数据库备份路径必须以 / 结尾；
    'DB_PART' => '20971520',  //该值用于限制压缩后的分卷最大长度。单位：B；建议设置20M
    'DB_COMPRESS' => '1',         //压缩备份文件需要PHP环境支持gzopen,gzwrite函数        0:不压缩 1:启用压缩
    'DB_LEVEL' => '9',         //压缩级别   1:普通   4:一般   9:最高
    //扩展配置文件
    'LOAD_EXT_CONFIG' => 'db',
    'GOODSIMAGE'=>'./Data/Uploads/Goodsimage/',
    //'APPID_USER'=>'wx74196df079811561',
    'APPID_USER'=>'wxa6e216938db8bbcc',
    'APPID_SHOP'=>'wx21519557699e2d72',
    'APPID_BOSS'=>'wx7c806ff946c900a3',
    //'SECRET_USER'=>'01c40d17ec0843efafe7c4b7520f07ef',
    'SECRET_USER'=>'8afc4120fcec14a840810caa59c30477',
    'SECRET_SHOP'=>'7206a98877caae7f6afefe5b080b490c',
    'SECRET_BOSS'=>'c42deb15e87b3526a721d691596a6d3f',

    'MAP_AK'=>'FgKyXgczqCkIYbTY1w9eEHb3d1SWSyWf',
    'CLIENT_ID' => '1072629201',
    'CLIENT_SECRET' => '59a6fbc5c27dc015ae48902e3b3cfde4',
    //'APPID'=>'wx823af95da0150778',
    //'SECRET'=>'3ed8882fd78b34519b1c39e27ab8401f'
);