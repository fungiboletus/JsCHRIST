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
	
	this.screenAxes = newDom('canvas');
	this.screenAxes.id = "screenAxes";
	this.screen.appendChild(this.screenAxes);
	this.canvasAxes = this.screenAxes.getContext('2d');
	
	// Optimisations temporaires
	this.x_i = {};
	this.y_i = {};
	
	//coefficients pour l'echelle
	this.coef_x = {};
	this.coef_y = {};
	
	// Position de la souris
	this.mousePos = 0;
	this.paintedMousePose = -1;
	
	//valeur pointée :
	this.pointedValue = 0;
	this.pointedTime = 0;

	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);

	var obj = this;
	$(this.screen).mousemove(function(e) {
		obj.mousePos = e.offsetX;
		obj.paintLine();
		
		//FIXME trouver la key... ^^
		obj.getPointedValue('<3');
		
		$(obj.core).trigger("jschrist.time_sync", {time_t: obj.pointedTime});
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
	
	drawAxes: function(key)
	{
		//init canvas
		var c = this.canvasAxes;
		
		c.clearRect(0,0, this.width, this.height);
		
		c.beginPath();
		c.strokeStyle = "white";
		c.lineWidth = 2;
		
		//trouver la hauteur de l'axe des abscisses
		var height_x = 0;
		if(this.core.data[key].dataMin < 0){
			height_x = (0 - this.core.data[key].dataMin)* this.coef_x[key];
		}
		
		//dessine la ligne de l'axe des abscisses
		c.moveTo(0, this.height - height_x);
		c.lineTo(this.width, this.height - height_x);
		
		c.stroke();
		c.closePath();
	},
	
	//TODO pouvoir identifier le graph ou la souris est, afin de pouvoir afficher la valeur des bonnes données !!
	getPointedValue: function(key){
		var data = this.core.data[key].data; //TODO
		
		var value_x = (this.mousePos / this.coef_x[key]) + Date.parse(this.core.data[key].timeMin);
		var value_y = 0;
		
		//TODO recherche dichotomique du temps correspondant:
		/*var first = 0;
		var last = data.length-1;
		var middle = 0;
		while(first < last){
			middle = Math.floor((last - first) / 2);
			if(Date.parse(data[middle].time_t) > value_x){
				first = middle + 1;
			}
			else{
				last = middle - 1;
			}
		}
		log("coucou");
		
		this.pointedValue = data[first].data;
		log(this.pointedValue);
		this.pointedTime = data[first].time_t;
		*/
		
		for(var i = 0 ; i < data.length-1 ; i++){
			if(Date.parse(data[i].time_t) >= value_x){
				value_y = data[i].data;
				break;
			}
		}
		
		this.pointedValue = value_y;
		log(value_y);
		this.pointedTime = data[i].time_t;
	},
	
	setLadderCoeff: function(key)
	{
		//calcul des coefficients à affecter aux valeurs pour faire correspondre pixels et valeur.
		//coeffiecients permettant de représenter les données proportionnellement à la fenetre d'affichage.
		if(Date.parse(this.core.data[key].timeMax) != Date.parse(this.core.data[key].timeMin)) 
			this.coef_x[key] = this.width / (this.core.data[key].timeMax - this.core.data[key].timeMin);
			
		if(this.core.data[key].dataMax != this.core.data[key].dataMin) 
			this.coef_y[key] = this.height / (this.core.data[key].dataMax - this.core.data[key].dataMin);
	},
	
	paintGraph: function(fullPaint, data)
	{
		//log(this.core.data);
		var colors = ['blue', 'purple', 'red', 'yellowgreen'];
		for(var key in this.core.data)
		{
			this.setLadderCoeff(key);
			
			var c = this.canvasGraph;
			
			var x_i = this.x_i[key];
			var y_i = this.y_i[key];

			var coef_x = this.coef_x[key]; 
			var coef_y = this.coef_y[key]; 

			if (x_i == undefined) x_i = 0;
			if (y_i == undefined) y_i = this.height-data[0].data;

			var debut = 0;

			fullPaint = true;

			if (fullPaint)
			{
				data = this.core.data[key].data;
				c.clearRect(0,0, this.width, this.height);
				x_i = 0;
				y_i = this.height - ((data[0].data - this.core.data[key].dataMin) * coef_y);

				/*if (data.length * 3 > this.width)
					debut = data.length - this.width / 3; */
			}
			else if (data == undefined)
			{
				data = this.core.data[key].data;
			}
			
			c.beginPath();
			c.strokeStyle = colors.pop();
			c.lineWidth = 2;

			c.moveTo(x_i,y_i);

			for (var i = debut; i < data.length-debut; ++i)
			{
				var x_i = (Date.parse(data[i].time_t) - Date.parse(this.core.data[key].timeMin))* coef_x;

				y_i = this.height - ((data[i].data - this.core.data[key].dataMin) * coef_y);
				c.lineTo(x_i, y_i);
			}

			c.stroke();
			c.closePath();

			fullPaint = false;
			
			this.x_i[key] = x_i;
			this.y_i[key] = y_i;
			
			//actualise les axes...
			this.drawAxes(key);
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
