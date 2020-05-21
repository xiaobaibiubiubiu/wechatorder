<?php 
/**
 *
 * 作    者：《保命不延毕小程序》
 * 日    期：2018-9-28
 * 版    本：1.0.0l
 * 功能说明：微信小程序接口
 *
 **/
namespace Apiwx\Controller;
use Think\Controller;
class TextController extends Controller{
 public function zhuce(){
  
 if(IS_POST){
            $username=I('username');
            
            $userdb=M('user');
            $condition['username']=$username;
           $name_col=$userdb->where($condition)->getField('username');
           if($name_col)//用户名存在
           {  
              $this->ajaxReturn('0');
               //$array_json=array(
              //'username'=>$username,
              //'password'=>$password,
              //'gender'=>$gender,
              //'age'=>$age,
              //'mobile'=>$mobile,
               //'error'=>'0',

              //'msg'=>'error'

             
           }
           else{               
            $this->ajaxReturn('1');
          }
          }
  if(IS_GET){
            $username=I('username');
            $password=I('password');
            $gender=I('gender');
            $mobile=I('mobile');
            $age=I('age');
            $userdb=M('user');
            $condition['username']=$username;
           $name_col=$userdb->where($condition)->getField('username');
           if($name_col)//用户名存在
           {
              $this->ajaxReturn('0');
               //$array_json=array(
              //'username'=>$username,
              //'password'=>$password,
              //'gender'=>$gender,
              //'age'=>$age,
              //'mobile'=>$mobile,
               //'error'=>'0',

              //'msg'=>'error'

             
           }
            else{
              $dbuser['username']=$username;
              $dbuser['password']=$password;
              $dbuser['gender']=$gender;
              $dbuser['age']=$age;
              $dbuser['mobile']=$mobile;
              $result2=$userdb->add($dbuser);
              if($result2)
              {
                 $array_json = array(
              'username'=>$username,
              'password'=>$password,
              'gender'=>$gender,
              'age'=>$age,
              'mobile'=>$mobile,
               'error'=>'1',

              'msg'=>'success'
            );
            
             
              }
             echo json_encode($array_json);
            $this->ajaxReturn('1');

            }
           }
            
}
}
