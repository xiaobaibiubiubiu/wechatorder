<?php 
/**
 *
 * 版权所有：花果山项目组
 * 作    者：侯自强 李想
 * 日    期：2018-4-10
 * 版    本：1.0.0
 * 功能说明：关于销量统计的微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
class WxstatisticController extends Controller{

	//获取今日、近一周、近一个月的销售总额
	public function getGlobalStatistic(){
		if(I('s_id')){
			$shopId=I('s_id');
			$nowTime=time();                            //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));//今日零点时间戳
			$beginWeek=strtotime('-1week');             //近一周起始时间戳
			$beginMonth=strtotime('-1month');           //近一个月起始时间戳
			//今日销售总额
			$todayCondition['shop_id']=$shopId;
			$todayCondition['pay_time']=array('between',array($beginToday,$nowTime));
			$overallSale['todaySale']=M('order')->where($todayCondition)->sum('total_money');
			$overallSale['todaySale']=$overallSale['todaySale']==NULL?'0.00':$overallSale['todaySale'];
			//近一周销售总额
			$weekCondition['shop_id']=$shopId;
			$weekCondition['pay_time']=array('between',array($beginWeek,$nowTime));
			$overallSale['weekSale']=M('order')->where($weekCondition)->sum('total_money');
			$overallSale['weekSale']=$overallSale['weekSale']==NULL?'0.00':$overallSale['weekSale'];
			//近一月销售总额
			$monthCondition['shop_id']=$shopId;
			$monthCondition['pay_time']=array('between',array($beginMonth,$nowTime));
			$overallSale['monthSale']=M('order')->where($monthCondition)->sum('total_money');
			$overallSale['monthSale']=$overallSale['monthSale']==NULL?'0.00':$overallSale['monthSale'];
			$this->ajaxReturn($overallSale);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//获取近一周每天销售总额
	public function getPerWeekSaleMoney(){
		if(I('s_id')){
			$shopId=I('s_id');
			$nowTime=time();                              //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));  //今日零点时间戳
			$beforeToday1=strtotime('-1day',$beginToday); //前一日零点时间戳
			$beforeToday2=strtotime('-2day',$beginToday); //前二日零点时间戳
			$beforeToday3=strtotime('-3day',$beginToday); //前三日零点时间戳
			$beforeToday4=strtotime('-4day',$beginToday); //前四日零点时间戳
			$beforeToday5=strtotime('-5day',$beginToday); //前五日零点时间戳
			$beforeToday6=strtotime('-6day',$beginToday); //前六日零点时间戳
			$timeFrame=array($nowTime,$beginToday,$beforeToday1,$beforeToday2,$beforeToday3,$beforeToday4,$beforeToday5,$beforeToday6);
			//近一周每日销售总额($perWeek['data'],$perWeek['categories'])
			$condition['shop_id']=$shopId;
			$perWeek['data']=array();
			$perWeek['categories']=array();
			for ($i=6; $i >= 0; $i--) { 
				$condition['pay_time']=array('between',array($timeFrame[$i+1],$timeFrame[$i]));
				$sale=M('order')->where($condition)->sum('total_money');
				array_push($perWeek['data'],$sale==NULL?'0.00':$sale);
			}
			for ($j=6; $j >= 0; $j--) { 
				array_push($perWeek['categories'],date("d",$timeFrame[$j+1]).'日');
			}
			$this->ajaxReturn($perWeek);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//获取近六个月每月销售总额
	public function getPerMonthSaleMoney(){
		if(I('s_id')){
			$shopId=I('s_id');
			$nowTime=time();                                //当前时间戳
			$beginMonth=strtotime(date('Y-m',time()));      //本月零点时间戳
			$beforeMonth1=strtotime('-1month',$beginMonth); //前一月零点时间戳
			$beforeMonth2=strtotime('-2month',$beginMonth); //前二月零点时间戳
			$beforeMonth3=strtotime('-3month',$beginMonth); //前三月零点时间戳
			$beforeMonth4=strtotime('-4month',$beginMonth); //前四月零点时间戳
			$beforeMonth5=strtotime('-5month',$beginMonth); //前五月零点时间戳
			$timeFrame=array($nowTime,$beginMonth,$beforeMonth1,$beforeMonth2,$beforeMonth3,$beforeMonth4,$beforeMonth5);
			//近六个月每月销售总额($perMonth['data'],$perMonth['categories'])
			$condition['shop_id']=$shopId;
			$perMonth['data']=array();
			$perMonth['categories']=array();
			for ($i=5; $i >= 0; $i--) { 
				$condition['pay_time']=array('between',array($timeFrame[$i+1],$timeFrame[$i]));
				$sale=M('order')->where($condition)->sum('total_money');
				array_push($perMonth['data'],$sale==NULL?'0.00':$sale);
			}
			for ($j=5; $j >= 0; $j--) { 
				array_push($perMonth['categories'],date("m",$timeFrame[$j+1]).'月');
			}
			$this->ajaxReturn($perMonth);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//获取某菜品今日、近一周、近一个月的销售额
	public function getGoodGlobalStatistic(){
		if(I('g_id')){
			$goodId=I('g_id');
			$nowTime=time();                            //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));//今日零点时间戳
			$beginWeek=strtotime('-1week');             //近一周起始时间戳
			$beginMonth=strtotime('-1month');           //近一个月起始时间戳
			//某菜品今日销售总额
			$todayCondition['goods_id']=$goodId;
			$todayCondition['pay_time']=array('between',array($beginToday,$nowTime));
			$singleFoodSale['todaySale']=M('order_detail')->where($todayCondition)->sum('sub_total');
			$singleFoodSale['todaySale']=$singleFoodSale['todaySale']==NULL?'0.00':$singleFoodSale['todaySale'];
			//某菜品近一周销售总额
			$weekCondition['goods_id']=$goodId;
			$weekCondition['pay_time']=array('between',array($beginWeek,$nowTime));
			$singleFoodSale['weekSale']=M('order_detail')->where($weekCondition)->sum('sub_total');
			$singleFoodSale['weekSale']=$singleFoodSale['weekSale']==NULL?'0.00':$singleFoodSale['weekSale'];
			//某菜品近一月销售总额
			$monthCondition['goods_id']=$goodId;
			$monthCondition['pay_time']=array('between',array($beginMonth,$nowTime));
			$singleFoodSale['monthSale']=M('order_detail')->where($monthCondition)->sum('sub_total');
			$singleFoodSale['monthSale']=$singleFoodSale['monthSale']==NULL?'0.00':$singleFoodSale['monthSale'];
			$this->ajaxReturn($singleFoodSale);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//获取某菜品近一周每天销售额
	public function getGoodWeekSale(){
		if(I('g_id')){
			$goodId=I('g_id');
			$nowTime=time();                              //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));  //今日零点时间戳
			$beforeToday1=strtotime('-1day',$beginToday); //前一日零点时间戳
			$beforeToday2=strtotime('-2day',$beginToday); //前二日零点时间戳
			$beforeToday3=strtotime('-3day',$beginToday); //前三日零点时间戳
			$beforeToday4=strtotime('-4day',$beginToday); //前四日零点时间戳
			$beforeToday5=strtotime('-5day',$beginToday); //前五日零点时间戳
			$beforeToday6=strtotime('-6day',$beginToday); //前六日零点时间戳
			$timeFrame=array($nowTime,$beginToday,$beforeToday1,$beforeToday2,$beforeToday3,$beforeToday4,$beforeToday5,$beforeToday6);
			//某菜品近一周每日销售额($singleFoodWeek['data'],$singleFoodWeek['categories'])
			$condition['goods_id']=$goodId;
			$singleFoodWeek['data']=array();
			$singleFoodWeek['categories']=array();
			for ($i=6; $i >= 0; $i--) { 
				$condition['pay_time']=array('between',array($timeFrame[$i+1],$timeFrame[$i]));
				$sale=M('order_detail')->where($condition)->sum('sub_total');
				array_push($singleFoodWeek['data'],$sale==NULL?'0.00':$sale);
			}
			for ($j=6; $j >= 0; $j--) { 
				array_push($singleFoodWeek['categories'],date("d",$timeFrame[$j+1]).'日');
			}
			$this->ajaxReturn($singleFoodWeek);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//获取某菜品近六个月每月销售额
	public function getGoodMonthSale(){
		if(I('g_id')){
			$goodId=I('g_id');
			$nowTime=time();                                //当前时间戳
			$beginMonth=strtotime(date('Y-m',time()));      //本月零点时间戳
			$beforeMonth1=strtotime('-1month',$beginMonth); //前一月零点时间戳
			$beforeMonth2=strtotime('-2month',$beginMonth); //前二月零点时间戳
			$beforeMonth3=strtotime('-3month',$beginMonth); //前三月零点时间戳
			$beforeMonth4=strtotime('-4month',$beginMonth); //前四月零点时间戳
			$beforeMonth5=strtotime('-5month',$beginMonth); //前五月零点时间戳
			$timeFrame=array($nowTime,$beginMonth,$beforeMonth1,$beforeMonth2,$beforeMonth3,$beforeMonth4,$beforeMonth5);
			//某菜品近六个月每月销售额($singleFoodMonth['data'],$singleFoodMonth['categories'])
			$condition['goods_id']=$goodId;
			$singleFoodMonth['data']=array();
			$singleFoodMonth['categories']=array();
			for ($i=5; $i >= 0; $i--) { 
				$condition['pay_time']=array('between',array($timeFrame[$i+1],$timeFrame[$i]));
				$sale=M('order_detail')->where($condition)->sum('sub_total');
				array_push($singleFoodMonth['data'],$sale==NULL?'0.00':$sale);
			}
			for ($j=5; $j >= 0; $j--) { 
				array_push($singleFoodMonth['categories'],date("m",$timeFrame[$j+1]).'月');
			}
			$this->ajaxReturn($singleFoodMonth);
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//按时间段查找销量前五、后五的菜品
	//period_id: 0, periodName: '今日' 
    //period_id: 1, periodName: '近一周' 
    //period_id: 2, periodName: '近一个月' 
    //period_id: 3, periodName: '近六个月'
    //saleStatus：0，销量前五
    //saleStatus：1，销售额前五
    //saleStatus：2，销量后五
    //saleStatus：3，销售额后五
	public function getBwSale(){
		if(I('s_id')){
			$shopId=I('s_id');
			$periodId=I('period_id');
			$saleStatus=I('saleStatus');
			$nowTime=time();                              //当前时间戳
			$beginToday=strtotime(date('Y-m-d',time()));  //今日零点时间戳
			$beforeWeek=strtotime('-1week',$nowTime);     //一周前时间戳
			$beforeMonth=strtotime('-1month',$nowTime);   //一个月前时间戳
			$beforeMonth6=strtotime('-6month',$nowTime);  //六个月前时间戳
			//按时间段查找销量前五的菜品($bw_goods['data'],$bw_goods['categories'])
			//按档口ID查找所有菜品
			$goodId=M('goods')->where("s_id=$shopId")->getField('g_id',true);
			$condition['goods_id'] = array('in', $goodId);
			switch ($periodId){
				case 0:
				  $condition['pay_time'] = array('between',array($beginToday,$nowTime));
				  break;
				case 1:
				  $condition['pay_time'] = array('between',array($beforeWeek,$nowTime));
				  break;
				case 2:
				  $condition['pay_time'] = array('between',array($beforeMonth,$nowTime));
				  break;
				case 3:
				  $condition['pay_time'] = array('between',array($beforeMonth6,$nowTime));
				  break;
				default:
				  $condition['pay_time'] = array('between',array($beginToday,$nowTime));
			}
			$bw_goods['data']=array();
			$bw_goods['categories']=array();
			switch ($saleStatus) {
				case 0:
					$sale=M('order_detail')->where($condition)->field("goods_name,sum(count)")->group('goods_id')->order('sum(count) desc')->limit(5)->select();
					//存进数组
					$bw_goods['title']='销量前五的菜品及销量';
					$bw_goods['status']='销量';
					$bw_goods['unit']='份';
					for ($i=0; $i < 5; $i++) { 
						array_push($bw_goods['data'],$sale[$i]['sum(count)']==NULL?'0.00':$sale[$i]['sum(count)']);
						array_push($bw_goods['categories'],$sale[$i]['sum(count)']==NULL?'暂无':$sale[$i]['goods_name']);
					}
					break;
				case 1:
					$sale=M('order_detail')->where($condition)->field("goods_name,sum(sub_total)")->group('goods_id')->order('sum(sub_total) desc')->limit(5)->select();
					//存进数组
					$bw_goods['title']='销售总额前五的菜品及销售额';
					$bw_goods['status']='销售额';
					$bw_goods['unit']='元';
					for ($i=0; $i < 5; $i++) {
						array_push($bw_goods['data'],$sale[$i]['sum(sub_total)']==NULL?'0.00':$sale[$i]['sum(sub_total)']);
						array_push($bw_goods['categories'],$sale[$i]['sum(sub_total)']==NULL?'暂无':$sale[$i]['goods_name']);
					}
					break;
				case 2:
					$sale=M('order_detail')->where($condition)->field("goods_name,sum(count)")->group('goods_id')->order('sum(count)')->limit(5)->select();
					//存进数组
					$bw_goods['title']='有销量菜品中销量末五菜品及销量';
					$bw_goods['status']='销量';
					$bw_goods['unit']='份';
					for ($i=0; $i < 5; $i++) { 
						if($sale[$i]['sum(count)']){
							array_push($bw_goods['data'],$sale[$i]['sum(count)']);
							array_push($bw_goods['categories'],$sale[$i]['goods_name']);
						}	
					}	
					break;
				case 3:
					$sale=M('order_detail')->where($condition)->field("goods_name,sum(sub_total)")->group('goods_id')->order('sum(sub_total)')->limit(5)->select();
					//存进数组
					$bw_goods['title']='有销量菜品中销售总额末五菜品及销售额';
					$bw_goods['status']='销售额';
					$bw_goods['unit']='元';
					for ($i=0; $i < 5; $i++) { 
						if($sale[$i]['sum(sub_total)']){
							array_push($bw_goods['data'],$sale[$i]['sum(sub_total)']);
							array_push($bw_goods['categories'],$sale[$i]['goods_name']);
						}	
					}
					break;
				default:
					$sale=M('order_detail')->where($condition)->field("goods_name,sum(count)")->group('goods_id')->order('sum(count) desc')->limit(5)->select();
					//存进数组
					$bw_goods['title']='销量前五的菜品及销量';
					$bw_goods['status']='销量';
					$bw_goods['unit']='份';
					for ($i=0; $i < 5; $i++) { 
						array_push($bw_goods['data'],$sale[$i]['sum(count)']==NULL?'0.00':$sale[$i]['sum(count)']);
						array_push($bw_goods['categories'],$sale[$i]['sum(count)']==NULL?'暂无':$sale[$i]['goods_name']);
					}
					break;
			}
			$this->ajaxReturn($bw_goods);
		}
		else{
			$this->ajaxReturn('error');
		}
	}
	
	//获取0销量的菜品
	public function getZeroSale(){
		if(I('s_id')!=0){
			$s_id=I('s_id');
			$sql="select a.g_id,a.g_name,a.s_id,a.price,a.introduce,a.pic_url,a.g_type,b.gt_name from wo_goods as a inner join wo_goodstype as b on a.g_type=b.gt_id where a.s_id=".$s_id;
			$goods=M('')->query($sql);
			if($goods){
			$goods_id=array();
			foreach ($goods as $key => $value) {
				array_push($goods_id, $value['g_id']);
			}
			$condition['goods_id']=array('in',$goods_id);
			$order_detail=M('order_detail')->distinct(true)->where($condition)->order('goods_id asc')->getField('goods_id',true);
			if($order_detail==null) $result=$goods_id;				//判断所有菜品都没有卖出去，主要是解决初始化销量统计的问题
			else $result=array_diff($goods_id, $order_detail);
			$zeroSale=array();
			foreach ($goods as $k => $value1) {
				foreach ($result as $key => $value2) {
					if($value1['g_id']==$value2)
					{
						array_push($zeroSale,$value1);
					}
				}
			}
			if($zeroSale)	$this->ajaxReturn($zeroSale);
			else $this->ajaxReturn(1);                         //表示没有销量为0的数据
			}
			else $this->ajaxReturn('nogoods');		
		}else $this->ajaxReturn('error');
	}
}
?> 