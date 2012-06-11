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
	this.i = 0;
	this.x_i = 0;
	this.y_i = 0;

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
		obj.paintGraph(true);
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

	paintGraph: function(fullPaint)
	{
		//log(this.core.data);
		console.log("Paint");
		var colors = ['blue', 'purple', 'red', 'yellowgreen'];
		for(var key in this.core.data)
		{
			log(key);
			
			var c = this.canvasGraph;

			var data = this.core.data[key].data;
			
			if (fullPaint)
			{
				c.clearRect(0,0, this.width, this.height);
			}
				this.x_i = 0;
				/*if (this.core.data.length > 0)
				{
					this.i = 1;
					this.y_i = this.height-this.core.data[0].data;
				}
				else
				{*/
					this.i = 0;
					this.y_i = 0;
				//}
			//}
			
			//calcul des coefficients à affecter aux valeurs pour faire correspondre pixels et valeur.
			//coeffiecients permettant de représenter les données proportionnellement à la fenetre d'affichage.
			if(Date.parse(this.core.data[key].timeMax) != Date.parse(this.core.data[key].timeMin)) 
				var coef_x = this.width / (Date.parse(this.core.data[key].timeMax) - Date.parse(this.core.data[key].timeMin));
				
			if(this.core.data[key].dataMax != this.core.data[key].dataMin) 
				var coef_y = this.height / (this.core.data[key].dataMax - this.core.data[key].dataMin);
			
			c.beginPath();
			c.strokeStyle = colors.pop();
			c.lineWidth = 2;
			/*c.shadowBlur = 3;
			c.shadowColor = "black";
			c.shadowOffsetX = 1;
			c.shadowOffsetY = 1;*/
			c.moveTo(this.x_i,this.y_i);
			
			for (; this.i < data.length; ++this.i)
			{
				this.x_i = (Date.parse(data[this.i].time_t) - Date.parse(this.core.data[key].timeMin))* coef_x;
				this.y_i = this.height - ((data[this.i].data - this.core.data[key].dataMin) * coef_y);
				
				c.lineTo(this.x_i, this.y_i);
			}

			c.stroke();
			c.closePath();

			fullPaint = false;
		}
	},
}
