var instanceJsCHRIST = null;

$(document).ready(function() {
	instanceJsCHRIST = new JsCHRIST();
	instanceJsCHRIST.onready();

	new JsCHRIST_Graph(instanceJsCHRIST, byId('screen'));
	new JsCHRIST_Graph(instanceJsCHRIST, byId('canard3Box'));
	new JsCHRIST_Infos(instanceJsCHRIST, byId('infosBox'));
});
