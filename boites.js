function Boxes_layout(rootNode, direction)
{
	if (!(rootNode instanceof HTMLElement)) alert("The rootNode parameter is not a HTML element");
	this.rootNode = rootNode;

	//$(rootNode).mousemove(function(e){console.log(e);});

	this.rootContainer = new Boxes_container(direction); 

	this.manageSize();
	$(window).resize(this, this.manageSize);

	this.dragged_box = null;
	this.drag_enabled = true;

	var jNode = $(this.rootNode);
	var obj = this;
	jNode.mousedown(function(){
		if (obj.drag_enabled) {
			var jdragged_box = jNode.find('.boxdiv.identifiee');
			jdragged_box.addClass('dragged');
			obj.dragged_box = jdragged_box[0];}});
	jNode.mouseup(function(){if (obj.drag_enabled){
		$(obj.dragged_box).removeClass('dragged');
		obj.dragged_box = null;
	}});

	jNode.mousemove(function(e){
		boiboites.hover(e.pageX, e.pageY);
	});
};



Boxes_layout.prototype = 
{
	createBox: function()
	{
		var div = document.createElement('div');
		div.appendChild(document.createTextNode('vive les canards'));
		return this.transformBox(div);
	},

	transformBox: function(div)
	{
		$(div).addClass('box boxdiv');
		this.rootNode.appendChild(div);
		return div;
	},

	addBox: function(box, container)
	{
		this.rootContainer.addBox(box, container ? container : this.rootContainer);
	},

	manageSize: function(obj)
	{
		var obj = obj == null ? this : obj.data;
		obj.width = $(obj.rootNode).width();
		obj.height = $(obj.rootNode).height();
		obj.equilibrate();
	},

	processing: function(callback)
	{
		this.rootContainer.processing(0, 0, this.width, this.height, callback);
	},

	equilibrate: function()
	{
		this.processing(
			function (box, x, y, width, height, containers) {
				y += 'px';
				x += 'px';
				height += 'px';
				width += 'px';

				if (box.style.top != y) box.style.top = y;
				if (box.style.left != x) box.style.left = x;
				if (box.style.height != height) box.style.height = height;
				if (box.style.width != width) box.style.width = width;
			});
	},

	hover: function(mouse_x, mouse_y)
	{
		var obj = this;
		var div = this.dragged_box;
		this.processing(
			function (box, x, y, width, height, containers) {
				var box_mouse_x = mouse_x - x;
				var box_mouse_y = mouse_y -y;
				if (box_mouse_x >= 0 && box_mouse_x <= width &&
					box_mouse_y >= 0 && box_mouse_y <= height)
				{
					if (!div)
						$(box).addClass('identifiee');

					if (!div || div == box) return;
					var box_center_x = x + width / 2;
					var box_center_y = y + height / 2;

					var in_triangle = function(a_x, a_y, b_x, b_y, c_x, c_y, p_x, p_y) {
						var geoprog = function(a_x, a_y, b_x, b_y, c_x, c_y) {
							return (a_x * (b_y - c_y) + b_x * (c_y - a_y) + c_x * (a_y - b_y)) >= 0;
						};
						var p1 = geoprog(a_x, a_y, b_x, b_y, p_x, p_y);
						var p2 = geoprog(b_x, b_y, c_x, c_y, p_x, p_y);
						var p3 = geoprog(c_x, c_y, a_x, a_y, p_x, p_y);

						return p1 > 0 && p2 > 0 && p3 > 0 || p1 < 0 && p2 < 0 && p3 < 0;
					};

					//console.log("x: "+x+" y: "+y+" width: "+width+" height: "+height);

					var addBox = function(containers, position, target){

						var container = containers.pop();

						if (!container)
							return;

						if (container.direction == Boxes_DIRECTIONS.VERTICAL)
						{
							if (position == 0)
								return obj.rootContainer.addBoxTop(div, target, container);
							else if (position == 2)
								return obj.rootContainer.addBoxBottom(div, target, container);
						}
						else
						{
							if (position == 1)
								return obj.rootContainer.addBoxRight(div, target, container);
							else if (position == 3)
								return obj.rootContainer.addBoxLeft(div, target, container);
						}

						return arguments.callee(containers, position, container);
					} 

					var position = -1;
					if (in_triangle(x, y, x+width, y,
						box_center_x, box_center_y, mouse_x, mouse_y))
						position = 0; // TOP
					else if (in_triangle(x+width, y, x+width, y+height,
						box_center_x, box_center_y, mouse_x, mouse_y))
						position = 1; // RIGHT
					else if (in_triangle(x, y+height,
						box_center_x, box_center_y, x+width, y+height,
						mouse_x, mouse_y))
						position = 2; // BOTTOM
					else if (in_triangle(x, y, box_center_x, box_center_y,
						x, y+height, mouse_x, mouse_y))
						position = 3; // LEFT

					addBox(containers, position, box);

					//console.log(obj);
					obj.equilibrate();

				} else {
					$(box).removeClass('identifiee');
				}
			});
	}
}

Boxes_DIRECTIONS = {VERTICAL: 1, HORIZONTAL: 2};
var nb_boxes = 65;

function Boxes_container(direction)
{
	this.name = String.fromCharCode(nb_boxes++);

	this.boxes = [];
	this.direction = direction;
}

Boxes_container.prototype = 
{
	toString: function()
	{
		var str = "["+this.name+": ";

		for (var i = 0; i < this.boxes.length; ++i)
		{
			var box = this.boxes[i];
			if (box instanceof Boxes_container)
				str += box;
			else
				str += box.getAttribute('id');
			str += ", ";

		}

		str = str.slice(0, str.length -2);
		str += ']';

		return str;
	},

	addBox: function(box, container, action)
	{
		for (var i = 0; i < this.boxes.length; ++i)
		{
			var ibox = this.boxes[i];

			if (ibox instanceof Boxes_container)
			{
				ibox.addBox(box, container, action);
				if (ibox.boxes.length == 0)
					this.boxes.remove(ibox);
			}

			if (ibox !== container && ibox === box)
				this.boxes.remove(box);

		}

		if (this === container)
		{
			if (action)
				action(this.boxes, box, container);
			else
				this.boxes.push(box);
		}
	},

	addBoxTop: function(box, target, container)
	{
		var obj  = this;
		this.addBox(box,container, function(boxes, box, container) {
			boxes.splice(boxes.indexOf(target), 0, box);			
		}); 
	},

	addBoxRight: function(box, target, container)
	{
		this.addBox(box,container, function(boxes, box) {
			boxes.splice(boxes.indexOf(target)+1, 0, box);			
		}); 
	},

	addBoxBottom: function(box, target, container)
	{
		this.addBox(box,container, function(boxes, box) {
			boxes.splice(boxes.indexOf(target)+1, 0, box);			
		}); 
	},

	addBoxLeft: function(box, target, container)
	{
		this.addBox(box,container, function(boxes, box) {
			boxes.splice(boxes.indexOf(target), 0, box);			
		}); 
	},

	processing: function(jmp_x, jmp_y, width, height, callback, containers)
	{
		var height_jmp = 0;
		var width_jmp = 0;
		var nb_boxes = this.boxes.length;

		if (this.direction == Boxes_DIRECTIONS.VERTICAL)
		{
			height = Math.ceil(height / nb_boxes);
			height_jmp = height;
		} else
		{
			width = Math.ceil(width / nb_boxes);
			width_jmp = width;
		}

		if (containers instanceof Array)
			containers.push(this);
		else
			containers = [this];

		for (var i = 0; i < nb_boxes; ++i) {

			var x = jmp_x + i * width_jmp;
			var y = jmp_y + i * height_jmp;

			var box = this.boxes[i];

			if (box instanceof Boxes_container)
				box.processing(x, y, width, height, callback, containers.slice(0));
			else
				callback(box, x, y, width, height, containers);

		}
	}

};
