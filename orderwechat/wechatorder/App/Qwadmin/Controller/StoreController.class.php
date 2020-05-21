<?php
/**
 *
 * 版权所有：花果山项目组
 * 作    者：李想
 * 日    期：2018-03-05
 * 版    本：1.0.0
 * 功能说明：商家管理
 *
 **/

namespace Qwadmin\Controller;
use Think\Upload;
use Think\Image;
class StoreController extends ComController
{   //测试打印机成功与否
     public function bindPrinter(){
       if(IS_AJAX){
            $access_token=get_printer_access_token();
            $client_id=C('CLIENT_ID');
            $machine_code=I('printername');
            $msign=I('printerpsd');
            $timestamp=time();
            $sign=getSign($timestamp);
            $id=uuid4();
            $post_url = "https://open-api.10ss.net/printer/addprinter";
            $post_data=array(
                    'client_id' =>$client_id,
                    'machine_code'=>$machine_code,
                    'msign'=>$msign,
                    'access_token'=>$access_token,
                    'sign'=>$sign,
                    'id'=>$id,
                    'timestamp' => $timestamp
                );
                $response = json_decode(https_curl_json($url=$post_url,$data=http_build_query($post_data)),true);
                $this->ajaxReturn($response);   
      }
     }




    //获取商圈有无打印机
    public function Existprint()
    {
        $uid=session('uid');
        $print = M("member")->field('Exist_print')->where("uid = ".$uid)->find();
    
            $this->assign('print',$print);
    }


    
    //商家列表
    public function StoreList()
    {
        $uid = session('uid');
        $condition['groupID'] = $uid;
        $condition['is_delete'] = 0;
        $list = M('store')->where($condition)->order('s_id')->select();
        $this->assign('list',$list);// 赋值数据集
        $this->display(); // 输出模板
    }

    //添加商家
    public function AddStore()
    {
        if(IS_POST){
            $data['s_name'] = isset($_POST['s_name']) ? htmlspecialchars($_POST['s_name'], ENT_QUOTES) : '';
            $data['s_storename'] = isset($_POST['s_storename']) ? htmlspecialchars($_POST['s_storename'], ENT_QUOTES) : '';
            $s_password = isset($_POST['s_password']) ? trim($_POST['s_password']) : false;
            if ($s_password) {
                $data['s_password'] = password($s_password);
            }
            //测试数据库能否写入数据
            $data['printername']=isset($_POST['printername'])?trim($_POST['printername']):false;
            $data['printerpsd']=isset($_POST['printerpsd'])?trim($_POST['printerpsd']):false;
            if($data['printername']&&$data['printerpsd']!=NULL){
                $data['is_print']=1;
            }
            else{
                $data['is_print']=0;
            }
            $uid = session('uid');
            $data['groupID'] = $uid;
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
                'savePath'   =>    'store/'.date('Y')."/".date('m')."/",
                'saveName'   =>    date("YmdHis"),
                'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
                'rootPath'   =>    './Public/',
                'subName'  =>  array('date', 'd')
            );
            $upload = new Upload($config);// 实例化上传类  
            $info=$upload->upload();
            if(!$info){ 
                //捕获上传异常 
                $this->error($upload->getError()); 
            } 
            else{ 
                $pic_url= __ROOT__."/Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            } 
            //图片压缩成缩略图
            $img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            $thumb=thumb_img($img_url);
            $data['pic_url'] = $pic_url ? $pic_url : '';
            $s = M('store')->data($data)->add();
            addlog('新增会员，会员UID：' . $s);
            $this->success('操作成功！','StoreList');
        }
        else
            $this->display();
    }

    //删除商家
     public function DelStore()
    {
        $s_id = I('s_id');
        $data['is_delete']=1;
        $del = M('store')->where("s_id=$s_id")->save($data);
        $this->success('删除成功！');
    }
    //更新商家信息
    public function UpdateStore(){
        $condition['s_id']=I('s_id');
        $result=M('store')->where($condition)->find();
        $this->assign('res',$result);
        $this->display();

    }
      //更新商家信息(佳佳版)
    public function ModifyStore(){
        $condition['s_id']=I('s_id');
        $result=M('store')->where($condition)->find();
        $this->assign('res',$result);
        $this->display();
    }
    //更新商家信息
    public function SubModifyStore()
    {
        if(IS_POST){
            $condition['s_id']=I('s_id');
            $data['s_name'] = isset($_POST['s_name']) ? htmlspecialchars($_POST['s_name'], ENT_QUOTES) : '';
            $data['s_storename'] = isset($_POST['s_storename']) ? htmlspecialchars($_POST['s_storename'], ENT_QUOTES) : '';
            $s_password = isset($_POST['s_password']) ? trim($_POST['s_password']) : false;
            $condtion1['s_id']=I('s_id');
            $condtion1['s_password']=I('s_password');
            //如果没改变就不加密
        
            $pw=M('store')->where($condtion1)->find();
            //dump($pw);
           if($pw !=NULL){
                $data['s_password']=$s_password;
               // dump($data['s_password']);
        
           }
           else{
                $data['s_password'] = password($s_password);
            }
            //测试数据库能否写入数据
            $data['printername']=isset($_POST['printername'])?trim($_POST['printername']):false;
            $data['printerpsd']=isset($_POST['printerpsd'])?trim($_POST['printerpsd']):false;
            if($data['printername']&&$data['printerpsd']!=NULL){
                $data['is_print']=1;
            }
            else{
                $data['is_print']=0;
            }
            $uid = session('uid');
            $data['groupID'] = $uid;
            $image1=isset($_POST['img']) ? intval($_POST['img']) : false;
             if($image1==0){
            $o_pic_url=I('o_pic_url');
             $data['pic_url']=$o_pic_url;
           //dump($data['pic_url']);
        } 
           else{
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
                'savePath'   =>    'store/'.date('Y')."/".date('m')."/",
                'saveName'   =>    date("YmdHis"),
                'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
                'rootPath'   =>    './Public/',
                'subName'  =>  array('date', 'd')
            );
            $upload = new Upload($config);// 实例化上传类  
            $info=$upload->upload();
            if(!$info){ 
                //捕获上传异常 
                $this->error($upload->getError()); 
            } 
            else{ 
                $pic_url= __ROOT__."/Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            } 
            //图片压缩成缩略图
            $img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            $thumb=thumb_img($img_url);
            $data['pic_url'] = $pic_url ? $pic_url : '';
        }
            
            M('store')->where($condition)->save($data);
            $d=M('store')->where($data)->select();
            //dump($d);
            if($d){
            //addlog('新增会员，会员UID：' . $s);
            $this->success('修改成功！','StoreList');
            //$this->redirect('Qwadmin/Store/StoreList');
        }
            else $this->error('修改失败');
        
        }
        else
            $this->display();
    }
}