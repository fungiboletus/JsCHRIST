function Boites(rootNode)
{
	if (!(rootNode instanceof HTMLElement)) alert("The rootNode parameter is not a HTML element");
	this.rootNode = rootNode;
	
	this.boxes = [];

	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);
};

Boites.prototype = 
{
	newBox: function()
	{
		var div = document.createElement('div');
		div.className = 'box';
		this.rootNode.appendChild(div);

		this.boxes.push(div);

		// Hack pour l'animation CSS
		var obj = this;
		setTimeout(function()
		{
			obj.gridLayout();
		}, 1);

		return div;
	},
	
	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.rootNode).width();
		obj.height = $(obj.rootNode).height();
		obj.gridLayout();
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
	}
}
