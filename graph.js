var JsCHRIST_Graph = function(core, screen)
{
	// Représente l'instance des données à traiter
	this.core = core;

	// Zonede travail du graphique
	this.screen = screen;

	// Objet Canvas représentant les courbes
	this.screenGraph = newDom('canvas');
	this.screenGraph.id = "screenGraph";
	this.screen.appendChild(this.screenGraph);
	this.canvasGraph = this.screenGraph.getContext('2d');

	// Objet Canvas représentant la ligne de sélection
	this.screenLine = newDom('canvas');
	this.screenLine.id = "screenLine";
	this.screen.appendChild(this.screenLine);
	this.canvasLine = this.screenLine.getContext('2d');
	
	//tracé des axes
	this.screenAxes = newDom('canvas');
	this.screenAxes.id = "screenAxes";
	this.screen.appendChild(this.screenAxes);
	this.canvasAxes = this.screenAxes.getContext('2d');
	
	// Dernières positions des points tracés
	this.x_i = {};
	this.y_i = {};

	// Décalage global
	this.decalage_x = {};
	
	// Coefficients pour l'echelle
	this.coef_x = undefined;
	this.coef_y = undefined;
	
	// Position de la souris
	this.mousePos = 0;
	this.paintedLine = -1;
	
	//valeur pointée :
	this.pointedValue = 0;
	this.pointedTime = 0;

	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);

	// Gestion simple de la synchronisation du temps
	var obj = this;
	$(this.screen).mousemove(function(e) {
		obj.mousePos = e.offsetX;
		
		for (var d in obj.core.data)
		{
			obj.getPointedValue(d);
			break;
		}	
		$(obj.core).trigger("jschrist.time_sync", {time_t: obj.pointedTime});
	});

	//$(core).bind("jschrist.add_statement", function(a, b) { log(b);});
	$(core).bind("jschrist.new_tuples", function(a, b)
	{
		for (var elem in b.data[0])
			if (elem != 'time_t')
				obj.paintGraph(false, b.statement_name, elem, b.data);
	});

	$(core).bind("jschrist.time_sync", function(a, b)
	{
		//FIXME trouver la key... ^^
		for (var key in obj.core.data)
		{
			var tmp_x = (Date.parse(b.time_t) - Date.parse(obj.core.data[key].time_tMin))* obj.coef_x - obj.decalage_x[key];
			//log(tmp_x);
			obj.paintLine(tmp_x);
			break;
		}
	});
}

JsCHRIST_Graph.prototype =
{
	// Gestion de la taille du graphe
	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.screen).width();
		obj.height = $(obj.screen).height();
		
		obj.screenGraph.width = obj.width;
		obj.screenGraph.height = obj.height;
		obj.screenLine.width = obj.width;
		obj.screenLine.height = obj.height;
		obj.screenAxes.width = obj.width;
		obj.screenAxes.height = obj.height;
		
		//obj.paintGraph(true);
	},

	// Afficher la ligne de sélection
	paintLine: function(position)
	{
		var c = this.canvasLine;

		// Masquage de l'ancien emplacement
		if (this.paintedLine >= 0)
			c.clearRect(this.paintedLine - 5,0, 10, this.height);

		c.beginPath();
		c.strokeStyle = "white";
		c.lineWidth = 2;
		c.moveTo(position, 0);
		c.lineTo(position, this.height);
		c.stroke();
		c.closePath();

		this.paintedLine = position;
	},
	
	drawGrid : function(margin_x, margin_y, step_x, step_y)
	{
		var c = this.canvasAxes;
		
		c.beginPath();
		c.strokeStyle = "white";
		c.lineWidth = 0.5;
		
		//trace les lignes verticales de la grille
		for(var i = margin_y + step_x ; i < this.width ; i += step_x){
			c.moveTo(i , this.height);
			c.lineTo(i, 0);
		}
		
		//trace les lignes horizontales de la grille
		for(var i = this.height - margin_x - step_y ; i > 0 ; i -= step_y){
			c.moveTo(0, i);
			c.lineTo(this.width, i);
		}
		
		c.stroke();
		c.closePath();
	},
	
	/**
	* margin_x = decalage de l'axe des abscisses vers le haut de la boite
	* margin_y = decalage de l'axe des ordonnées vers la droite de la boite
	* step_x = espacement en pixels entre chaque graduation de l'axe des abscisses
	* step_y = espacement en pixels entre chaque graduation de l'axe des ordonnées
	* miligrid = booleen décidant si on trace un papier milimetré ou non...
	*/
	drawAxes: function(margin_x, margin_y, step_x, step_y, grid)
	{
		//init canvas
		var c = this.canvasAxes;
		c.clearRect(0,0, this.width, this.height);
		
		c.beginPath();
		c.strokeStyle = "white";
		c.lineWidth = 1;
		
		//dessine la ligne de l'axe des abscisses
		c.moveTo(0, this.height - margin_x);
		c.lineTo(this.width, this.height - margin_x);

		//dessine la ligne de l'axe des ordonnées
		c.moveTo(margin_y, 0);
		c.lineTo(margin_y, this.height);
		
		//fout des graduations sur l'axe des abscisses :
		for(var i = margin_y + step_x ; i < this.width ; i += step_x){
			c.moveTo(i , this.height - margin_x + 5);
			c.lineTo(i, this.height - margin_x - 5);
		}
		
		//fout des graduations sur l'axe des ordonnées :
		for(var i = this.height - margin_x - step_y ; i > 0 ; i -= step_y){
			c.moveTo(margin_x + 5, i);
			c.lineTo(margin_x - 5, i);
		}
		
		c.stroke();
		c.closePath();
		
		if(grid){
			this.drawGrid(margin_x, margin_y, step_x, step_y);
		}
	},
	
	//TODO pouvoir identifier le graph ou la souris est, afin de pouvoir afficher la valeur des bonnes données !!
	getPointedValue: function(key){
		var data = this.core.data[key].data; //TODO

		if (this.decalage_x[key] == undefined) this.decalage_x[key] = 0.0;
		
		var value_x = ((this.decalage_x[key] + this.mousePos) / this.coef_x) + Date.parse(this.core.data[key].time_tMin);
		
		// recherche dichotomique du temps correspondant:
		var first = 0;
		var last = data.length-1;
		var middle = 0;
		while(first < last){
			middle = Math.floor((last + first) / 2);
			if(Date.parse(data[middle].time_t) < value_x){
				first = middle + 1;
			}
			else{
				last = middle - 1;
			}
		}
		//test du plus proche entre last et first
		if(Math.abs(data[first] - value_x) < Math.abs(data[last] - value_x)){
			this.pointedValue = data[first].data;
			this.pointedTime = data[first].time_t;
		}
		else{
			this.pointedValue = data[last].data;
			this.pointedTime = data[last].time_t;
		}
	},
	
	setLadderCoeff: function(key, elem)
	{
		var elemMin = elem+'Min';
		var elemMax = elem+'Max';
		
		//calcul des coefficients à affecter aux valeurs pour faire correspondre pixels et valeur.
		//coeffiecients permettant de représenter les données proportionnellement à la fenetre d'affichage.
		if(this.core.data[key].time_tMax != this.core.data[key].time_tMin) 
			this.coef_x = this.width / (this.core.data[key].time_tMax - this.core.data[key].time_tMin);
			
		if(this.core.data[key][elemMax] != this.core.data[key][elemMin]) 
			this.coef_y = this.height / (this.core.data[key][elemMax] - this.core.data[key][elemMin]);
	},
	
	paintGraph: function(fullPaint, key, elem, data)
	{
		var colors = ['blue', 'purple', 'red', 'yellowgreen'];
		
		var c = this.canvasGraph;
		
		// Récupération des valeurs (performances)
		var x_i = this.x_i[key];
		var y_i = this.y_i[key];

		var coef_x = this.coef_x;
		var coef_y = this.coef_y;

		this.setLadderCoeff(key, elem);

		// Si l'on ne passe pas les données ou que l'échelle a changée, il faut
		// tout redessiner
		if (data == undefined || this.coef_y != coef_y)
		{
			fullPaint = true;
			coef_x = this.coef_x;
			coef_y = this.coef_y;
		}
		else // Sinon, on garde l'ancienne échelle
		{
			this.coef_x = coef_x;
			this.coef_y = coef_y;
		}

		var elemMin = elem+'Min';

		if (fullPaint)
		{
			// Si on dessine tout, il faut récupérer toutes les données
			data = this.core.data[key].data;

			// On efface toute l'ancienne zone
			c.clearRect(0,0, this.width, this.height);
			x_i = 0;
			y_i = this.height - ((data[0][elem] - this.core.data[key][elemMin]) * coef_y);
		}
		
		c.beginPath();
		c.strokeStyle = colors.pop();
		c.lineWidth = 2;
		/*c.shadowBlur = 3;
		c.shadowColor = "black";
		c.shadowOffsetX = 1;
		c.shadowOffsetY = 1;*/

		c.moveTo(x_i,y_i);

		// Pour chaque point à afficher
		for (var i = 0; i < data.length; ++i)
		{

			var tmp_x = (Date.parse(data[i].time_t) - Date.parse(this.core.data[key].time_tMin))* coef_x;
			// Si la position dépasse, il faut tout décaler
			if (tmp_x > this.width)
			{	
				var incr = tmp_x - x_i;
				this.decalerGraph(key, incr);
				x_i = tmp_x;
				c.moveTo(this.width - incr,y_i);
				tmp_x = this.width;
			}
			else
			{
				x_i = tmp_x;
			}
			
			y_i = this.height - ((data[i][elem] - this.core.data[key][elemMin]) * coef_y);
			c.lineTo(tmp_x, y_i);
			
			this.x_i[key] = x_i;
			this.y_i[key] = y_i;
			
			//actualise les axes...
			this.drawAxes(20, 20, 100, 80, true);
		}

		c.stroke();
		c.closePath();

		fullPaint = false;
		
		this.x_i[key] = x_i;
		this.y_i[key] = y_i;
	},

	// Décalage du graphe en prenant les pixels du canvas
	decalerGraph: function(key, decalage)
	{
		if (this.decalage_x[key] == undefined) this.decalage_x[key] = decalage;
		else this.decalage_x[key] += decalage;

		var c = this.canvasGraph;
		var imgData = c.getImageData(0,0,this.width, this.height);

		c.clearRect(this.width-decalage,0, decalage, this.height);
		c.putImageData(imgData, -decalage, 0);
	}
}
