var instanceJsCHRIST = null;

$(document).ready(function() {
	instanceJsCHRIST = new JsCHRIST();
	instanceJsCHRIST.onready();
});

function JsCHRIST()
{
	this.screen = byId('screen');

	this.screenGraph = document.createElement('canvas');
	this.screenGraph.id = "screenGraph";
	this.screen.appendChild(this.screenGraph);
	this.canvasGraph = this.screenGraph.getContext('2d');
	
	this.screenLine = document.createElement('canvas');
	this.screenLine.id = "screenLine";
	this.screen.appendChild(this.screenLine);
	this.canvasLine = this.screenLine.getContext('2d');
	
	this.data = [];
	this.timeMin = 999999999999999;
	this.timeMax = 0;
	this.dataMin = 999999999999999;
	this.dataMax = 0;

	// Optimisations temporaires
	this.i = 0;
	this.x_i = 0;
	this.y_i = 0;

	// Position de la souris
	this.mousePos = 0;
	this.paintedMousePose = -1;
};

JsCHRIST.prototype =
{
	onready: function()
	{
		this.manageSize();
		$(window).resize(this, this.manageSize);

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
			log(canard);
			var nom = canard.srcElement ? canard.srcElement.firstChild.data : canard.target.firstChild.data;
			$('#reportList li').removeClass('selected');
			$(canard.srcElement).addClass('selected');

			$.ajax({
				url: "../app/RestJson/data/"+encodeURIComponent(nom),
				success: function(json) {
					obj.data = [];
					for (var i = 0; i < json.data.length; ++i)
					{
						obj.addTuple({time_t: json.data[i].time_t, data: json.data[i].rythme});
					}

					obj.paintGraph(true);
					log(json);
				},
				error: function() {
					alert("oops");
				}});
		};

		$.ajax({
			url: "../app/RestJson/reports",
			success: function(json) {
				var list = $('#reportList ul');
				list.empty();
				for (var report in json)
				{
					var li = newDom('li');
					li.appendChild(document.createTextNode(report));
					li.onclick = clic_releve;
					list.append(li);
					log(report);
				}
			},
			error: function(e) {
				alert(e.status == 401 ? "Vous devez vous connecter." : e.statusText);
			}});

		$(this.screen).mousemove(function(e) {
			obj.mousePos = e.offsetX;
			obj.paintLine();
			$("#infosBox .number").html(obj.mousePos);
		});

		/*intervalle = window.setInterval((function(self) {
			return function() {
				self.addTuple({time_t: new Date(), data: randInt(-128, 128)});

				if (self.data.length > 256)
				{
					self.data = self.data.slice(1);
					//self.data = self.data.slice(128);
					self.paintGraph(true);
				} else {
					self.paintGraph(false);
				}

			}})(this), 42);*/
	},

	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $("#screen").width();
		obj.height = $("#screen").height();
		
		obj.screenGraph.width = obj.width;
		obj.screenGraph.height = obj.height;
		obj.screenLine.width = obj.width;
		obj.screenLine.height = obj.height;
		
		obj.paintGraph(true);
	},

	paintLine: function(fullPaint)
	{
		var c = this.canvasLine;

		if (this.paintedMousePose >= 0)
			c.clearRect(this.paintedMousePose - 5,0, 10, this.height);

		c.beginPath();
		c.strokeStyle = "white";
		c.lineWidth = 2;
		c.moveTo(this.mousePos, 0);
		c.lineTo(this.mousePos, this.height);
		c.stroke();
		c.closePath();

		this.paintedMousePose = this.mousePos;
	},
	
	/**
	* Draws the line, proportionnaly to the height and width of the box from where it belongs to.
	*/
	paintGraph: function(fullPaint){
		var c = this.canvasGraph;
		
		//calcul des coefficients à affecter aux valeurs pour faire correspondre pixels et valeur.
		if(this.timeMax != this.timeMin) var coef_x = this.width / (this.timeMax - this.timeMin);
		if(this.dataMax != this.dataMin) var coef_y = this.height / (this.dataMax - this.dataMin);
		
		console.log("coefx : " + coef_x + " coefy : " + coef_y);
		
		if (fullPaint){
			c.clearRect(0,0, this.width, this.height);
			
			//se placer au dernier point du tracé, en définissant this.x_i et x_y
			//dans le cas d'un fullpaint, c'est le premier point...
			this.x_i = 0;
			if (this.data.length > 0)
			{
				this.y_i = this.height-(this.data[0].data * coef_y);
			}
			else
			{
				this.y_i = 0;
			}
		}
		
		c.beginPath();
		c.strokeStyle = "yellowgreen";
		c.lineWidth = 2;
		c.moveTo(this.x_i,this.y_i);
		
		for(var i = 1; i < this.data.length; ++i){
			this.x_i = Date.parse(this.data[i].time_t) * coef_x;
			this.y_i = this.data[i].data * coef_y;
			c.lineTo(this.x_i, this.y_i);
		}
		
		c.stroke();
		c.closePath();
	},

	addTuple: function(tuple)
	{
		if (Date.parse(tuple.time_t) < this.timeMin) this.timeMin = Date.parse(tuple.time_t);
		if (Date.parse(tuple.time_t) > this.timeMax) this.timeMax = Date.parse(tuple.time_t);
		if (tuple.data < this.dataMin) this.dataMin = tuple.data;
		if (tuple.data > this.dataMax) this.dataMax = tuple.data;
		
		console.log(""+ this.timeMax + " ; " + this.timeMin);

		this.data.push(tuple);
	}
};
