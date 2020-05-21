/*
	获取查询的数据，并且执行ajax访问后台，拿到数据，修改柱状图。

*/
var val;

function displaydata() {
    var s_id = document.getElementById('s_id').value;
    var times = document.getElementById('times').value;
    var timee = document.getElementById('timee').value;
    console.log(s_id);
    console.log(times);
    console.log(timee);
    
    var find='e';
    val=find;
//  var find = {times:times,timee:timee};
    

    //获取查询的时间。
    $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            times: times,
            timee: timee,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for (var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }

            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: '测试销量前五的菜品的数量及金额',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontWeight: 'normal',
                        color: "#000",
                        fontSize: 20
                    }
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 20,
                    top: 30,
                    itemGap: 16,
                    itemWidth: 18,
                    itemHeight: 10,
                    data: ['数量', '金额']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: [data.five[0].g_name, data.five[1].g_name, data.five[2].g_name, data.five[3].g_name, data.five[4].g_name]
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '数量',
                        type: 'bar',
                        data: [data.five[0].count, data.five[1].count, data.five[2].count, data.five[3].count, data.five[4].count],
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [data.five[0].total, data.five[1].total, data.five[2].total, data.five[3].total, data.five[4].total],

                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        error: function() {
            alert(111);
        }
    });
}

function aweek(){
	var s_id = document.getElementById('s_id').value;
//	var week=document.getElementById('week').value;
	
	var find='a';
	val=find;
	
	 $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for (var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }

            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: '最近一周销量前五的菜品的数量及金额',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontWeight: 'normal',
                        color: "#000",
                        fontSize: 20
                    }
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 20,
                    top: 30,
                    itemGap: 16,
                    itemWidth: 18,
                    itemHeight: 10,
                    data: ['数量', '金额']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: [data.five[0].g_name, data.five[1].g_name, data.five[2].g_name, data.five[3].g_name, data.five[4].g_name]
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '数量',
                        type: 'bar',
                        data: [data.five[0].count, data.five[1].count, data.five[2].count, data.five[3].count, data.five[4].count],
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [data.five[0].total, data.five[1].total, data.five[2].total, data.five[3].total, data.five[4].total],

                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        error: function() {
            alert(111);
        }
    });
}

function onemonth(){
	var s_id = document.getElementById('s_id').value;
//	var week=document.getElementById('week').value;
	
	var find='b';
	val=find;
	
	 $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for (var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }

            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: '最近一个月销量前五的菜品的数量及金额',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontWeight: 'normal',
                        color: "#000",
                        fontSize: 20
                    }
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 20,
                    top: 30,
                    itemGap: 16,
                    itemWidth: 18,
                    itemHeight: 10,
                    data: ['数量', '金额']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: [data.five[0].g_name, data.five[1].g_name, data.five[2].g_name, data.five[3].g_name, data.five[4].g_name]
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '数量',
                        type: 'bar',
                        data: [data.five[0].count, data.five[1].count, data.five[2].count, data.five[3].count, data.five[4].count],
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [data.five[0].total, data.five[1].total, data.five[2].total, data.five[3].total, data.five[4].total],

                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        error: function() {
            alert(111);
        }
    });
}

function threemonth(){
	var s_id = document.getElementById('s_id').value;
//	var week=document.getElementById('week').value;
	
	var find='c';
	val=find;
	
	 $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for (var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }

            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: '最近三个月销量前五的菜品的数量及金额',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontWeight: 'normal',
                        color: "#000",
                        fontSize: 20
                    }
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 20,
                    top: 30,
                    itemGap: 16,
                    itemWidth: 18,
                    itemHeight: 10,
                    data: ['数量', '金额']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: [data.five[0].g_name, data.five[1].g_name, data.five[2].g_name, data.five[3].g_name, data.five[4].g_name]
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '数量',
                        type: 'bar',
                        data: [data.five[0].count, data.five[1].count, data.five[2].count, data.five[3].count, data.five[4].count],
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [data.five[0].total, data.five[1].total, data.five[2].total, data.five[3].total, data.five[4].total],

                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        error: function() {
            alert(111);
        }
    });
}

function sixmonth(){
	var s_id = document.getElementById('s_id').value;
//	var week=document.getElementById('week').value;
	
	var find='d';
	val=find;
	
	 $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for (var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }

            var myChart = echarts.init(document.getElementById('main'));
            var option = {
                title: {
                    text: '最近六个月销量前五的菜品的数量及金额',
                    left: 'center',
                    top: 0,
                    textStyle: {
                        fontWeight: 'normal',
                        color: "#000",
                        fontSize: 20
                    }
                },

                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    left: 20,
                    top: 30,
                    itemGap: 16,
                    itemWidth: 18,
                    itemHeight: 10,
                    data: ['数量', '金额']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { show: true, readOnly: false },
                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                calculable: true,
                xAxis: [{
                    type: 'category',
                    data: [data.five[0].g_name, data.five[1].g_name, data.five[2].g_name, data.five[3].g_name, data.five[4].g_name]
                }],
                yAxis: [{
                    type: 'value'
                }],
                series: [{
                        name: '数量',
                        type: 'bar',
                        data: [data.five[0].count, data.five[1].count, data.five[2].count, data.five[3].count, data.five[4].count],
                        markPoint: {
                            data: [
                                { type: 'max', name: '最大值' },
                                { type: 'min', name: '最小值' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    },
                    {
                        name: '金额',
                        type: 'bar',
                        data: [data.five[0].total, data.five[1].total, data.five[2].total, data.five[3].total, data.five[4].total],

                        markLine: {
                            data: [
                                { type: 'average', name: '平均值' }
                            ]
                        }
                    }
                ]
            };
            myChart.setOption(option);
        },
        error: function() {
            alert(111);
        }
    });
}


function numsorttop() {
    var s_id = document.getElementById('s_id').value;
    var times = document.getElementById('times').value;
    var timee = document.getElementById('timee').value;
    var k = 'a';
    var find=val;
    console.log(find);

    $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            times:times,
            timee:timee,
            k:k,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for(var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }
        }
    });
}

function numsortlow() {
    var s_id = document.getElementById('s_id').value;
    var times = document.getElementById('times').value;
    var timee = document.getElementById('timee').value;
    var k = 'b';
    var find=val;
    console.log(find);
    
    $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            times:times,
            timee:timee,
            k:k,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for(var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }
        }
    });
}

function pricesorttop() {
    var s_id = document.getElementById('s_id').value;
    var times = document.getElementById('times').value;
    var timee = document.getElementById('timee').value;
    var k = 'c';
    var find=val;
    console.log(find);
    
    
    $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            times:times,
            timee:timee,
            k:k,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for(var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }
        }
    });
}

function pricesortlow(){
    var s_id=document.getElementById('s_id').value;
    var times = document.getElementById('times').value;
    var timee = document.getElementById('timee').value;
    var k='d';
    var find=val;
    console.log(find);
    
    $.ajax({
        type: "post",
        dataType: "json",
        data: {
            s_id: s_id,
            times:times,
            timee:timee,
            k:k,
            find: find
        },
        url: "searchHotel",
        success: function(data) {

            console.log(data);
            //更新到右边的销售详情表
            $('#saleDetail').html('');
            //动态创建元素
            console.log(data.detail.length);
            for(var i = 0; i < data.detail.length; i++) {
                var tr = $('<tr></tr>');
                var g_name = $('<td>' + data.detail[i].g_name + '</td>');
                var count = $('<td>' + data.detail[i].count + '</td>');
                var price = $('<td>' + data.detail[i].price + '</td>');
                var total = $('<td>' + data.detail[i].total + '</td>');
                tr.append(g_name).append(count).append(price).append(total);
                $('#saleDetail').append(tr);
            }
        }
    });
}