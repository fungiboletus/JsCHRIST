function JsCHRIST(config)
{
	this.data = {};
	this.config = config; 
};

JsCHRIST.prototype =
{
	onready: function()
	{
		$('#closeFullscreenButton').hide();
		var elem = window.document.documentElement;
		if (!elem.requestFullScreen && !elem.mozRequestFullScreen && !elem.webkitRequestFullScreen)
			$('#openFullscreenButton').hide();


		$('#openFullscreenButton').click(function() {
			if (elem.requestFullScreen) {  
				  elem.requestFullScreen();  
			} else if (elem.mozRequestFullScreen) {  
				  elem.mozRequestFullScreen();  
			} else if (elem.webkitRequestFullScreen) {  
				  elem.webkitRequestFullScreen();  
			}
			$('#openFullscreenButton').hide();
			$('#closeFullscreenButton').show();
			return false;
		});

		$('#closeFullscreenButton').click(function() {
			if (document.cancelFullScreen) {  
				  document.cancelFullScreen();  
			} else if (document.mozCancelFullScreen) {  
				  document.mozCancelFullScreen();  
			} else if (document.webkitCancelFullScreen) {  
				  document.webkitCancelFullScreen();  
			}
			$('#closeFullscreenButton').hide();
			$('#openFullscreenButton').show();
			return false;
		});

		var obj = this;
		var clic_releve = function(canard) {
			var nom = canard.srcElement ? canard.srcElement.firstChild.data : canard.target.firstChild.data;
			$('#reportList li').removeClass('selected');
			$(canard.srcElement).addClass('selected');

			$.ajax({
				url: obj.config.data_dt_url+encodeURIComponent(nom),
				success: function(json) {
					var start_t = Date.parse(json.start_t);
					var date = new Date(start_t);
					var data  = {
						data: []
					};

					obj.data[nom] = data;

					$(obj).trigger("jschrist.add_statement", {name: nom});
				
					var start_t = Date.parse(json.start_t);

					var i = 0;
					
					var _addTuple = function(i)
					{
						var tuple =json.data[i];
						start_t += tuple.dt;
						tuple.time_t = new Date(start_t);
						delete tuple.dt;
						
						obj.addTuple(data, tuple);
						return tuple;
					}

					for (; i < json.data.length/2; ++i)
						_addTuple(i);

					$(obj).trigger("jschrist.new_tuples", {
						statement_name: nom,
						data: data.data
					});

					var intervale = window.setInterval(function(){

						$(obj).trigger("jschrist.new_tuples", {
							statement_name: nom,
							data: [_addTuple(i)]
						});

						if (++i == json.data.length)
							window.clearInterval(intervale);

					}, 42);

				},
				error: function() {
					alert("oops");
				}});
		};

		$.ajax({
			url: obj.config.reports_url,
			success: function(json) {
				var list = $('#reportList ul');
				list.empty();
				for (var report in json)
				{
					var li = newDom('li');
					li.appendChild(document.createTextNode(report));
					li.onclick = clic_releve;
					list.append(li);
				}
			},
			error: function(e) {
				alert(e.status == 401 ? "Vous devez vous connecter." : e.statusText);
			}});

	},


	addTuple: function(data, tuple)
	{
		for (var key in tuple)
		{
			var keyMin = key+'Min';
			var keyMax = key+'Max';
			if (!(keyMin in data) || tuple[key] < data[keyMin]) data[keyMin] = tuple[key];
			if (!(keyMax in data) || tuple[key] > data[keyMax]) data[keyMax] = tuple[key];
		}
		data.data.push(tuple);
	}
};
