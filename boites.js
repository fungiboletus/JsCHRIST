function Boites(rootNode, direction)
{
	if (!(rootNode instanceof HTMLElement)) alert("The rootNode parameter is not a HTML element");
	this.rootNode = rootNode;

	//$(rootNode).mousemove(function(e){console.log(e);});
	
	this.boxes = [];

	this.direction = direction;
	
	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);
};

Boites_DIRECTIONS = {VERTICAL: 1, HORIZONTAL: 2};

Boites.prototype = 
{
	createBox: function()
	{
		var div = document.createElement('div');
		div.className = 'box boxdiv';
		this.rootNode.appendChild(div);
		return div;
	},

	newBox: function()
	{
		var div = this.createBox();
		var options = document.createElement('div');
		options.className = 'options';
		div.appendChild(options);

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

	dessinerDisposition: function()
	{
		div = document.createElement('div');
		document.body.appendChild(div);
		var jdiv = $(div);
		jdiv.addClass('disposition_container');
		var width = jdiv.width();
		var height = jdiv.height();

		this.dessinerPartieDisposition(div, 0, 0, width, height);

		jdiv.appendTo(".options");
	},

	dessinerPartieDisposition: function(div, jmp_x, jmp_y, width, height)
	{
		var marge = 2;
		var height_jmp = 0;
		var width_jmp = 0;
		var nb_boxes = this.boxes.length + 2;

		if (this.direction == Boites_DIRECTIONS.VERTICAL)
		{
			height /= nb_boxes;
			height_jmp = height;
		} else
		{
			width /= nb_boxes;
			width_jmp = width;
		}
		
		for (var i = -1; i < nb_boxes-1; ++i) {


			var x = jmp_x + (i+1) * width_jmp;
			var y = jmp_y + (i+1) * height_jmp;
		
			var box = (i < 0 || i == nb_boxes - 2) ? null : this.boxes[i];

			if (!box || box instanceof HTMLElement) {

				var ndiv = document.createElement('a');
				ndiv.className = 'disposition_div';
				if (i < 0) ndiv.className += ' disposition_before';
				if (i == nb_boxes - 2) ndiv.className += ' disposition_after';
				ndiv.style.left = x+marge/2+'px';
				ndiv.style.top = y+marge/2+'px';
				ndiv.style.width = width-marge+'px';
				ndiv.style.height = height-marge+'px';
				div.appendChild(ndiv);
			} else if (box instanceof Boites) {
				box.dessinerPartieDisposition(div,
					x,
					y,
					width,
					height);
			}
		}
	},

	identifierZonePointee: function(mouse_x, mouse_y)
	{
		this.identifierPartieZonePointee(0, 0, this.width, this.height, mouse_x, mouse_y);
	},
	
	identifierPartieZonePointee: function(jmp_x, jmp_y, width, height, mouse_x, mouse_y)
	{
		var height_jmp = 0;
		var width_jmp = 0;
		var nb_boxes = this.boxes.length;

		if (this.direction == Boites_DIRECTIONS.VERTICAL)
		{
			height = Math.floor(height / nb_boxes);
			height_jmp = height;
		} else
		{
			width = Math.floor(width/ nb_boxes);
			width_jmp = width;
		}
		
		for (var i = 0; i < nb_boxes; ++i) {

			var x = jmp_x + i * width_jmp;
			var y = jmp_y + i * height_jmp;
		
			var box = this.boxes[i];

			if (box instanceof HTMLElement) {
				console.log("[mouse_x] "+mouse_x+" [mouse_y] "+mouse_y+" [x] "+x+" [y] "+y);
				if (mouse_x >= x && mouse_x <= x + width && mouse_y >= y && mouse_y <= y + height)
				{
					console.log("super");
					$(box).addClass('identifiee');
				} else {
					console.log("non");
					$(box).removeClass('identifiee');
				}
			} else if (box instanceof Boites) {
				box.identifierPartieZonePointee(
					x,
					y,
					width,
					height,
					mouse_x,
					mouse_y);
			}
		}
	}
}
