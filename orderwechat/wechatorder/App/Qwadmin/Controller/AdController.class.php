<?php 
/**
 *
 * 版权所有：花果山项目组
 * 作    者：侯自强
 * 日    期：2018-3-6
 * 版    本：1.0.0
 * 功能说明：商家管理控制器
 *
 **/
namespace Qwadmin\Controller;
use Think\Upload;
class AdController extends ComController{
	public function AddAd()
	{
		if(IS_POST){
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
                'savePath'   =>    'ads/'.date('Y')."/".date('m')."/",
                'saveName'   =>    date("YmdHis"),
                'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
                'rootPath'   =>    './Public/',
                'subName'  =>  array('date', 'd')
            );
			$upload = new Upload($config);// 实例化上传类  
        	// $upload->maxSize=1048576;// 设置附件上传大小，此处为1M  
        	// $upload->allowExts=array("jpg","gif","png","jpeg","bmp");// 设置附件上传类型  
        	// $upload->savePath=C("GOODSIMAGE");//设置附件上传目录  
          
        	// //php基本语法部分开始，主要任务用于截取上传文件，文件名  
        	 $info=$upload->upload();
            if(!$info) {
                $this->error($upload->getError());
			}
			else{
               		$pic_url= __ROOT__."/Public/".$info['ad_picurl']['savepath'].$info['ad_picurl']['savename'];
               		$data['ad_title']=I('ad_title');
               		$data['ad_text']=I('ad_text');
               		$data['ad_picurl']=$pic_url;
               		$data['edit_time']=time();
               		$data['is_delete']=0;
               		if(M('ad')->add($data)){
               			$this->success('添加成功！');
               		}


			}		
		}
		else{
		$this->display();
	}
	}


	public function AdList()
	{
		$data=M('ad')->select();
		$this->assign('list',$data);
		$this->display();
    //$time=time();
    //var_dump($time);
    //$sign=md5("1072629201".$time."59a6fbc5c27dc015ae48902e3b3cfde4");
    //var_dump($sign);
	}
}


 ?>