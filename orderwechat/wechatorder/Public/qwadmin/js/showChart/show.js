gvChartInit();
$(document).ready(function() {
    $('#showBySalesCount').css('background-color', '#ff6600');
    showPieChart();
    $('#showBySalesCount').click(function() {
        console.log("按销量展示");
        $(this).css('background-color', '#ff6600');
        $('#showBySalesMoney').css('background-color', 'orange');
        $('#cd').html('1');
        $('#ccd').html('2');
        $('.gvChart').remove();
        showPieChart();
    });
    $('#showBySalesMoney').click(function() {
        console.log("按销售额展示");
        $(this).css('background-color', '#ff6600');
        $('#showBySalesCount').css('background-color', 'orange');
        $('#cd').html('12');
        $('#ccd').html('11');
        $('.gvChart').remove();
        showPieChart();
    });
});

function showPieChart() {
    $('#myTable5').gvChart({
        chartType: 'PieChart',
        gvSettings: {
            vAxis: {
                title: 'No of players'
            },
            hAxis: {
                title: 'Month'
            },
            width: 430,
            height: 200
        }
    });
}