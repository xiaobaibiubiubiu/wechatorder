<?php 
/**
 *
 * 版权所有：花果山项目组
 * 作    者：侯自强
 * 日    期：2018-3-2
 * 版    本：1.0.0
 * 功能说明：商家管理控制器
 *
 **/

namespace Qwadmin\Controller;
use Think\Upload;
use Think\Image;
class GoodsController extends ComController{
	
	//菜品列表
	public function GoodsList(){
		$data=M('goods')->where('is_delete=0')->select();
		$this->assign('list',$data);
		$this->display();
	}
	
	//选择菜品类型
	public function selectGoodsType(){
		$s_id=I('s_id');
		$temp=M('goodstype')->where("s_id=$s_id")->field('gt_id,gt_name,s_id as judge_id')->select();
		$this->ajaxReturn($temp);
	}

	
	//添加菜品
	public function AddGoods(){
		$store=M("store")->where('is_delete=0')->select();
		foreach ($store as $key => $value) {
			// $temp=M('goodstype')->where
			$condition['s_id']=$value['s_id'];
			$condition['is_delete'] = 0;
			$temp=M('goodstype')->where($condition)->field('gt_id,gt_name,s_id as judge_id')->select();
			$store[$key]['goodstype']=$temp;
		}
		$type=M("goodstype")->where('is_delete=0')->select();
		$tastetype=M("tastetype")->select();
		$this->assign('list',$store);
		$this->assign('ttype',$tastetype);
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
               		$data['s_id']=I('store');
               		$data['price']=I('price');
               		$data['introduce']=I('introduce');
               		$data['pic_url']=$pic_url;
               		$data['edit_time']=time();
               		$data['g_type']=I('goodstype');
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
            		//if($thumb)dump("压缩成功呦，亲么么哒");
            		//else dump("压缩失败啦啦啦");
               		$data['taste']=$temp;
               		if(M('goods')->add($data)){
               			$this->success('添加成功！');
               		}


			}		
		}
		else{
		$this->display();
	}
}

	//菜品类型
	public function GoodsType(){
		$sql="select a.*,b.* from wo_goodstype a left join wo_store b on a.s_id=b.s_id";
		$data=M()->query($sql);
		$this->assign('list',$data);
		$this->display();
	}

	//添加菜品类型
	public function AddGoodsType(){
		//获取商家数据
		$data=M('store')->where('is_delete = 0')->select();
		$this->assign('s_list',$data);
		if(IS_POST)
		{		
			$temp['gt_name']=I('gt_name');	
			$temp['s_id']=I('s_id');
			if(M('goodstype')->where($temp)->find())
			{
				$this->error("此商品类型重复，请重新输入！");
			}
			else{
				$temp['is_delete']=0;
				M('goodstype')->add($temp);
				$this->success("添加成功！",'GoodsType');
			}
		}
		else{
		$this->display();
		}
	}

	//商品规格类型
	public function TasteType(){
		$data=M('tastetype')->select();
		$this->assign('list',$data);
		$this->display();
	}

	//添加商品详细规格
	public function AddTaste(){
		$data=M('tastetype')->select();
		$this->assign('tt_list',$data);
		if(IS_POST)
		{		
			$temp['t_name']=I('t_name');	
			if(M('taste')->where($temp)->find())
			{
				$this->error("此详细规格已存在，请重新输入！");
			}
			else{
				$temp['t_type']=I('t_type');
				$temp['is_delete']=0;
				M('taste')->add($temp);
				$this->success("添加成功！",'TasteType');
			}
		}
		else{
		$this->display();
		}
	}

	//添加商品总规格
	public function AddTasteType(){
		if(IS_POST){
			$data['tt_name']=I("tt_name");
			if(M('tastetype')->where($data)->find())
			{
				$this->error("此规格已存在，请重新输入！");
			}else{
				$data['is_delete']=0;
				if(M('tastetype')->add($data)){
					$this->success("添加成功！",'TasteType');
				}
				else{
				$this->error("添加失败！");
				}
			}
		}
		else{
			$this->display();
		}
	}
	//删除菜品
	public function GoodsTypeDel(){
		$id = I('ttid');
		$data['is_delete'] = 1;
		$condition['g_id'] = $id;
		$flag = M('goods')->where($condition)->save($data);
		if($flag == 1){
			$this->success('删除成功！');
		}
		else{
			$this->error('删除失败！');
		}
	}
}


 ?>