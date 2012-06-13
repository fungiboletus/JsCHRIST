var JsCHRIST_Table = function(core, screen)
{
	// Représente l'instance des données à traiter
	this.core = core;

	// Zonede travail du graphique
	this.screen = screen;

	this.div_table = newDom('div');
	this.div_table.className = 'table';
	var table = newDom('table');
	var thead = newDom('thead');
	var tr_head = newDom('tr');
	thead.appendChild(tr_head);
	table.appendChild(thead);
	this.tbody = newDom('tbody');
	table.appendChild(this.tbody);
	this.div_table.appendChild(table);

	this.screen.appendChild(this.div_table);

	// Gestion de la taille de la zone
	this.manageSize();
	$(window).resize(this, this.manageSize);
	
	var obj = this;
	$(core).bind("jschrist.new_tuples", function(a, b)
	{
		for (var i = 0; i < b.data.length; ++i)
			obj.addRow(b.data[i]);
	});
	
	$(core).bind("jschrist.time_sync", function(a, b)
	{
		//$(obj.tbody).find('tr')
	});
}

JsCHRIST_Table.prototype =
{
	// Gestion de la taille du graphe
	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.screen).width();
		obj.height = $(obj.screen).height();
		
		obj.div_table.style.maxHeight = obj.height+'px';
	},

	addRow: function(tuple)
	{
		var tr = newDom('tr');

		var obj = this;
		tr.onmouseover = function(e)
		{
			$(obj.core).trigger("jschrist.time_sync", {time_t: tuple.time_t});
		}

		for (var key in tuple)
		{
			var td = newDom('td');
			td.data = tuple;
			td.appendChild(document.createTextNode(tuple[key]));
			tr.appendChild(td);
		}
		this.tbody.appendChild(tr);
	
		var t = $(this.div_table);
		t.scrollTop(t.height()*1000);
	}
}
