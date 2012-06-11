JsCHRIST_Graph = function(core, screen)
{
	this.core = core;
	this.screen = screen;

	this.screenGraph = newDom('canvas');
	this.screenGraph.id = "screenGraph";
	this.screen.appendChild(this.screenGraph);
	this.canvasGraph = this.screenGraph.getContext('2d');
	
	this.screenLine = newDom('canvas');
	this.screenLine.id = "screenLine";
	this.screen.appendChild(this.screenLine);
	this.canvasLine = this.screenLine.getContext('2d');
	
	// Optimisations temporaires
	this.x_i = {};
	this.y_i = {};

	// Position de la souris
	this.mousePos = 0;
	this.paintedMousePose = -1;

	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);

	var obj = this;
	$(this.screen).mousemove(function(e) {
		obj.mousePos = e.offsetX;
		obj.paintLine();

		$(obj.core).trigger("jschrist.time_sync", {time_t: obj.mousePos});
	});

	$(core).bind("jschrist.add_statement", function(a, b) { log(b);});
	$(core).bind("jschrist.new_tuples", function(a, b)
	{
		obj.paintGraph(false, b.data);
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

}

JsCHRIST_Graph.prototype =
{
	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.screen).width();
		obj.height = $(obj.screen).height();
		
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

	paintGraph: function(fullPaint, data)
	{
		//log(this.core.data);
	console.log("Paint");
		var colors = ['blue', 'purple', 'red', 'yellowgreen'];
		for(var key in this.core.data)
		{
			var c = this.canvasGraph;
			
			var x_i = this.x_i[key];
			var y_i = this.y_i[key];

			if (x_i == undefined) x_i = 0;
			if (y_i == undefined) y_i = this.height-data[0].data;

			var debut = 0;

			if (fullPaint)
			{
				data = this.core.data[key].data;
				c.clearRect(0,0, this.width, this.height);
				x_i = 0; //(this.core.data[key].data.length - data.length)*3;
				//this.y_i = 0;
				y_i = this.height-data[0].data;

				if (data.length * 3 > this.width)
					debut = data.length - this.width / 3; 
			}
			else if (data == undefined)
			{
				data = this.core.data[key].data;
			}

				/*if (this.core.data.length > 0)
				{
					this.i = 1;
					this.y_i = this.height-this.core.data[0].data;
				}
				else
				{*/
				//}
			//}

			c.beginPath();
			c.strokeStyle = colors.pop();
			c.lineWidth = 2;
			/*c.shadowBlur = 3;
			c.shadowColor = "black";
			c.shadowOffsetX = 1;
			c.shadowOffsetY = 1;*/
			c.moveTo(x_i,y_i);

			for (var i = debut; i < data.length-debut; ++i)
			{
				x_i += 3;

				if (x_i > this.width)
				{
					this.decalerGraph(3);
					c.moveTo(x_i-6,y_i);
					x_i -= 3;
				}

				y_i = this.height-data[i].data;
				c.lineTo(x_i, y_i);
			}

			c.stroke();
			c.closePath();

			fullPaint = false;
			
			this.x_i[key] = x_i;
			this.y_i[key] = y_i;
		}
	},

	decalerGraph: function(decalage)
	{
		var c = this.canvasGraph;
		var imgData = c.getImageData(0,0,this.width, this.height);

		c.clearRect(this.width-decalage,0, decalage, this.height);
		//c.clearRect(0,0, this.width, this.height);
		c.putImageData(imgData, -decalage, 0);
	}
}
