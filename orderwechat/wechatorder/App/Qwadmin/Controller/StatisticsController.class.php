<?php 

namespace Qwadmin\Controller;

/**
* 
*/
class StatisticsController extends ComController
{

	public function index(){
		  //var_dump($_SESSION("Exist_print"));
    //var_dump($_SESSION["uid"]);
   // var_dump($_SESSION["Exist_print"]);
		$data=new \Qwadmin\Model\StatisticsModel();
		$stores=$data->getStore();
		$store_count=$data->getCountStore();
		$dish=$data->getCount($stores);
		$pie_count=$data->getCountPie();
		$pie_count[1]['sum']=10;
		$this->assign('mostStore',$store_count[0]);
		$this->assign('lastStore',$store_count[1]);
		$this->assign('mostDish',$dish[0]['goods_name']);
		$this->assign('lastDish', $dish[1]['goods_name']);
		$this->assign('storeList',$stores);
		$this->assign('pie_count',$pie_count[0]);
		$this->assign('extra',$pie_count[1]);
		$this->display();
	}
	public function displayStore()
	{
		 $s_id = $_GET['s_id'];
    	$year = date("Y",time());
    	$nextYear = $year+1;
    	$startTime = strtotime("1 January $year");
    	$endTime = strtotime("1 January $nextYear");
    	$detail = D('Statistics')->getDetailByHotel($s_id,$startTime,$endTime);
    	$s_name = M('store')->field("s_storename")->where("s_id = $s_id")->find();
    	$s_name = $s_name['s_storename'];
    	//dump($detail);dump($s_name);dump($s_id);die;
    	$this->assign('detail', $detail);
    	$this->assign('s_name',$s_name);
    	$this->assign('s_id',$s_id);
		$this->display('shopdata');
	}
	/**
   * 分店销售情况查询
   */
  public function searchHotel(){
    $s_id = $_POST['s_id'];
    //dump($s_id);die;
    $k=I('k');
    $find = I('find');
    $times = $_POST['times'];
    $timee = $_POST['timee'];

    switch ($find) {
      case 'a':
        $startTime = strtotime('-7day',time());
        $endTime = time();
        break;

      case 'b':
        $startTime = strtotime('-1month',time());
        $endTime = time();
        break;

      case 'c':
        $startTime = strtotime('-3month',time());
        $endTime = time();
        break;

      case 'd':
        $startTime = strtotime('-6month',time());
        $endTime = time();
        break;

      case 'e':
        $startTime = strtotime($times);
        $endTime = strtotime($timee);
        break;

      default:
        $year = date("Y",time());
        $nextYear = $year+1;
        $startTime = strtotime("1 January $year");
        $endTime = strtotime("1 January $nextYear");
        break;
    }
    if(!$startTime&&!$endTime&&!$find) $this->ajaxReturn('请输入日期');

    switch ($k) {
      case 'a':
        $detail = D('Statistics')->searchDetailByNumDE($s_id,$startTime,$endTime);
        break;

      case 'b':
        $detail = D('Statistics')->searchDetailByNumA($s_id,$startTime,$endTime);
        break;

      case 'c':
        $detail = D('Statistics')->searchDetailByTotalDE($s_id,$startTime,$endTime);
        break;

      case 'd':
        $detail = D('Statistics')->searchDetailByTotalA($s_id,$startTime,$endTime);
        break;

      default:
        $detail = D('Statistics')->searchDetailByNumDE($s_id,$startTime,$endTime);
        break;
    }
    $firstFive = D('Statistics')->firstFiveByHotel($s_id,$startTime,$endTime);
    $data=array();
    $data['detail']=$detail;
    $data['five']=$firstFive;
    $this->ajaxReturn($data);
  }

  /**
   * 查询单个菜品某日销量
   */
  public function displaySingle(){
    $g_id = $_POST['g_id'];
    $time = $_POST['time'];
    //dump($g_id);die;
    $startTime = strtotime($time);
    $endTime = strtotime('+1day',$startTime)-1;

    $cookmenuByDay = array();
    $cookmenuByDay = D('Statistics')->cookmenuByDay($g_id,$startTime,$endTime);
    //dump($cookmenuByDay);die;

    $this->ajaxReturn($cookmenuByDay);
  }

  /**
   * 分店总体销售详情表
   */
  public function displayBox(){
    $s_id = I('s_id');
    $dishnumbymonth = D('Statistics')->getNumByMonthByOrg($s_id);
    $s_name = M('store')->where("s_id=$s_id")->getfield('s_storename');
    //dump($dishnumbymonth);die;
    $this->assign('s_name',$s_name);
    $this->assign('dishnumbymonth', $dishnumbymonth);

    $this->display("Statistics/box");
  }
}


 ?>