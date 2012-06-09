JsCHRIST_Infos = function(core, screen)
{
	this.core = core;
	
	var shadow = newDom('div');
	shadow.className = 'shadow';
	var number = newDom('div');
	number.className = 'number';
	var show = document.createTextNode('154.27');
	number.appendChild(show);
	shadow.appendChild(number);
	screen.appendChild(shadow);

	$(core).bind("jschrist.time_sync", function(a, b)
	{
		show.data = b.time_t;
	});
}
