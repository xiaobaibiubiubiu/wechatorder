<?php 
/**
 *
 * 作    者：侯自强 李想
 * 日    期：2018-3.18
 * 版    本：1.0.0
 * 功能说明：商家版微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
class WxmanagerController extends Controller{

	//小程序端获取根据商家获取商圈有无打印机
	public function getPrintExist(){
			$s_id=I('s_id');
			$condition['s_id']=$s_id;
			$groupid=M('store')->where($condition)->getField('groupID');
			$condition1['uid']=$groupid;
			$exist_print=M('member')->where($condition1)->getField('Exist_print');
			$this->ajaxReturn($exist_print);
	}
	//商家小程序商家下有无打印机
	public function getStorePrint(){
			$s_id=I('s_id');
			$condition['s_id']=$s_id;
			$is_print=M('store')->where($condition)->getField('is_print');	
			$this->ajaxReturn($is_print);

	}
    
	//获取未支付或未取餐订单信息(商家版)
    public function getStoreSub(){
    		if(I('s_id')){
   			$condition['shop_id']=I('s_id');
   			$condition['order_status']=array(array('eq',1),array('eq',0),'or');
   			$orderList=M('order')->where($condition)->field('order_status,o_id,goods_count,total_money,wait_num,detail,user_remarks')->select();
   			foreach ($orderList as $k => $value) {
    //整合数据列表，包括订单信息（detail字符串整理为数组格式）
    		$orderList[$k]['detail']=json_decode($orderList[$k]['detail'],true);
   			}
   			
   			$this->ajaxReturn($orderList);
  			}
  			else{
   			$this->ajaxReturn(1);
  		}
 	}		

	//在搜索框搜索订单信息（商家版）
    public function searchorderid(){
			if(I('s_id')){
			$wn=I('searchid');
			$condition['wait_num']=array('like','%'.$wn.'%');
			$condition['shop_id']=I('s_id');
            $condition['order_status']=array(array('eq',1),array('eq',0),'or');
			$orderList=M('order')->where($condition)->field('order_status,o_id,goods_count,total_money,wait_num,detail,user_remarks')->select();
			foreach ($orderList as $k => $value) {
				//整合数据列表，包括订单信息（detail字符串整理为数组格式）
				$orderList[$k]['detail']=json_decode($orderList[$k]['detail'],true);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}
	}

	//获取已支付待取餐的订单信息(商家版)
	public function getStorePay(){
		if(I('s_id')){
			$condition['shop_id']=I('s_id');
			$condition['order_status']=1;
			$orderList=M('order')->where($condition)->field('o_id,goods_count,total_money,wait_num,detail,user_remarks')->order('pay_time')->select();
			foreach ($orderList as $k => $value) {
				//整合数据列表，包括订单信息（detail字符串整理为数组格式）
				$orderList[$k]['detail']=json_decode($orderList[$k]['detail'],true);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}
	}

	//获取已完成订单信息(商家版)
	public function getStoreDone(){
		$pageindex=intval(I('pageindex'));
		$callback=intval(I('callbackcount'));
		if(I('s_id')){
			$nowTime=date("Y-m-d",time());
			$t=strtotime($nowTime);
			$min=$callback*($pageindex-1)==0?0:$callback*($pageindex-1);
			$condition['shop_id']=I('s_id');
			$condition['order_status']=2;
			$condition['pay_time']= array('gt',$t);
			$orderList=M('order')->where($condition)->field('o_id,goods_count,total_money,wait_num,detail,user_remarks,pay_time')->order('pay_time desc')->limit($min,$callback)->select();
			foreach ($orderList as $k => $value) {
				//整合数据列表，包括订单信息（detail字符串整理为数组格式）
				$orderList[$k]['pay_time']=date('Y-m-d H:i:s',$value['pay_time']);
				$orderList[$k]['detail']=json_decode($orderList[$k]['detail'],true);
			}
			$this->ajaxReturn($orderList);
		}
		else{
			$this->ajaxReturn(1);
		}
	}

	//商家获取某条订单的详细信息
	public function storeOrderDetail(){
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

	//商家确认订单支付
	public function storeConfirmPay(){
		if(IS_GET){
			$o_id=I('o_id');
			$o_data['order_status']=1;
			$sub_time=time();
			$o_data['pay_time']=$sub_time;
			$od_data['pay_time']=$sub_time;
			$condition['order_num']=M('order')->where("o_id=$o_id")->getField('o_num');
			$o_confirmPay=M('order')->where("o_id=$o_id")->save($o_data);
			$od_confirmPay=M('order_detail')->where($condition)->save($od_data);
			if($o_confirmPay && $od_confirmPay) $this->ajaxReturn('success');
			else $this->ajaxReturn('fail');
		}
		else{
			$this->ajaxReturn('error');
		}
	}

	//商家通知用户取餐
	public function storeConfirmDone(){
		if(IS_GET){
			$o_id=I('o_id');
			$d['order_status']=2;
			$confirmPay=M('order')->where("o_id=$o_id")->save($d);
			$doneList=M('order')->where("o_id=$o_id")->field('o_num,shop_id,total_money,wait_num,detail,user_openid,pay_time,form_id')->select();
			$s_id=$doneList[0]['shop_id'];
			$doneList[0]['s_storename']=M('store')->where("s_id=$s_id")->getField('s_storename');
			$detail=json_decode($doneList[0]['detail'],true);
			//dump($detail);
			$goodName='';
			foreach ($detail as $key => $value) {
				if(!$goodName){
					$goodName=$detail[$key]['goodName'];
				}
				else{
					$goodName=$goodName.'+'.$detail[$key]['goodName'];
				}	
			}

			//修改(移动到后台)
			$touser = $doneList[0]['user_openid'];
			$template_id = 'mnU_rjsEhOUn5MIs8-9CI4uQNzOVrpDAdxKzjPoAslA';
			$page = 'page/superindex/index';
			$form_id = $doneList[0]['form_id'];
			//
			//$doneList[0]['goodName']=$goodName;
			$doneList[0]['pay_time']=date("Y-m-d H:i:s",$doneList[0]['pay_time']);
			//修改
			$access_token=$this->get_access_token();
			//$doneList[0]['access_token']=$access_token;

			//修改(移动到后台)
			$value = array(
				"keyword1" => array(
					"value" => $doneList[0]['wait_num'], 
					"color" => "#FF0000"
				),
				"keyword2" => array(
					"value" => $doneList[0]['s_storename'], 
					"color" => "#173177"
				),
				"keyword3" => array(
					"value" => $goodName, 
					"color" => "#173177"
				),
				"keyword4" => array(
					"value" => $doneList[0]['total_money'], 
					"color" => "#173177"
				),
				"keyword5" => array(
					"value" => $doneList[0]['pay_time'], 
					"color" => "#173177"
				),
				"keyword6" => array(
					"value" => $doneList[0]['o_num'], 
					"color" => "#173177"
				)
			);
			$url = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='.$access_token;
	        $dd = array();
	        //$dd['access_token']=$access_token;
	        $dd['touser']=$touser;
	        $dd['template_id']=$template_id;
	        $dd['page']=$page;  //点击模板卡片后的跳转页面，仅限本小程序内的页面。支持带参数,该字段不填则模板无跳转。
	        $dd['form_id']=$form_id;
	        
	        $dd['data']=$value;                        //模板内容，不填则下发空模板
	        
	      
	        $dd['color']='#173177';
	        $dd['emphasis_keyword']='keyword1.DATA';    //模板需要放大的关键词，不填则默认无放大
	        //$dd['emphasis_keyword']='keyword1.DATA';
	        
	        //$send = json_encode($dd);   //二维数组转换成json对象
	        
	        /* curl_post()进行POST方式调用api： api.weixin.qq.com*/
	        $result = $this->https_curl_json($url,$dd,'json');
	        if($result){
	            echo json_encode(array('state'=>5,'msg'=>$result));
	        }else{
	            echo json_encode(array('state'=>5,'msg'=>$result));
	        }
		}
		else{
			$this->ajaxReturn('error');
		}
	}

    //发送json格式的数据，到api接口
    function https_curl_json($url,$data,$type){
        if($type=='json'){//json $_POST=json_decode(file_get_contents('php://input'), TRUE);
            $headers = array("Content-type: application/json;charset=UTF-8","Accept: application/json","Cache-Control: no-cache", "Pragma: no-cache");
            $data=json_encode($data);
            //dump($data);die;
        }
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, 1); // 发送一个常规的Post请求
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if (!empty($data)){
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS,$data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_HTTPHEADER, FALSE );
        $output = curl_exec($curl);
        if (curl_errno($curl)) {
            echo 'Errno'.curl_error($curl);//捕抓异常
        }
        curl_close($curl);
        return $output;
    }

	//获取access_token用于发送消息模板
	public function get_access_token(){
		$appid=C('APPID_USER');
		$secret=C('SECRET_USER');
		if(!$appid) 	return('appid获取失败');
		if(!$secret)	return('secret获取失败');
		$api_url="https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=".$appid."&secret=".$secret;
		$api_return = file_get_contents($api_url);
		$data=json_decode($api_return,true);
		if(!$data)	return('error');
		else{
			$access_token=$data['access_token'];
			return($access_token);
		}

	}

	//获取二维码
	public function getQRCode(){
		$access_token = $this->get_access_token();
		$url = "https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=".$access_token;
		$post_array = array();
		$post_array['path'] = "page/shop/shop?id=1&groupId=2";
		$post_array['width'] = 430;
		$data = json_encode($post_array);
		$QR_Bin = $this->http_request($url, $data);
		file_put_contents('4.jpeg', $QR_Bin);
		dump("okok");

	}

	//封装http请求 post or get
	function http_request($url, $data = null){
		$curl = curl_init();
		curl_setopt($curl, CURLOPT_URL, $url);
		curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, FALSE);
        if(! empty($data)){
        	curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
        }
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
        $output = curl_exec($curl);
        curl_close($curl);
        return $output;
	}

	//判断是否绑定商家open_id
	public function judgeLogin(){
		$open_id=I('open_id');
		if($open_id=='') $this->ajaxReturn('');
		else{
			$condition['s_wechatID']=$open_id;
			$condition['is_delete']=0;
			$data=M('store')->where($condition)->field('s_id,groupID')->select();
			//$data1=M('store')->where($condition)->field('groupID')->select();
			if(!empty($data)){
				$return_list['s_id']=$data[0]['s_id'];
				$return_list['groupID']=$data[0]['groupID'];
				$value = M('group_shop_view')->where($return_list)->field('c_id,tax_rate')->select();
				$return_list['tax_rate']=$value[0]['tax_rate'];
				$c_id = $value[0]['c_id'];
				$return_list['coin'] = M('coin')->where('c_id='.$c_id)->getField('c_symbol');
				$return_list['groupid']=$data[0]['groupID'];
				$this->ajaxReturn($return_list);
			}else $this->ajaxReturn(0);
		}
	}

	//绑定档口商家
	public function bindshop(){
		$open_id=I('open_id');
		$condition['s_name']=I('user_name');
		$condition['s_password']=password(I('password'));
		$condition['is_delete']=0;
		$data=M('store')->where($condition)->find();
		if($data != NULL){
		if($data['s_wechatid']==''){
			$s_id=$data['s_id'];
			$temp['s_wechatID'] = $open_id;
			if(M('store')->where('s_id='.$s_id)->save($temp)){
				$return_list['s_id'] = $s_id;
				$value = M('group_shop_view')->where($return_list)->field('c_id,tax_rate')->select();
				$return_list['tax_rate']=$value[0]['tax_rate'];
				$c_id = $value[0]['c_id'];
				$return_list['coin'] = M('coin')->where('c_id='.$c_id)->getField('c_symbol');
				$this->ajaxReturn($return_list);
			}
			else $this->ajaxReturn(0);
		}
		else{
			$this->ajaxReturn('errorbind'); //该用户已绑定，请原用户先解绑
		}
		}
		else $this->ajaxReturn('psderror');
	}
	//解绑档口商家
	public function unbindingshop(){
		$open_id=I('open_id');
		$s_id=I('s_id');
		$data=M('store')->where("s_id=$s_id")->find();
		if(!$data['s_wechatid']==''){
			if($data['s_wechatid']==$open_id){
				$map['s_wechatID']='';
				$unbinding=M('store')->where("s_id=$s_id")->save($map);
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
	//获取档口信息
	public function getOwnerInfo(){
		if(IS_GET){
			$condition=I('s_id');
			$sql='select a.s_id,a.s_name,a.s_storename,a.pic_url,a.groupid,a.pack_charge,b.groupname,b.Exist_print,a.printername,a.printerpsd,a.is_print from wo_store as a left join wo_member as b on a.groupID=b.uid where a.s_id='.$condition;
			$data=M('')->query($sql);
			$data[0]['pic_url']='http://bjshuyiyuan.com.cn'.$data[0]['pic_url'];
			$this->ajaxReturn($data[0]);
		}
		else $this->ajaxReturn('No get info');
	}
	//获取商圈信息
	public function getTradeAreaInfo(){
		$data=M('member')->field('uid,groupname')->where('uid>1')->select();
		$this->ajaxReturn($data);
	}
	//拿到缓存后判断是否绑定
	public function judgeBind(){
		if(I('s_id')!=''){
			$open_id=I('open_id');
			$condition['s_id']=I('s_id');
			$s_wechatID=M('store')->where($condition)->getField('s_wechatID');
			if($s_wechatID==$open_id){
				$this->ajaxReturn(1);
			}else $this->ajaxReturn(0);
		}else{
			$this->ajaxReturn(2); //没有s_id传入
		}
	}



	//小程序端绑定打印机
	public function bindPrinterTest(){
       if(IS_GET){
			$s_id=I('s_id');
            $access_token=get_printer_access_token();
            $client_id=C('CLIENT_ID');
            $machine=I('printername');
            $msign=I('printerpsd');
            $timestamp=time();
            $sign=getSign($timestamp);
            $id=uuid4();
            $post_url = "https://open-api.10ss.net/printer/addprinter";
            $post_data=array(
                    'client_id' =>$client_id,
                    'machine_code'=>$machine,
                    'msign'=>$msign,
                    'access_token'=>$access_token,
                    'sign'=>$sign,
                    'id'=>$id,
                    'timestamp' => $timestamp
                );
                $response = json_decode(https_curl_json($url=$post_url,$data=http_build_query($post_data)),true);
                if($response['error']==0){
                $this->printerTest($s_id,$machine,$msign);  
            }  
            else if($response['error']==2){
            	$this->ajaxReturn("client_id不存在，绑定失败，请联系管理员");
            }
            else if($response['error']==11){
            	$this->ajaxReturn("sign验证失败，绑定失败，请联系管理员");
            }
            else if($response['error']==12){
            	$this->ajaxReturn("缺少必要参数，绑定失败，请联系管理员");
            }
            else if($response['error']==16){
            	$this->ajaxReturn("你输入的打印机终端号或秘钥有误，请核实后再输入");
            }
            else if($response['error']==18){
            	$this->ajaxReturn("access_token过期或错误，绑定失败，请联系管理员");
            }
            else if($response['error']==33){
            	$this->ajaxReturn("uuid不合法，绑定失败，请联系管理员");
            }
            else if($response['error']==34){
            	$this->ajaxReturn("非法参数，绑定失败，请联系管理员");
            }
      }
            }
     //小程序端测试打印模板页面
	public function printerTest($s_id,$machine,$msign){
			$condition['s_id']=$s_id;
			$shop_name = M('group_shop_view')->where($condition)->getField('s_storename');
			$condtion1['is_print']=1;
			$condtion1['printername']=$machine;
			$condtion1['printerpsd']=$msign;
			M('store')->where($condition)->save($condtion1);
			$time=time();
			$content = "<FS2><center>**".$shop_name." 打印机绑定成功啦！下边是打印的大致模板**</center></FS2>";
			$content .= str_repeat('.', 32);
			$content .= "<FS2><center>--线下支付--</center></FS2>";
			$content .= "<FS><center>--待付款--</center></FS>";
			$content .= "<FS><center>付款码:A815</center></FS>";
			$content .= "订单时间:". date("Y-m-d H:i",$time) . "\n";
			$content .= "订单编号:BK000000000000000000\n";
			$content .= str_repeat('*', 14) . "商品" . str_repeat("*", 14);
			$content .= "<table>";
			$content.="<tr><td>测试菜品</td><td>x4(打包数x4） 4个测试菜品的价格</td></tr>";
			$content .= "</table>";
			$content .= str_repeat('.', 32);
			$content .= "小计:菜品总价加上打包费的和\n";
			$content .= "折扣:￥0 \n";
			$content .= str_repeat('*', 32);
			$content .= "订单总价:￥菜品总价加打包费的和 \n";
			$content .= "<FS2><center>**完**</center></FS2>";
			$shop_id=$s_id;
			$machine_code=$machine;
			$this->test_print_order($content,$shop_id,$machine_code);
	}
	//打印小票(小程序端绑定测试版)
	public function test_print_order($content,$shop_id,$machine_code){
		$post_url='https://open-api.10ss.net/print/index';
		$order_num='BK'.date('ymd').time();
		$timestamp=time();
		$post_data=array(
                    'client_id' =>C('CLIENT_ID'),
                    'access_token'=>get_printer_access_token(),
                    'machine_code'=>$machine_code,
                    'origin_id'=>$order_num,
                    'content'=>$content,
                    'sign'=>getSign($timestamp),
                    'id'=>uuid4(),
                    'timestamp' =>$timestamp
                );
			https_curl_json($url=$post_url,$data=http_build_query($post_data));
			$this->ajaxReturn("打印机已绑定，测试打印机模板已经打印出，请插好电源");
	}
	//小程序端如果商家已存在打印机进行测试
	public function testExistPrinter(){
		if(IS_GET){
			$s_id=I('s_id');
			$access_token=get_printer_access_token();
            $client_id=C('CLIENT_ID');
            $condition['s_id']=$s_id;
            $machineCode=M('store')->where($condition)->find();
            $machine=$machineCode['printername'];
            $msign=$machineCode['printerpsd'];
            $timestamp=time();
            $sign=getSign($timestamp);
            $id=uuid4();
            $post_url = "https://open-api.10ss.net/printer/addprinter";
            $post_data=array(
                    'client_id' =>$client_id,
                    'machine_code'=>$machine,
                    'msign'=>$msign,
                    'access_token'=>$access_token,
                    'sign'=>$sign,
                    'id'=>$id,
                    'timestamp' => $timestamp
                );
                $response = json_decode(https_curl_json($url=$post_url,$data=http_build_query($post_data)),true);
                if($response['error']==0){
                $this->printerTestExist($s_id,$machine);  
            }  
            else if($response['error']==2){
            	$this->ajaxReturn("client_id不存在，绑定失败，请联系管理员");
            }
            else if($response['error']==11){
            	$this->ajaxReturn("sign验证失败，绑定失败，请联系管理员");
            }
            else if($response['error']==12){
            	$this->ajaxReturn("缺少必要参数，绑定失败，请联系管理员");
            }
            else if($response['error']==16){
            	$this->ajaxReturn("你输入的打印机终端号或秘钥有误，请核实后再输入");
            }
            else if($response['error']==18){
            	$this->ajaxReturn("access_token过期或错误，绑定失败，请联系管理员");
            }
            else if($response['error']==33){
            	$this->ajaxReturn("uuid不合法，绑定失败，请联系管理员");
            }
            else if($response['error']==34){
            	$this->ajaxReturn("非法参数，绑定失败，请联系管理员");
            }
		}
	}
	public function printerTestExist($s_id,$machine){
			$condition['s_id']=$s_id;
			$shop_name = M('group_shop_view')->where($condition)->getField('s_storename');
			$time=time();
			$content = "<FS2><center>**".$shop_name." 打印机绑定成功啦！下边是打印的大致模板**</center></FS2>";
			$content .= str_repeat('.', 32);
			$content .= "<FS2><center>--线下支付--</center></FS2>";
			$content .= "<FS><center>--待付款--</center></FS>";
			$content .= "<FS><center>付款码:A815</center></FS>";
			$content .= "订单时间:". date("Y-m-d H:i",$time) . "\n";
			$content .= "订单编号:BK000000000000000000\n";
			$content .= str_repeat('*', 14) . "商品" . str_repeat("*", 14);
			$content .= "<table>";
			$content.="<tr><td>测试菜品</td><td>x4(打包数x4） 4个测试菜品的价格</td></tr>";
			$content .= "</table>";
			$content .= str_repeat('.', 32);
			$content .= "小计:菜品总价加上打包费的和\n";
			$content .= "折扣:￥0 \n";
			$content .= str_repeat('*', 32);
			$content .= "订单总价:￥菜品总价加打包费的和 \n";
			$content .= "<FS2><center>**完**</center></FS2>";
			$shop_id=$s_id;
			$machine_code=$machine;
			$this->test_print_order($content,$shop_id,$machine_code);
	}
	public function deleteExistPrinter(){
		if(IS_GET){
			$s_id=I('s_id');
			$condition['s_id']=$s_id;
			$change['is_print']=0;
			$change['printername']='';
			$change['printerpsd']='';
			$result=M('store')->where($condition)->save($change);
			if($result){
				$this->ajaxReturn("当前打印机信息已删除");
			}
			else{
				$this->ajaxReturn("当前您没有绑定打印机，不能执行解绑。");
			}
		}

	}
}
?>