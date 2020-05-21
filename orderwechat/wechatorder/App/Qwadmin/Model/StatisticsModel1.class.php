<?php 
namespace Qwadmin\Model;
use Think\Model;

class StatisticsModel extends Model{

	//Don't delete the init function,it may cause some unbelivable errors
	 public function __construct(){

    }

    //获取档口信息
	public function getStore(){
      $uid = $_SESSION["uid"];
      $stores=M('store')->where('groupID='.$uid)->field('s_id,s_storename')->select();
      return $stores;
    }

    //获取销量的分店 1为最差 0为最好
    public function getCountStore(){
    	$store=M('store')->where('groupID='.$_SESSION['uid'])->getField('s_id,s_storename',true);
    	foreach ($store as  $key=>$value) {
    		$stores[]=$key;
    	}
    	$nowtime=time();
		$beforeMonth=strtotime('-1month',$nowtime);   //一个月前时间戳
		$condition['pay_time']=array('between',array($beforeMonth,$nowtime));
		$condition['shop_id']=array('in',$stores);
		$best_store=M('order')->where($condition)->field('sum(goods_count),shop_id')->group('shop_id')->order('sum(goods_count) desc')->limit(1)->select();
		$worst_store=M('order')->where($condition)->field('sum(goods_count),shop_id')->group('shop_id')->order('sum(goods_count) asc')->limit(1)->select();
		foreach ($worst_store as $value) {
			$temp[]=$value['shop_id'];
		}
		$worst=array_diff($stores,$temp);
		$result[0]=$store[$best_store[0]['shop_id']];
		$result[1]=$store[$worst[1]];
		return $result;
    }


    //根据销量查询一个月的菜品 1为最差 0为最好
    public function getCount($stores)
    {
    	$nowtime=time();
		$beforeMonth=strtotime('-1month',$nowtime);   //一个月前时间戳
		$condition['pay_time']=array('between',array($beforeMonth,$nowtime));
    	$dish=array();
    	$goods=array();
    	foreach ($stores as $value) {
    		$good=[];
    		$goods=[];
    		$goods=M('goods')->where('s_id='.intval($value['s_id']))->getField('g_id',true);
    		foreach ($goods as $key => $value) {
    			$good[]=intval($value);
    		}
    		if(empty($good)) continue;
    		$condition['goods_id']=array('in',$good);
    		$best_temp=M('order_detail')->where($condition)->field('sum(count),goods_name')->group('goods_id')->order('sum(count) desc')->limit(1)->select();
    		$worst_temp=M('order_detail')->where($condition)->field('goods_name,sum(count)')->group('goods_id')->order('sum(count) asc')->limit(1)->select();
    		if(empty($dish)) {
    			$dish[0]=$best_temp[0];	
    			$dish[1]=$worst_temp[0];
    		}
    		else if($dish[0]['sum(count)'] < $best_temp[0]['sum(count)']) $dish[0]=$best_temp[0];
    		else if($dish[1]['sum(count)'] > $worst_temp[0]['sum(count)']) $dish[1]=$worst_temp[1];
 		}
    	return $dish;
    }

    //按销量计算销量前10的档口 1为剩余的菜品
    public function getCountPie(){
		$store=M('store')->where('groupID='.$_SESSION['uid'])->getField('s_id,s_storename',true);
		$length=count($store);
		$limit=intval($length/10*9);
    	foreach ($store as  $key=>$value) {
    		$stores[]=$key;
    	}
    	$nowtime=time();
		$beforeMonth=strtotime('-1month',$nowtime);   //一个月前时间戳
		$condition['pay_time']=array('between',array($beforeMonth,$nowtime));
		$condition['shop_id']=array('in',$stores);
		$best_store=M('order')->where($condition)->field('sum(goods_count) as sum,shop_id')->group('shop_id')->order('sum(goods_count) desc')->limit($limit)->select();
		$extra_store=M('order')->where($condition)->field('sum(goods_count) as sum,shop_id')->group('shop_id')->order('sum(goods_count) desc')->limit($limit,$length)->select();
		foreach ($best_store as $key => $value) {
			$best_store[$key]['store_name']=$store[$value['shop_id']];
		}
		$result[0]=$best_store;
		if(empty($extra_store)){
			$result[1]['sum']=0;
		} 
		else{
			$num=0;
			foreach ($extra_store as $key => $value) {
				$num+=intval($value['sum']);
			}
			$result[1]['sum']=$num;
		}
		return $result;
    }


    //档口页面接口
      /**
   * 右侧获取档口总计销售详情
   */
  public function getDetailByHotel($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(count) DESC,count DESC
    ";
    $ret = M("")->query($sql);
    return $ret;
  }

   /**
   * 按查询时间获取右侧分店总计销售详情(销量降序)
   */
  public function searchDetailByNumDE($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(count) DESC,count DESC
    ";
    $ret = M("")->query($sql);
    return $ret;
  }

   /**
   * 按查询时间获取右侧分店总计销售详情(销量升序)
   */
  public function searchDetailByNumA($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(count) ASC,count ASC
    ";
    $ret = M("")->query($sql);
    return $ret;
  }

   /**
   * 按查询时间获取右侧分店总计销售详情(销售额降序)
   */
  public function searchDetailByTotalDE($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(total) DESC,total DESC
    ";
    $ret = M("")->query($sql);
    return $ret;
  }

   /**
   * 按查询时间获取右侧分店总计销售详情(销售额升序)
   */
  public function searchDetailByTotalA($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(total) ASC,total ASC
    ";
    $ret = M("")->query($sql);
    return $ret;
  }

  /**
   * 按查询时间获取销量前五
   */
  public function firstFiveByHotel($s_id,$startTime,$endTime){  
    $prefix = C('DB_PREFIX');
    $sql =
    "
      SELECT g.g_id, g.g_name, g.price, IFNULL(temp.count,'0') count, IFNULL(g.price*count,'0') total 
      FROM( 
            SELECT g.g_id,g.g_name,g.price,SUM(count) count
            FROM {$prefix}goods g
            LEFT JOIN {$prefix}order_detail od ON g.g_id = od.goods_id
            WHERE pay_time BETWEEN $startTime AND $endTime
            GROUP BY g.g_id
          ) AS temp
      RIGHT JOIN {$prefix}goods g ON g.g_id = temp.g_id
      WHERE g.s_id = $s_id
      ORDER BY length(count) DESC,count DESC
    ";
    $ret = M("")->query($sql);
    return $ret;
  } 

   /**
   * 查询单个菜品某日销量
   */
  public function cookmenuByDay($g_id,$startTime,$endTime){  
    $condition['goods_id'] = $g_id;
    $condition['pay_time'] = array('between',array($startTime,$endTime));
    $data = M('order_detail')->where($condition)->field('sum(count) sum,goods_price')->find();
    $ret[0] = M('goods')->where("g_id=$g_id")->getField('g_name');
    $ret[1] = $data['sum']==null?0:$data['sum'];
    $ret[2] = $data['sum']*$data['goods_price'];
    return $ret;
  } 

    /**
   * 分店每个月的菜品销售情况
   */
  public function getNumByMonthByOrg($s_id,$year){  //默认年份为当前年份
    if($year == "")
    $year = date("Y",time());
    $prefix = C('DB_PREFIX');
    $January = $year.'01';
    $February = $year.'02';
    $March = $year.'03';
    $April = $year.'04';
    $May = $year.'05';
    $June = $year.'06';
    $July = $year.'07';
    $August = $year.'08';
    $September = $year.'09';
    $October = $year.'10';
    $November = $year.'11';
    $December = $year.'12';
    // dump($January);die;

    $sql =
    "SELECT IFNULL(g_name,'合计') AS g_name, 
      SUM(IF(year='total',amount,0)) AS amount,
      SUM(IF(year='{$January}',count,0)) AS month01,
      SUM(IF(year='{$February}',count,0)) AS month02,
      SUM(IF(year='{$March}',count,0)) AS month03,
      SUM(IF(year='{$April}',count,0)) AS month04,
      SUM(IF(year='{$May}',count,0)) AS month05,
      SUM(IF(year='{$June}',count,0)) AS month06,
      SUM(IF(year='{$July}',count,0)) AS month07,
      SUM(IF(year='{$August}',count,0)) AS month08,
      SUM(IF(year='{$September}',count,0)) AS month09,
      SUM(IF(year='{$October}',count,0)) AS month10,
      SUM(IF(year='{November}',count,0)) AS month11,
      SUM(IF(year='{$December}',count,0)) AS month12,
      SUM(IF(year='total',count,0)) AS total,
      SUM(IF(year='total',count*amount,0)) AS sum
      FROM(
          SELECT g_id,g_name,IFNULL(year,'total') AS year,SUM(count) AS count,  amount
          FROM(
          SELECT g.g_id, g.g_name, FROM_UNIXTIME(pay_time,'%Y%m')as year, SUM(od.count) count, 
              od.goods_price amount
              FROM wo_goods g
               LEFT JOIN wo_order_detail od on g.g_id = od.goods_id
               WHERE FROM_UNIXTIME(pay_time,'%Y') = $year AND g.s_id = $s_id
               GROUP BY year, g_id)AS A
              GROUP BY g_id,year
          WITH ROLLUP
          HAVING g_id IS NOT NULL
            )AS B
      GROUP BY g_name
      WITH ROLLUP";

    $ret = M("")->query($sql);
    $data = $ret;
    $len=sizeof($ret);
    $data[$len]['g_name'] = '单月销售总额';
    for ($i=0; $i < $len-1; $i++) { 
      $data[$len]['month01'] += $data[$i]['month01']*$data[$i]['amount'];
      $data[$len]['month02'] += $data[$i]['month02']*$data[$i]['amount'];
      $data[$len]['month03'] += $data[$i]['month03']*$data[$i]['amount'];
      $data[$len]['month04'] += $data[$i]['month04']*$data[$i]['amount'];
      $data[$len]['month05'] += $data[$i]['month05']*$data[$i]['amount'];
      $data[$len]['month06'] += $data[$i]['month06']*$data[$i]['amount'];
      $data[$len]['month07'] += $data[$i]['month07']*$data[$i]['amount'];
      $data[$len]['month08'] += $data[$i]['month08']*$data[$i]['amount'];
      $data[$len]['month09'] += $data[$i]['month09']*$data[$i]['amount'];
      $data[$len]['month10'] += $data[$i]['month10']*$data[$i]['amount'];
      $data[$len]['month11'] += $data[$i]['month11']*$data[$i]['amount'];
      $data[$len]['month12'] += $data[$i]['month12']*$data[$i]['amount'];
    }

    // dump($ret);die;
    return $data;
  }
}



