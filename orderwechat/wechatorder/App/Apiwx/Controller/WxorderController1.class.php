<?php 
/**
 *
 * 作    者：侯自强 李想
 * 日    期：2018-3-6
 * 版    本：1.0.0
 * 功能说明：微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
class WxorderController extends Controller{
	//商店展示，返回商店信息
	public function getStoreInfo()
	{	
		$uid=I('uid');
		if($uid){
			$data=M('store')->where("groupID=$uid and is_delete=0")->getField('s_id,s_storename,pic_url');
			$url=C('URL');
			$nowTime=time();
			$beforeMonth=strtotime('-1month',$nowTime);
			foreach ($data as $key => $value) {
				$data[$key]['pic_url']=$url.$value['pic_url'];
 				$store=$value['s_id'];
				$goods=M('goods')->where("s_id=$store")->field('g_id')->select();
				$data[$key]['sales']=0;
				foreach ($goods as $k => $value) {
					$condition['goods_id']=$value['g_id'];
					$condition['pay_time']=array('between',array($beforeMonth,$nowTime));
					$sales=M('order_detail')->where($condition)->getField('sum(count)');
					$data[$key]['sales']=$data[$key]['sales']+$sales;
				}
				$data[$key]['score']=10;
			}
			$this->ajaxReturn($data);
		}
		else {
			$this->ajaxReturn('error');
		}
	}
	//商店展示，返回商店信息
	public function getStore()
	{
		$shop_id=I('s_id');
		$data=M('store')->where("s_id=$shop_id")->field('s_id,s_storename,pic_url')->select();
		$url=C('URL');
		$data[0]['pic_url']=$url.$data[0]['pic_url'];
		$this->ajaxReturn($data);
	}
	//展示最近三条未逻辑删除的广告图片
	public function getAd(){
		$picurl=M('ad')->where('is_delete=0')->field('ad_picurl')->order('edit_time desc')->limit(3)->select();
		$url=C('URL');
		foreach ($picurl as $key => $value) {
			$picurl[$key]['ad_picurl']=$url.$value['ad_picurl'];
		}
		$this->ajaxReturn($picurl);
	}
	//搜索框查找档口名称
	public function Search(){
		$searchWords=I('searchWords');
		$search['s_storename']  = array('LIKE','%'.$searchWords.'%');
		$searchResult=M('store')->where($search)->getField('s_id,s_storename,pic_url');
		$url=C('URL');
		$nowTime=time();
		$beforeMonth=strtotime('-1month',$nowTime);
		foreach ($searchResult as $key => $value) {
			$searchResult[$key]['pic_url']=$url.$value['pic_url'];
			$store=$value['s_id'];
			$goods=M('goods')->where("s_id=$store")->field('g_id')->select();
			$searchResult[$key]['sales']=0;
			foreach ($goods as $k => $value) {
				$condition['goods_id']=$value['g_id'];
				$condition['pay_time']=array('between',array($beforeMonth,$nowTime));
				$sales=M('order_detail')->where($condition)->getField('sum(count)');
				$searchResult[$key]['sales']=$searchResult[$key]['sales']+$sales;
			}
			$searchResult[$key]['score']=10;
		}
		$this->ajaxReturn($searchResult);
	}
	//获取当前商家的菜品类型以及该类型对应的菜品信息
	public function getGoods(){
		$s_id=I('s_id');
		if ($s_id) {
			$pack_charge = M('store')->where("s_id=$s_id")->getField('pack_charge');
			$goodsList=M('goodstype')->where("is_delete=0 and s_id=$s_id")->field('gt_id,gt_name')->select();
			$url=C('URL');
			$nowTime=time();
			$beforeMonth=strtotime('-1month',$nowTime);
			foreach ($goodsList as $key => $value) {
				$goodsList[$key]['goods']=M('goods')->where("is_delete=0 and g_type=$value[gt_id]")->field('g_id,g_name,price,pic_url')->select();
				//$goodsList[$key]['goods']['price']=floatval($goodsList[$key]['goods']['price']);
				foreach ($goodsList[$key]['goods'] as $k => $value) {
					//$goodsList[$key]['goods'][$k]
					$goodsList[$key]['goods'][$k]['pic_url']=$url.$value['pic_url'];
					$condition['goods_id']=$goodsList[$key]['goods'][$k]['g_id'];
					$condition['pay_time']=array('between',array($beforeMonth,$nowTime));
					$tempsales = M('order_detail')->where($condition)->getField('sum(count)');
					$goodsList[$key]['goods'][$k]['sales']=$tempsales==null? 0:$tempsales;
					$goodsList[$key]['goods'][$k]['score']=10;
					//$goodsList[$key]['goods'][$k]['price']=sprintf("%.2f",$value['price']);
				}
			}
			$data[0] = $goodsList;
			$data[1]=floatval($pack_charge);
			$this->ajaxReturn($data);
		}
		else{
			$this->ajaxReturn('error');
		}
	}
	//再来一单获取订单信息
	public function getOrder(){
		$o_id=I('o_id');
		if($o_id){
			$order_detail=json_decode(M('order')->where('o_id='.$o_id)->getField('detail'),true);
			$this->ajaxReturn($order_detail);
		}
		else $this->ajaxReturn('error');
	}
	//获取视图
	public function get_uid($s_id){
		$data = M('group_shop_view')->where('s_id = '.$s_id)->select();
		return $data[0]['uid'];
	}
	//商家提交订单
	public function submitOrderByShop()
	{
		if(!IS_POST){
			$return['code'] = 0;
			$this->ajaxReturn($return);
		}
		else{
			//订单json格式转换
			$order_list=I('list');
			$detail=htmlspecialchars_decode($order_list);
			//获取shop_id，order_num
			$shop_id=intval(I('shop_id'));
			$order_num='BK'.date('ymd').time();
			$condition['o_num']=$order_num;
			//$wait_num=make_random(4);
			$open_id = I('open_id');
			//对订单表数据进行操作。
			$data['user_remarks']=I('remarks');
			$data['shop_id']=$shop_id;
			$data['total_money']=floatval(I('total'));
			$data['real_money']=floatval(I('total'));
			$data['goods_count']=I('goods_count');
			$data['sub_time']=time();
			$data['order_status']=1;
			$data['o_num']=$order_num;
			$data['detail']=$detail;
			$data['user_openid'] = $open_id; //需调整
			$data['wait_num']='TS01';
			$data['form_id']=I('form_id');
			if(M('order')->add($data)){
				$id=M('order')->where($condition)->field('o_id')->select();
			}
			//对order_detail表数据库赋值
			$list=json_decode(htmlspecialchars_decode($order_list),true);
			$temp=array();
			$temp['order_num']=$order_num;
			foreach ($list as $key => $value) {
				$temp['goods_name']=$value['goodName'];
				$temp['goods_price']=$value['goodPrice'];
				$temp['count']=$value['count'];
				$temp['sub_total']=$value['count']*$temp['goods_price'];
				$temp['goods_id']=$value['goodId'];
				$temp['is_pack']=$value['is_pack'];
				if(M('order_detail')->add($temp))
					continue;
				else{
					$this->ajaxReturn('订单同步错误');
					break;
				}
			}
			$code['code']=1;
			$this->ajaxReturn($code);
		}	
	}
	//提交订单
	public function submitOrder(){
		if(!IS_POST){
			$this->ajaxReturn("no data post");
		}
		else{
			//订单json格式转换
			$order_list=I('list');
			$detail=htmlspecialchars_decode($order_list);
			//获取shop_id，order_num
			$shop_id=intval(I('shop_id'));
			$order_num='BK'.date('ymd').time();
			$condition['o_num']=$order_num;
			$wait_num=make_random(4);
			$open_id = I('open_id');
			//对订单表数据进行操作。
			$data['user_remarks']=I('remarks');
			$data['shop_id']=$shop_id;
			$data['total_money']=floatval(I('total'));
			$data['goods_count']=I('goods_count');
			$data['sub_time']=time();
			$data['order_status']=0;
			$data['o_num']=$order_num;
			$data['detail']=$detail;
			$data['user_openid'] = $open_id; //需调整
			$data['wait_num']=$wait_num;
			$data['form_id']=I('form_id');
			if(M('order')->add($data)){
				$id=M('order')->where($condition)->field('o_id')->select();
			}
			//对order_detail表数据库赋值
			$list=json_decode(htmlspecialchars_decode($order_list),true);
			$temp=array();
			$temp['order_num']=$order_num;
			foreach ($list as $key => $value) {
				$temp['goods_name']=$value['goodName'];
				$temp['goods_price']=floatval($value['goodPrice']);
				$temp['count']=$value['count'];
				$temp['sub_total']=$value['count']*$temp['goods_price'];
				$temp['goods_id']=$value['goodId'];
				$temp['is_pack']=$value['is_pack'];
				if(M('order_detail')->add($temp))
					continue;
				else{
					$this->ajaxReturn('订单同步错误');
					break;
				}
			}
			$wait_count = $this->seek_wait_num($shop_id,1);
			$code['wait_count'] = $wait_count;
			$code['status']=1;
			$code['food_code']=$wait_num;
			$code['order_id']=$id[0]['o_id'];
			$this->ajaxReturn($code);
		}
	}
	//查询订单状态
	public function confirmPay()
	{
		$condition['o_id']=I('orderId');
		$flag=M('order')->where($condition)->field('order_status,o_num,pay_time')->select();
		$paytime=$flag[0]['pay_time'];
		if($flag[0]['order_status']==0)
		{
		$this->ajaxReturn($flag[0]);
		}
		else{
			$flag[0]['pay_time']=date("Y-m-d H:i:s",$paytime); 
			$this->ajaxReturn($flag[0]);
		}

	}
	//搜索框查找商圈名称
	public function searchGroup(){
		$searchWords=I('searchWords');
		$search['groupname']  = array('LIKE','%'.$searchWords.'%');
		$searchResult=M('member')->where($search)->getField('uid,groupname,head');
		$url=C('URL');
		foreach ($searchResult as $key => $value) {
			$searchResult[$key]['head']=$url.$value['head'];
			// $searchResult[$key]['sales']=100;
			// $searchResult[$key]['score']=10;
		}
		$this->ajaxReturn($searchResult);
	}
	//获取商圈信息
	public function getGroup(){
		// $data=M('member')->where('uid <> 1')->getField('uid,groupname,head');
		// $url=C('URL');
		// $this->ajaxReturn($data);
		$lat = I('latitude');
		$lgt = I('longitude');
		$open_id = I('open_id');
		if($lat && $lgt){
		$sql = $this->get_location_sql($lat,$lgt);
		$data = M()->query($sql);
		}
		elseif ($open_id) {
			$condition['user_openid']=$open_id;
			$condition['order_status'] = 2;
			$shop_id = intval(M('order')->where($condition)->order('pay_time desc')->getField('shop_id'));
			if($shop_id)
			{
				$uid = intval(M('group_shop_view')->where('s_id='.$shop_id)->getField('uid'));
				$location = M('member')->where('uid = '.$uid)->field('longitude,latitude')->select();
				$sql = $this->get_location_sql($location[0]['latitude'],$location[0]['longitude']);
				$data = M()->query($sql);
			}else{
				$data=M('member')->where('uid <> 1&&is_delete=0')->limit(25)->getField('uid,groupname,head,c_id,tax_rate');
			}
		}
		foreach ($data as $key => $value) {
			$c_id=$value['c_id'];
			$coin=M('coin')->where("c_id=$c_id")->getField('c_symbol');
			$data[$key]['coin']=$coin;
			$data[$key]['distance'] = sprintf("%.1f",$value['distance']);
		}
		// foreach ($data as $key => $value) {
		// 	$return_list[$value['uid']] = $value;
		// }

		$this->ajaxReturn($data);
	}
	function get_location_sql($lat, $lgt){
		return $sql = "SELECT uid,groupname,head,c_id,tax_rate,SQRT( POW(111.2 * (latitude - ".$lat."), 2) + POW(111.2 * (".$lgt." - longitude) * COS(latitude / 57.3), 2)) AS distance FROM wo_member HAVING distance < 25 ORDER BY distance asc";
		
	}
	//获取商圈下的数量
	public function get_shop_count(){
		$condition['groupID'] = I('groupId');
		$condition['is_delete'] = 0;
		$data = M('store')->where($condition)->field('s_id')->select();
		$count = count($data);
		if($count == 1){
			$data_return['shop_count_status'] = 1; 
			$data_return['s_id'] = $data[0]['s_id'];
		}
		else{
			$data_return['shop_count_status'] = 0;
		}
		$this->ajaxReturn($data_return);
	}
	//获取未支付订单信息
	public function getOrderSub(){
		//根据用户ID查找订单
		if(I('openid')){
			$openid=I('openid');
			$condition['user_openid']=$openid;
			$condition['order_status']=0;
			$orderList=M('order')->where($condition)->field('o_id,shop_id,goods_count,total_money,wait_num,order_status')->order('sub_time')->select();
			//根据订单中shop_id查找商店信息
			foreach ($orderList as $k => $value) {
				$storeId=$orderList[$k]['shop_id'];
				$storeInfo=M('store')->where("s_id=$storeId")->field('s_storename,pic_url')->select();
				//整合数据列表，包括订单信息（detail字符串整理为数组格式），所在商店的商店名称以及商店图片
				$orderList[$k]['s_storename']=$storeInfo[0]['s_storename'];
				$url=C('URL');
				$orderList[$k]['pic_url']=$url.$storeInfo[0]['pic_url'];
				$orderList[$k]['wait_count'] = $this->seek_wait_num($storeId,1);
				$orderList[$k]['uid'] =$this->get_uid($storeId);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}
	}
	//获取已支付未完成的订单信息
	public function getOrderPay(){
		//根据用户ID查找订单
		if(I('openid')){
			$openid=I('openid');
			$condition['user_openid']=$openid;
			$condition['order_status']=1;
			$orderList=M('order')->where($condition)->field('o_id,shop_id,goods_count,total_money,wait_num,order_status')->order('pay_time')->select();
			//根据订单中shop_id查找商店信息
			foreach ($orderList as $k => $value) {
				$storeId=$orderList[$k]['shop_id'];
				$storeInfo=M('store')->where("s_id=$storeId")->field('s_storename,pic_url')->select();
				//整合数据列表，包括订单信息（detail字符串整理为数组格式），所在商店的商店名称以及商店图片
				$orderList[$k]['s_storename']=$storeInfo[0]['s_storename'];
				$url=C('URL');
				$orderList[$k]['pic_url']=$url.$storeInfo[0]['pic_url'];
				$orderList[$k]['wait_count'] = $this->seek_wait_num($storeId,1,$openid);
				$orderList[$k]['uid'] =$this->get_uid($storeId);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}	
	}
	//获取已完成订单信息
	public function getOrderDone(){
		//根据用户ID查找订单
		$pageindex=intval(I('pageindex'));
		$callback=intval(I('callbackcount'));
		if(I('openid')){
			$min=$callback*($pageindex-1)==0?0:$callback*($pageindex-1);
			$openid=I('openid');
			$condition['user_openid']=$openid;
			$condition['order_status']=2;
			$orderList=M('order')->where($condition)->field('o_id,shop_id,goods_count,total_money,wait_num,order_status')->order('pay_time')->limit($min,$callback)->select();
			//根据订单中shop_id查找商店信息
			foreach ($orderList as $k => $value) {
				$storeId=$orderList[$k]['shop_id'];
				$storeInfo=M('store')->where("s_id=$storeId")->field('s_storename,pic_url')->select();
				//整合数据列表，包括订单信息（detail字符串整理为数组格式），所在商店的商店名称以及商店图片
				$orderList[$k]['s_storename']=$storeInfo[0]['s_storename'];
				$url=C('URL');
				$orderList[$k]['pic_url']=$url.$storeInfo[0]['pic_url'];
				$orderList[$k]['uid'] =$this->get_uid($storeId);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}
	}
	//获取某条订单的详细信息
	public function getOrderDetail(){
		if(IS_GET){
			$o_id=I('o_id');
			$orderDetail=M('order')->where("o_id=$o_id")->select();
			$orderDetail[0]['detail']=json_decode($orderDetail[0]['detail'],true);
			$orderDetail[0]['sub_time']=date("Y-m-d H:i:s",$orderDetail[0]['sub_time']);
			$orderDetail[0]['pay_time']=date("Y-m-d H:i:s",$orderDetail[0]['pay_time']);
			$this->ajaxReturn($orderDetail);
		}
		else{
			$this->ajaxReturn(1);
		}
	}
	//获取登录信息
	public function doLogin(){
		if(IS_GET){
			$code=I('code');
			$flag=I('flag');
			//获取小程序appid和secret
			if($flag){
				$appid=C('APPID_APUSER');
				
				$secret=C('SECRET_USER');
			}
			else{
				$appid=C('APPID_SHOP');
				$secret=C('SECRET_SHOP');
			}
			if(!$appid) 	$this->ajaxReturn('appid获取失败');
			if(!$secret)	$this->ajaxReturn('secret获取失败');
			$api_url="https://api.weixin.qq.com/sns/jscode2session?appid=".$appid."&secret=".$secret."&js_code=".$code."&grant_type=authorization_code";
			$api_return = file_get_contents($api_url);
			$data=json_decode($api_return,true);
			if(!$data)	$this->ajaxReturn('访问接口失败！请检查网络！');
			else{
				if($data['errcode']) $this->ajaxReturn('ErrorCode:'.$data['errcode']);
				else{
						$wx_openid=$data['openid'];
						$condition['open_id']=$data['openid'];
						$user['session_key']=$data['session_key'];
						if(M('user')->where($condition)->find())
						{
							M('user')->where($condition)->save($user);
							$this->ajaxReturn($data);
						}
						else{
							$user['open_id']=$data['openid'];
							if(M('user')->add($user))	$this->ajaxReturn($data);
						}
					}
			}

		}
		else $this->ajaxReturn('No data get!');
	}
	//取消单号
	public function cancelPay()
	{
		$condition['o_id']=I('orderId');
		$order['order_status']=3;
		$flag=M('order')->where($condition)->save($order);
		if(M('order')->where($condition)->getField('order_status')==3){
			$this->ajaxReturn('success');
		}else{
			$this->ajaxReturn('fail');
		}
	}
	//修改密码
	public function changePwd(){
		if(IS_GET){
			$data['s_password'] = password(I('new_pwd'));
			$condition['s_password'] = password(I('pwd'));
			$condition['s_id'] = I('s_id');
			$condition['s_wechatID'] = I('open_id');
			if(M('store')->where($condition)->find()){
				if(M('store')->where($condition)->save($data)){
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
	//查询待付款界面等待人数
	function seek_wait_num($shop_id, $order_status, $open_id){
		//order_status 0未付款 1已付款
		$condition['shop_id'] = $shop_id;
		$condition['order_status'] = $order_status;		
		$order = M('order')->where($condition)->field('user_openid')->order('pay_time asc')->select();
		if($open_id){
		foreach ($order as $key => $value) {
			if($value['user_openid'] == $open_id){
				$index = $key;
				break;
			}
			else $index = 0;
			}
		}
		else{
			$index = count($order);
		}

		return $index;
	}

}
?>