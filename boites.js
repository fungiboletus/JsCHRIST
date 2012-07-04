function Boites(rootNode, direction)
{
	if (!(rootNode instanceof HTMLElement)) alert("The rootNode parameter is not a HTML element");
	this.rootNode = rootNode;
	
	this.boxes = [];

	this.direction = direction;
	
	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);
};

Boites_DIRECTIONS = {VERTICAL: 1, HORIZONTAL: 2};

Boites.prototype = 
{
	newBox: function()
	{
		var div = document.createElement('div');
		div.className = 'box boxdiv';

		var options = document.createElement('div');
		options.className = 'options';
		div.appendChild(options);

		this.rootNode.appendChild(div);

		this.boxes.push(div);

		// Hack pour l'animation CSS
		var obj = this;
		setTimeout(function()
		{
			obj.equilibrer();
		}, 1);

		return div;
	},

	newBoite: function(direction)
	{
		var div = document.createElement('div');
		div.className = 'box';


		this.rootNode.appendChild(div);
		this.boxes.push(div);
		this.equilibrer();
		
		
		var boite = new Boites(div, direction);
		this.boxes.pop();
		this.boxes.push(boite);
		
		return boite;
	},
	
	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.rootNode).width();
		obj.height = $(obj.rootNode).height();
		console.log(obj);
		obj.equilibrer();
	},

	equilibrer: function()
	{
		var nb_boxes = this.boxes.length;
		var height = this.height;
		var width = this.width;
		var height_jmp = 0;
		var width_jmp = 0;

		if (this.direction == Boites_DIRECTIONS.VERTICAL)
		{
			height /= nb_boxes;
			height_jmp = height;
		} else
		{
			width /= nb_boxes;
			width_jmp = width;
		}
		
		for (var i = 0; i < nb_boxes; ++i) {
			var div = this.boxes[i];

			if (!(div instanceof HTMLElement))
				div = div.rootNode;

			div.style.top = (i * height_jmp)+'px';
			div.style.left = (i * width_jmp)+'px';
			div.style.height = height+'px';
			div.style.width = width+'px';
		}
	},

	gridLayout: function()
	{
		var nb_boxes = this.boxes.length;
		var sqrt = Math.sqrt(nb_boxes);
		
		var lignes = Math.ceil(sqrt);
		var colonnes = Math.round(sqrt);

		var height = this.height / lignes;
		var width = this.width / colonnes;

		var nb_traitements = 0;
		for (var i = 0; i < lignes; ++i) {
			for (var j = 0; j < colonnes && nb_traitements < nb_boxes; ++j) {
				var div = this.boxes[nb_traitements];
				div.style.top = (i * height)+'px';
				div.style.left = (j * width)+'px';
				div.style.height = height+'px';
				div.style.width = width+'px';
				++nb_traitements;
			}
		}
	},

	dessinerCanvas: function(canvas, mouse_x, mouse_y)
	{
		var width = canvas.width;
		var height = canvas.height;
		var c = canvas.getContext('2d');
		c.clearRect(0, 0, width, height);

		if (!mouse_x) mouse_x = -10;
		if (!mouse_y) mouse_y = -10;
		this.dessinerPartieCanvas(c, 5, 5, width-10, height-10, mouse_x, mouse_y);
	},

	dessinerPartieCanvas: function(c, jmp_x, jmp_y, width, height, mouse_x, mouse_y)
	{
		var marge = 4;
		var height_jmp = 0;
		var width_jmp = 0;
		var nb_boxes = this.boxes.length;

		if (this.direction == Boites_DIRECTIONS.VERTICAL)
		{
			height /= nb_boxes;
			height_jmp = height + marge;
		} else
		{
			width /= nb_boxes;
			width_jmp = width + marge;
		}
		
		//c.shadowBlur = 3;
		c.shadowColor = "rgba(0,0,0,0.6)";
		c.fillStyle = "white";

		for (var i = 0; i < nb_boxes; ++i) {
			var box = this.boxes[i];

			var x = jmp_x + i * width_jmp;
			var y = jmp_y + i * height_jmp;
			if (box instanceof HTMLElement) {
				var selected = mouse_x >= x && mouse_x <= x + width && mouse_y >= y && mouse_y <= y + height;

				if (selected) {
					c.save();
					c.fillStyle = "red";
				}

				c.fillRect(	
					x,
					y,
					width,
					height);
				
				if (selected)
					c.restore();
			} else {
				box.dessinerPartieCanvas(c,
					x,
					y,
					width-marge,
					height-marge-marge,
					mouse_x, mouse_y);
			}
		}
	}
}
