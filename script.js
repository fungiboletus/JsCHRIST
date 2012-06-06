var instanceJsCHRIST = null;

$(document).ready(function() {
	instanceJsCHRIST = new JsCHRIST();
	instanceJsCHRIST.onready();
});

function JsCHRIST()
{
	this.screen = document.getElementById('screen');

	this.screenGraph = document.createElement('canvas');
	this.screenGraph.id = "screenGraph";
	this.screen.appendChild(this.screenGraph);
	this.canvasGraph = this.screenGraph.getContext('2d');
	
	this.screenLine = document.createElement('canvas');
	this.screenLine.id = "screenLine";
	this.screen.appendChild(this.screenLine);
	this.canvasLine = this.screenLine.getContext('2d');
	
	this.data = [];
	this.timeMin = undefined;
	this.timeMax = undefined;
	this.dataMin = undefined;
	this.dataMax = undefined;

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
		$(this.screen).mousemove(function(e) {
			obj.mousePos = e.offsetX;
			obj.paintLine();
		});

		intervalle = window.setInterval((function(self) {
			return function() {
				self.addTuple({time_t: new Date(), data: randInt(-128, 128)});

				if (self.data.length > 256)
				{
					//self.data = self.data.slice(1);
					self.data = self.data.slice(128);
					self.paintGraph(true);
				} else {
					self.paintGraph(false);
				}

			}})(this), 42);
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

	paintGraph: function(fullPaint)
	{
		//console.log("Paint");

		var c = this.canvasGraph;
		
		if (fullPaint)
		{
			c.clearRect(0,0, this.width, this.height);
			this.x_i = 0;
			if (this.data.length > 0)
			{
				this.i = 1;
				this.y_i = this.data[0].data+192;
			}
			else
			{
				this.i = 0;
				this.y_i = 0;
			}
		}

		c.beginPath();
		c.strokeStyle = "yellowgreen";
		c.lineWidth = 2;
		/*c.shadowBlur = 3;
		c.shadowColor = "black";
		c.shadowOffsetX = 1;
		c.shadowOffsetY = 1;*/
		c.moveTo(this.x_i,this.y_i);

		for (; this.i < this.data.length; ++this.i)
		{
			this.x_i = this.i * 5;
			this.y_i = this.data[this.i].data+192;
			c.lineTo(this.x_i, this.y_i);
		}

		c.stroke();
		c.closePath();
	},

	addTuple: function(tuple)
	{
		if (tuple.time_t < this.timeMin) this.timeMin = tuple.time_t;
		if (tuple.time_t > this.timeMax) this.timeMax = tuple.time_t;
		if (tuple.data < this.dataMin) this.dataMin = tuple.data;
		if (tuple.data > this.dataMax) this.dataMin = tuple.data;

		this.data.push(tuple);
	}
};
