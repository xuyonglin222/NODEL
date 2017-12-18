window.onload=function(){
    function show(data) {
        for(key in data){
            $('.msg').append("<span>"+key+": </span>   ").append("<span>"+data[key]+"<span>").append("<br>");

        }
    }
    $("#carinfo").click(function () {
        $.ajax({
            url:'http://localhost:8888/main/getCarInfo',
            data:{CarTagId:$(".testData").val()},
            type:'post',
            dataType:'json',
            success:function(data){
               console.log(data)
                show(data)
            }

        })
    })
    $("#routeinfo").click(function () {
        $.ajax({
            url:'http://localhost:8888/main/postRouteInfo',
            data:{
                CarTagId:$(".TagId").val(),
                datas:{
                    "Distance":$(".Distance").val(),
                    "EndTime":$(".EndTime").val(),
                    "EndStat":$(".EndStat").val(),
                    "StartTime":$(".StartTime").val(),
                    "StartStat":$(".StartStat").val(),
                    "TagId":$(".TagId").val(),
                },
                isStart:true
            },
            type:'post',
            // dataType:'json',
            success:function(data){
                show(data);
            }

        })
    })
    $("#toll").click(function () {
        $.ajax({
            url:'http://localhost:8888/main/getToll',
            type:'get',
             dataType:'json',
            success:function(data){
                show(data);
                console.log(data)
            }

        })
    })
}
