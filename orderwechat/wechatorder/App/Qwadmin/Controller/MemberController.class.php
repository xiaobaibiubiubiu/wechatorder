<?php
/**
 *
 * 版权所有：恰维网络<qwadmin.qiawei.com>
 * 作    者：寒川<hanchuan@qiawei.com>
 * 日    期：2016-01-20
 * 版    本：1.0.0
 * 功能说明：用户控制器。
 *
 **/

namespace Qwadmin\Controller;
use Think\Upload;
use Think\Image;

class MemberController extends ComController
{
    public function index()
    {
        
        $p = isset($_GET['p']) ? intval($_GET['p']) : '1';
        $field = isset($_GET['field']) ? $_GET['field'] : '';
        $keyword = isset($_GET['keyword']) ? htmlentities($_GET['keyword']) : '';
        $order = isset($_GET['order']) ? $_GET['order'] : 'DESC';
        $where = '';

        $prefix = C('DB_PREFIX');
        if ($order == 'asc') {
            $order = "{$prefix}member.t asc";
        } elseif (($order == 'desc')) {
            $order = "{$prefix}member.t desc";
        } else {
            $order = "{$prefix}member.uid asc";
        }
        if ($keyword <> '') {
            if ($field == 'user') {
                $where = "{$prefix}member.user LIKE '%$keyword%'";
            }
            if ($field == 'phone') {
                $where = "{$prefix}member.phone LIKE '%$keyword%'";
            }
            if ($field == 'qq') {
                $where = "{$prefix}member.qq LIKE '%$keyword%'";
            }
            if ($field == 'email') {
                $where = "{$prefix}member.email LIKE '%$keyword%'";
            }
        }


        $user = M('member');
        $pagesize = 10;#每页数量
        $offset = $pagesize * ($p - 1);//计算记录偏移量
        $count = $user->field("{$prefix}member.*,{$prefix}auth_group.id as gid,{$prefix}auth_group.title")
            ->order($order)
            ->join("{$prefix}auth_group_access ON {$prefix}member.uid = {$prefix}auth_group_access.uid")
            ->join("{$prefix}auth_group ON {$prefix}auth_group.id = {$prefix}auth_group_access.group_id")
            ->where($where)
            ->count();

        $list = $user->field("{$prefix}member.*,{$prefix}auth_group.id as gid,{$prefix}auth_group.title")
            ->order($order)
            ->join("{$prefix}auth_group_access ON {$prefix}member.uid = {$prefix}auth_group_access.uid")
            ->join("{$prefix}auth_group ON {$prefix}auth_group.id = {$prefix}auth_group_access.group_id")
            ->where($where)
            ->limit($offset . ',' . $pagesize)
            ->select();
        //$user->getLastSql();
        $page = new \Think\Page($count, $pagesize);
        $page = $page->show();
        $this->assign('list', $list);
        $this->assign('page', $page);
        $group = M('auth_group')->field('id,title')->select();
        $this->assign('group', $group);
        $this->display();
    }

    public function del()
    {

        $uids = isset($_REQUEST['uids']) ? $_REQUEST['uids'] : false;
        //uid为1的禁止删除
        if ($uids == 1 or !$uids) {
            $this->error('参数错误！');
        }
        if (is_array($uids)) {
            foreach ($uids as $k => $v) {
                if ($v == 1) {//uid为1的禁止删除
                    unset($uids[$k]);
                }
                $uids[$k] = intval($v);
            }
            if (!$uids) {
                $this->error('参数错误！');
                $uids = implode(',', $uids);
            }
        }

        $map['uid'] = array('in', $uids);
        if (M('member')->where($map)->delete()) {
            M('auth_group_access')->where($map)->delete();
            addlog('删除会员UID：' . $uids);
            $this->success('恭喜，用户删除成功！');
        } else {
            $this->error('参数错误！');
        }
    }

    public function edit()
    {

        $uid = isset($_GET['uid']) ? intval($_GET['uid']) : false;
        if ($uid) {
            //$member = M('member')->where("uid='$uid'")->find();
            $prefix = C('DB_PREFIX');
            $user = M('member');
            $member = $user->field("{$prefix}member.*,{$prefix}auth_group_access.group_id")->join("{$prefix}auth_group_access ON {$prefix}member.uid = {$prefix}auth_group_access.uid")->where("{$prefix}member.uid=$uid")->find();

        } else {
            $this->error('参数错误！');
        }
        $coin = M('coin')->field('c_id,c_name')->where('is_delete=0')->select();
        $this->assign('coin',$coin);
        $usergroup = M('auth_group')->field('id,title')->select();
        $this->assign('usergroup', $usergroup);

        $this->assign('member', $member);
        $this->display('form');
    }

    
    public function update($ajax = '')
    {
        if ($ajax == 'yes') {
            $uid = I('get.uid', 0, 'intval');
            $gid = I('get.gid', 0, 'intval');
            $condition1['group_id']=$group_id;
            $condition['uid']=$uid;
            M('auth_group_access')->where($condition)->save($condition1);
            die('1');
        }

        $uid = isset($_POST['uid']) ? intval($_POST['uid']) : false;
        $user = isset($_POST['user']) ? htmlspecialchars($_POST['user'], ENT_QUOTES) : '';
        $group_id = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
        if (!$group_id) {
            $this->error('请选择用户组！');
        }
        $password = isset($_POST['password']) ? trim($_POST['password']) : false;
        if ($password) {
            $data['password'] = password($password);
        }
        //原头像部分，注释一行
        //$head = I('post.head', '', 'strip_tags');
        //import("Org.Net.UploadFile"); 
        $fileName=$_FILES["pic_url"]["name"];//这样就能够取得上传的文件名
        //dump($_FILES);die;  
        $fileExtensions=strrchr($fileName, '.');
        //通过对$fileName的处理，就能够取得上传的文件的后缀名  
        $serverFileName=date("Ymd")."_".mt_rand(); 
        //dump(C("GOODSIMAGE"));die;
        //$upload->saveRule=$serverFileName;//设置在服务器保存的文件名 
        $mimes = array(
            'image/jpeg',
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/pjpeg',
            'image/gif',
            'image/bmp',
            'image/x-png'
        );
        $config = array(
            'mimes'      =>    $mimes,
            'maxSize'    =>    1048576,
            'savePath'   =>    'memberhead/'.date('Y')."/".date('m')."/",
            'saveName'   =>    date("YmdHis"),
            'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
            'rootPath'   =>    './Public/',
            'subName'  =>  array('date', 'd')
        );
        $upload = new Upload($config);// 实例化上传类
        //dump($upload);die;  
        $info=$upload->upload();
        if(!$info){ 
            //捕获上传异常 
            $this->error($upload->getError()); 
        } 
        else{ 
            $head= __ROOT__."/Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
        } 
        //图片压缩成缩略图
        $img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
        $thumb=thumb_img($img_url);
        //$data['sex'] = isset($_POST['sex']) ? intval($_POST['sex']) : 0;
        $data['head'] = $head ? $head : '';
        $data['groupname'] = isset($_POST['groupname']) ? trim($_POST['groupname']) : '';
        $data['province'] = I('province');
        $data['city'] = I('city');
        $data['district'] = I('district');
        $data['detail_addr'] = I('detailaddr');
        $data['c_id'] = I('coin');
        $data['tax_rate'] = floatval(I('taxrate'));
        $addr = $data['province'].$data['city'].$data['district'].$data['detail_addr'];
        $map_ak = C('MAP_AK');
        $url = "http://api.map.baidu.com/geocoder/v2/?address=".$addr."&output=json&ak=".$map_ak;
        $result = json_decode(https_curl_json($url,$type='json'),true);
        $data['longitude'] = $result['result']['location']['lng'];
        $data['latitude'] = $result['result']['location']['lat'];

        //$data['birthday'] = isset($_POST['birthday']) ? strtotime($_POST['birthday']) : 0;
        //$data['phone'] = isset($_POST['phone']) ? trim($_POST['phone']) : '';
        //$data['qq'] = isset($_POST['qq']) ? trim($_POST['qq']) : '';
        //$data['email'] = isset($_POST['email']) ? trim($_POST['email']) : '';
        $data['Exist_print']=1;

        $data['t'] = time();
        if (!$uid) {
            if ($user == '') {
                $this->error('用户名称不能为空！');
            }
            if (!$password) {
                $this->error('用户密码不能为空！');
            }
            if (M('member')->where("user='$user'")->count()) {
                $this->error('用户名已被占用！');
            }
            $data['user'] = $user;
            $uid = M('member')->data($data)->add();
            M('auth_group_access')->data(array('group_id' => $group_id, 'uid' => $uid))->add();
            addlog('新增会员，会员UID：' . $uid);
        } else {
            $condition1['group_id']=$group_id;
            $condition['uid']=$uid;
            M('auth_group_access')->where($condition)->save($condition1);
            addlog('编辑会员信息，会员UID：' . $uid);
            M('member')->where($condition)->save($data);

        }
        $this->success('操作成功！');
    }


    public function add()
    {

        $usergroup = M('auth_group')->field('id,title')->select();
        $coin = M('coin')->field('c_id,c_name')->where('is_delete=0')->select();
        $this->assign('usergroup', $usergroup);
        $this->assign('coin',$coin);
        $this->display('form');
    }
}
