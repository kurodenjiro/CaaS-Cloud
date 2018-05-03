
var mysql = require('mysql')


class Schedule {
	constructor() {

this.create_schedule = function (con, data, startdate, enddate) 
{
	console.log('schedule:This is reserve route');
	let image_details;
	let hosts;
    	console.log(data);
        //var errHandler = function(err) {
    //	console.log(err);
  	//}

    	return new Promise(function(resolve,reject)
	{
        		var service = data.service
        		console.log(data.service+"qwerrty")
        		con.query("SELECT os,ram,cores FROM images WHERE images.tag = '"+service+"';",function (err, result, fields)
			{
          			if (err) throw err;
          			console.log(result);
          			if(!result)
				{
	    				console.log('Requested service not found');
	  			}
          			else
				{
					resolve(result);
				}
			});
	}).then(function(result)
	{
		image_details = result[0];
		var os = result[0].os
		console.log("os:"+os);
		var conquery = "Select comid, (select sum(im.ram) from container con join images im on con.imid = im.imid where comid = com.comid and '"+startdate+"' < con.res_end_time and '"+ enddate+"' > con.res_start_time) as used_ram, (select sum(im.cores) from container con join images im on con.imid = im.imid where comid = com.comid and '"+ startdate+"' < con.res_end_time and '"+ enddate+"' > con.res_start_time) as used_cores, com.total_ram, com.total_cores from computer com where os = '"+os+"';";
		return new Promise(function(resolve,reject)
		{
			console.log("forhost quesry:"+conquery)
			con.query(conquery,function(err,result1,fields)
			{
				console.log("inside host query");
				if (err) throw err;
				console.log(result1);
				if(!result1)
				{
                			console.log('No rows found');
			        }
				else
				{
					resolve(result1);
				}
			})
		})
	}).then(function(result1)
	{
		var ramratio= 1, chosen_host=null;
		hosts=result1;
		var i;
		for(i=0;i<hosts.length;i++)
		{
			var host = hosts[i];
			console.log(host);
			if(host.comid==1)
				continue;
			if(!host.used_ram || !host.used_cores)
			{
				chosen_host=host.comid;
				console.log("idle host:"+chosen_host);
				break;
			}
			if(host.total_ram - host.used_ram >= image_details.ram && host.total_cores - host.used_cores >= image_details.cores)
			{
				if(host.used_ram/host.total_ram < ramratio)
				{
					//console.log("newhost"+comid);
					ramratio=host.used_ram/host.total_ram;
					console.log("ramratio:"+ramratio);
 					chosen_host=host.comid;
				}
			}
		}
		if(!chosen_host)
		{
			console.log('not enough resources on any host');
		}
		else
		{
			console.log("qwerty"+chosen_host);
			return new Promise(function(resolve,reject){
				resolve(chosen_host);
			});
		}
	});

    // Insert the data into database and spinup the container.

}
}
}

module.exports = Schedule;

//var data={tag:"testtag",start:'2018-01-01 01:00:00',  end:'2018-01-01 03:00:00', profile:1, userid:2}

//create_schedule(data).then(function(value){
//		console.log(value)
//});


