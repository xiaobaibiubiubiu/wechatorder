<?php 
/**
 *
 * 作    者：侯自强 李想
 * 日    期：2018-3-21
 * 版    本：1.0.0
 * 功能说明：商家版微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
use Think\Upload;
use Think\Image;
class WxgoodsupdateController extends Controller{
	//添加菜品类型
	public function addGoodsType(){
		if(I('s_id')){
			if(I('gt_name')){
				$goodsType['gt_name']=I('gt_name');
				$goodsType['s_id']=I('s_id');
				$data=M('goodstype')->add($goodsType);
				$this->ajaxReturn('success');
			}
			else{
				$this->ajaxReturn('no typeName');
			}
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//删除菜品类型
	public function delGoodsType(){
		if(I('gt_id')){
			$g_type=I('gt_id');
			$goods=M('goods')->where("is_delete=0 AND g_type=$g_type")->select();
			if($goods){
				$this->ajaxReturn('havegoods');
			}
			else{
				$del=M('goodstype')->where("gt_id=$g_type")->delete();
				$this->ajaxReturn('success');
			}
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//修改菜品类型
	public function updateGoodsType(){
		if(IS_POST){
			$editFoodType=I('editFoodType');
			$list=json_decode(htmlspecialchars_decode($editFoodType),true);
			foreach ($list as $key => $value) {
				$gt_id=$list[$key]['typeId'];
				$goodsType[$key]['gt_name']=$list[$key]['typeName'];
				$data=M('goodstype')->where("gt_id=$gt_id")->save($goodsType[$key]);
			}
			$this->ajaxReturn('success');
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//查找菜品类型
	public function findGoodsType(){
		if(I('s_id')){
			$s_id=I('s_id');
			$data=M('goodstype')->where("s_id=$s_id AND is_delete=0")->field('gt_id,gt_name')->select();
			$this->ajaxReturn($data);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//增加菜品
	public function addGoods(){
		if(IS_POST){
			//import("Org.Net.UploadFile"); 
			$fileName=$_FILES["pic_url"]["name"];//这样就能够取得上传的文件名  
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
                'savePath'   =>    'attached/'.date('Y')."/".date('m')."/",
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
           		$pic_url= __ROOT__."/Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
           		$data['g_name']=I('g_name');
           		$data['s_id']=I('s_id');
           		$data['price']=I('price');
           		$data['introduce']=I('introduce');
           		$data['pic_url']=$pic_url;
           		$data['edit_time']=time();
           		$data['g_type']=I('g_type');
           		$data['is_delete']=0;
           		$data['accessories']=I('accessories');
           		$taste=$_POST['taste'];
           		$temp='';
           		foreach ($taste as $key =>$value) {
           			if($temp == '')  $temp=$value.',';
           			else if($key==count($taste)-1) $temp=$temp.$value;
           			else $temp=$temp.$value.',';

           		}
           		//图片压缩成缩略图
            	$img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            	$thumb=thumb_img($img_url);
           		$data['taste']=$temp;
           		if(M('goods')->add($data)){
           			$this->ajaxReturn('success');
           		}
            }		
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//删除菜品
	public function delGoods(){
		if(I('g_id')){
			$g_id=I('g_id');
			$data['is_delete']=1;
			$del=M('goods')->where("g_id=$g_id")->save($data);
			$this->ajaxReturn('success');
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//修改菜品
	public function updateGoods(){
		if(IS_POST){
			if(I('flag')){
				//import("Org.Net.UploadFile"); 
				$fileName=$_FILES["pic_url"]["name"];//这样就能够取得上传的文件名  
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
	                'savePath'   =>    'attached/'.date('Y')."/".date('m')."/",
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
					$g_id=I('g_id');
	           		$pic_url= __ROOT__."/Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
	           		$data['g_name']=I('g_name');
	           		//$data['s_id']=I('s_id');
	           		$data['price']=I('price');
	           		$data['introduce']=I('introduce');
	           		$data['pic_url']=$pic_url;
	           		$data['edit_time']=time();
	           		$data['g_type']=I('g_type');
	           		//$data['is_delete']=0;
	           		$data['accessories']=I('accessories');
	           		$taste=$_POST['taste'];
	           		$temp='';
	           		foreach ($taste as $key =>$value) {
	           			if($temp == '')  $temp=$value.',';
	           			else if($key==count($taste)-1) $temp=$temp.$value;
	           			else $temp=$temp.$value.',';
	           		}
	           		//图片压缩成缩略图
            		$img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            		$thumb=thumb_img($img_url);
	           		$data['taste']=$temp;
	           		if(M('goods')->where("g_id=$g_id")->save($data)){
	           			$this->ajaxReturn('success');
	           		}
	            }
			}
			else{
				$g_id=I('g_id');
           		$data['g_name']=I('g_name');
           		//$data['s_id']=I('s_id');
           		$data['price']=I('price');
           		$data['introduce']=I('introduce');
           		$data['edit_time']=time();
           		$data['g_type']=I('g_type');
           		//$data['is_delete']=0;
           		$data['accessories']=I('accessories');
           		$taste=$_POST['taste'];
           		$temp='';
           		foreach ($taste as $key =>$value) {
           			if($temp == '')  $temp=$value.',';
           			else if($key==count($taste)-1) $temp=$temp.$value;
           			else $temp=$temp.$value.',';
           		}
           		$data['taste']=$temp;
           		if(M('goods')->where("g_id=$g_id")->save($data)){
           			$this->ajaxReturn('success');
           		}
			}		
		}
		else{
			$this->ajaxReturn('error');
		}
	}
	
	//获取档口信息
	public function getOwnerInfo(){
		if(IS_GET){
			$condition=I('s_id');
			$sql='select a.s_id,a.s_name,a.s_storename,a.pic_url,a.groupid,b.groupname from wo_store as a left join wo_member as b on a.groupID=b.uid where a.s_id='.$condition;
			
			$data=M('')->query($sql);
			$data[0]['pic_url']="http://localhost".$data[0]['pic_url'];
			$this->ajaxReturn($data[0]);
		}
		else $this->ajaxReturn('No get info');
	} 	

	//获取商圈信息
	public function getTradeAreaInfo(){
		$data=M('member')->field('uid,groupname')->where('uid>1')->select();
		$this->ajaxReturn($data);
	}
	//修改档口信息
	public function updateOwnerInfo(){
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
                'savePath'   =>    '/store/'.date('Y')."/".date('m')."/",
                'saveName'   =>    date("YmdHis"),
                'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
                'rootPath'   =>    './Public/',
                'subName'  =>  array('date', 'd')
            );
		if(IS_POST){
			//如果有图片
			if($_FILES["pic_url"]["name"]){
				if(I('s_id')){
					$s_id = I('s_id');
					$store['s_name'] = I('s_name');
					$store['s_storename'] = I('s_storename');
					$store['groupID'] = I('groupid');
					$store['pack_charge'] = I('pack_charge'); 
					$store['printername']=$list['printername'];
				    $store['printerpsd']=$list['printerpsd'];
					$fileExtensions=strrchr($fileName, '.');
        			//通过对$fileName的处理，就能够取得上传的文件的后缀名  
        			$serverFileName=date("Ymd")."_".mt_rand(); 
					$upload = new Upload($config);// 实例化上传类  
					$upload->maxSize=1048576;// 设置附件上传大小，此处为1M  
					$upload->allowExts=array("jpg","gif","png","jpeg","bmp");// 设置附件上传类型  
					// $upload->savePath=C("GOODSIMAGE");//设置附件上传目录  
				
					// //php基本语法部分开始，主要任务用于截取上传文件，文件名  
					$info=$upload->upload();
					if(!$info) {
						$this->error($upload->getError());
					}
					else{
						$pic_url= __ROOT__."/Public".$info['pic_url']['savepath'].$info['pic_url']['savename'];
						$store['pic_url']=$pic_url;
						//图片压缩成缩略图
            			$img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            			$thumb=thumb_img($img_url);
						if(M('store')->where("s_id=$s_id")->save($store)){
							$this->ajaxReturn('success');
						}
					}
				}
				else{
					$this->ajaxReturn('nos_id');
				}
			}else{
				//没有文字
				$ownerInfo=I('ownerInfo');
				$list=json_decode(htmlspecialchars_decode($ownerInfo),true);
				$s_id=$list['s_id'];
				$store['s_name']=$list['s_name'];
				$store['s_storename']=$list['s_storename'];
				$store['groupID']=$list['groupid'];
				$store['pack_charge'] = $list['pack_charge'];
				$store['printername']=$list['printername'];
				$store['printerpsd']=$list['printerpsd'];
				// $this->ajaxReturn($store);
				if(M('store')->where("s_id=$s_id")->save($store)){
					$this->ajaxReturn('success');
				}
			}
		}else{//没有post
			$this->ajaxReturn('noPOST');
		}
	}

	//修改店铺图标
	public function updateShopIcon(){

		if(IS_POST){
			//import("Org.Net.UploadFile"); 
			$fileName=$_FILES["pic_url"]["name"];//这样就能够取得上传的文件名  
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
                'savePath'   =>    '/store/'.date('Y')."/".date('m')."/",
                'saveName'   =>    date("YmdHis"),
                'exts'       =>    array('jpg', 'gif', 'png', 'jpeg'),
                'rootPath'   =>    './Public/',
                'subName'  =>  array('date', 'd')
            );
			$upload = new Upload($config);// 实例化上传类  
        	$upload->maxSize=1048576;// 设置附件上传大小，此处为1M  
        	$upload->allowExts=array("jpg","gif","png","jpeg","bmp");// 设置附件上传类型  
        	// $upload->savePath=C("GOODSIMAGE");//设置附件上传目录  
          
        	// //php基本语法部分开始，主要任务用于截取上传文件，文件名  
        	 $info=$upload->upload();
            if(!$info) {
                $this->error($upload->getError());
			}
			else{
           		$pic_url= __ROOT__."/Public".$info['pic_url']['savepath'].$info['pic_url']['savename'];
           		//图片压缩成缩略图
            	$img_url="./Public/".$info['pic_url']['savepath'].$info['pic_url']['savename'];
            	$thumb=thumb_img($img_url);
           		$shop_id=I('shopId');
           		$store['pic_url']=$pic_url;
           		if(M('store')->where("s_id=$shop_id")->save($store)){
           			$this->ajaxReturn('success');
           		}
            }
		}else{
			$this->ajaxReturn('error');
		}
	}
}
?>