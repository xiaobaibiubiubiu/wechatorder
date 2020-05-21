<?php
 namespace app\apiwx\controller;
 use think\Controller;
 use think\Request;
 use think\Response;
 use think\File;
 use think\Db; 
 use think\validate;
 use think\image;
 use function GuzzleHttp\json_decode;
 class Up extends Controller{

public function uploadpicblock()
    {
      if($this->request->isPost()){
        $data4=input('post.');
        $file=$_FILES;
        if($file){
          //原来是 $request->file()里面的参数是要写成input typr='file' 那个标签的name
          $file=request()->file("image");
         
          $info=$file->validate(['size'=>2097152,'ext'=>'jpg,png,jpeg,gif,svg'])->move(ROOT_PATH . 'public' . DS . 'Uploads'. DS);
          if($info){
            dump($info);
            //拓展名
            $entension= $info->getExtension();
            //存储文件的名字
            $savename=$info->getSaveName();
            dump($savename);
            // $data5['open_id']=$data4['open_id'];
            // $data5['add_time']=time();
            // $data5['pic_name']=$data4['pic_name'];
            // $hash=$info->hash('sha1');
            // $data5['hash']=$hash;
            // //状态为0默认没发给区块链
            // $data5['status']=0;
            // $result=Db::table('eb_uploadpic')->insert($data5);
             $url="https://www.bjutxzpj.cn/protect/apiwx/Re/blockfeedbackpic";
            // $data=array();
            // $data['OpenID']= $data5['open_id'];
            // $data['Name']=$data5['pic_name'];
            // $data['Hash']=$data5['hash'];
            // $data['Type']='pic';
      $info1="/var/www/html/protect/public/Uploads/".$savename;
      //$info1=basename($savename);
            dump($info1);
            $response=post_url($url,$info1);
            //根据接收回来的信息判断发送成功
            if($response==200){
                //改为1是发送给区块链
               
                //返给前台1表示已经上传给区块链，正在认证
              var_dump('1');
         
            }
          else{
            //返给前台0表示发送给区块链失败
            var_dump($response);
           // var_dump($file);
         }
         //存储pdf
         // $response=json_decode($response);
         // var_dump('11111');
         // $hash=$response['hash'];
         // $file=$response["file"];
         // var_dump($hash);
         // var_dump($file);
    //      $name = $_FILES["file"]["name"];
		  // $tmp_name = $_FILES['file']['tmp_name'];
    //       $location = '/var/www/html/protect/public/Hash/image/';
 
      move_uploaded_file($tmp_name, $location.$name);

            }
            else{
              echo $file->getError();
            }

          }
        }
    }

    
    public function sendsavepic(){
      $path='/20190514/777.jpg';
      $filename=ROOT_PATH.'public'.DS.'Upload'.DS.$path;
     unlink($filename);
     }

}
 	
 	?>