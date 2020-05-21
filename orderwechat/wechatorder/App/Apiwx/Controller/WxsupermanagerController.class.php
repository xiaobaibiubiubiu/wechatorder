<?php 
/**
 *
 * 作    者：李想
 * 日    期：2018-9-21
 * 版    本：1.0.0
 * 功能说明：商圈端微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
class WxsupermanagerController extends Controller{

	//1.用户登录接口
	//接口名称：bindBusinessArea
	//所传数据：open_id 、user_name 、 password
	//接收数据：（为u_id、0、errorbind、psderror）

	public function bindBusinessArea(){
		$open_id=I('open_id');
		$condition['user']=I('user_name');
		$condition['password']=password(I('password'));
		$condition['is_delete']=0;
		$condition['uid']=array('gt',1);;
		$data=M('member')->where($condition)->find();
		if($data != NULL){
			if($data['open_id']==''){
				$u_id=$data['uid'];
				$temp['open_id'] = $open_id;
				if(M('member')->where('uid='.$u_id)->save($temp)){
					$this->ajaxReturn($u_id);
				}
				else $this->ajaxReturn(0);//绑定失败
			}
			else{
				$this->ajaxReturn('errorbind'); //该用户已绑定，请原用户先解绑
				}
		}
		else $this->ajaxReturn('psderror');//账号不存在，或密码错误
	}

	//2.判断加载界面：
	//接口名称：bindJudgeLogin
	//所传数据：open_id 
	//接收数据：u_id(商圈id)

	public function bindJudgeLogin(){
		$open_id=I('open_id');
		if($open_id=='') $this->ajaxReturn('error');
		else{
			$condition['open_id']=$open_id;
			$condition['is_delete']=0;
			$u_id=M('member')->where($condition)->getField('uid');
			if(!empty($u_id)){
				$this->ajaxReturn($u_id);
			}else $this->ajaxReturn(0);
		}
	}

	//3.实时销量界面

	/*(1).<1>.总体统计（销量、销售额、单数）接口
	接口名称：getDayGlobalStatistic
	所传数据：u_id
	接收数据：saleVolume(截止到现在今日销量)
			 saleMoney（截止到现在今日销售额）
			 saleNumber（截止到现在今日接单数）*/
	public function getDayGlobalStatisitic(){
		if(I('u_id')){
			$uid=I('u_id');
			$nowTime=time();                            //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));//今日零点时间戳
			//商圈内包含的商家
			$condition['groupID']=$uid;
			$condition['is_delete']=0;
			$shopId=M('store')->where($condition)->field('s_id')->select();
			//dump(count($shopId));die;
			//今日销量、销售额及接单数
			for($i=0;$i<count($shopId);$i++){
				//销量，销售额
				$todayCondition['shop_id']=$shopId[$i]['s_id'];
				$todayCondition['pay_time']=array('between',array($beginToday,$nowTime));
				$singleShop['saleVolume']=M('order')->where($todayCondition)->count();
				$singleShop['saleMoney']=M('order')->where($todayCondition)->sum('total_money');
				$singleShop['saleMoney']=$singleShop['saleMoney']==NULL?'0.00':$singleShop['saleMoney'];
				$data['saleVolume']=$data['saleVolume']+$singleShop['saleVolume'];
				$data['saleMoney']=$data['saleMoney']+$singleShop['saleMoney'];
				//接单数
				$map['shop_id']=$shopId[$i]['s_id'];
				$map['sub_time']=array('between',array($beginToday,$nowTime));
				$singleShop['saleNumber']=M('order')->where($map)->count();
				$data['saleNumber']=$data['saleNumber']+$singleShop['saleNumber'];
			}
			$this->ajaxReturn($data);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	/*(1).<2>.到目前为止各个窗口今日销售量接口
		接口名称：getPerDaySaleVolume
		所传数据：u_id
		接收数据：categories ["窗口1", "窗口2", 。。。]（所有有数据所对应的窗口）
               data ["100", "500", ….] (每个窗口所对应的销量)*/
    public function getPerDaySaleVolume(){
		if(I('u_id')){
			$uid=I('u_id');
			$nowTime=time();                            //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));//今日零点时间戳
			//商圈内包含的商家
			$condition['groupID']=$uid;
			$condition['is_delete']=0;
			$shopId=M('store')->where($condition)->field('s_id')->select();
			//到目前为止各个窗口今日销售量
			for($i=0;$i<count($shopId);$i++){
				$s_id=$shopId[$i]['s_id'];
				$shopName=M('store')->where("s_id=$s_id")->getField('s_storename');
				$todayCondition['shop_id']=$s_id;
				$todayCondition['pay_time']=array('between',array($beginToday,$nowTime));
				$singleShopVolume["$shopName"]=M('order')->where($todayCondition)->count();
			}
			$this->ajaxReturn($singleShopVolume);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	/*(1).<3>.到目前为止各个窗口的销售额接口
		接口名称：getPerDaySaleMoney
		所传数据：u_id	
		接收数据：categories ["窗口1", "窗口2", 。。。]（所有有数据所对应的窗口）
                 data ["100", "500", ….] (每个窗口所对应的销售额)*/
    public function getPerDaySaleMoney(){
		if(I('u_id')){
			$uid=I('u_id');
			$nowTime=time();                            //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));//今日零点时间戳
			//商圈内包含的商家
			$condition['groupID']=$uid;
			$condition['is_delete']=0;
			$shopId=M('store')->where($condition)->field('s_id')->select();
			//到目前为止各个窗口今日销售量
			for($i=0;$i<count($shopId);$i++){
				$s_id=$shopId[$i]['s_id'];
				$shopName=M('store')->where("s_id=$s_id")->getField('s_storename');
				$todayCondition['shop_id']=$s_id;
				$todayCondition['pay_time']=array('between',array($beginToday,$nowTime));
				$singleShopMoney["$shopName"]=M('order')->where($todayCondition)->sum('total_money');
				$singleShopMoney["$shopName"]=$singleShopMoney["$shopName"]==NULL?'0.00':$singleShopMoney["$shopName"];
			}
			$this->ajaxReturn($singleShopMoney);
		}
		else{
			$this->ajaxReturn('error');
		}
	}


	//5.关于我们界面
	//(1)解除绑定接口：
	//接口名称：unbindingBusinessArea
	//所传数据：open_id 、 u_id
	//接收数据: 同商家端
	public function unbindingBusinessArea(){
		$open_id=I('open_id');
		$uid=I('u_id');
		$data=M('member')->where("uid=$uid")->find();
		if(!$data['open_id']==''){
			if($data['open_id']==$open_id){
				$map['open_id']='';
				$unbinding=M('member')->where("uid=$uid")->save($map);
				$this->ajaxReturn('success');
			}
			else{
				$this->ajaxReturn('wrong'); //不是绑定的该用户
			}
		}
		else{
			$this->ajaxReturn('error'); //没有绑定用户
		}
	}

	//(2)修改密码接口：
	//接口名称：changePassword
	//所传数据：open_id 、 u_id 、pwd
	//接收数据：和商家端端返回参数逻辑相同

	public function changePassword(){
		if(IS_GET){
			$data['password'] = password(I('new_pwd'));
			$condition['password'] = password(I('pwd'));
			$condition['uid'] = I('u_id');
			$condition['open_id'] = I('open_id');
			if(M('member')->where($condition)->find()){
				if(M('member')->where($condition)->save($data)){
					$this->ajaxReturn(1);  //修改成功
				}else{
					$this->ajaxReturn(2);  //修改失败
				}
			}else{
				$this->ajaxReturn(3);//密码错误
			}
		}
		else{
			$this->ajaxReturn(0); //后台未接到前台传值
		}
	}

}
?>