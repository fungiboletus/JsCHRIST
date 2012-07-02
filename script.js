var instanceJsCHRIST = null;

$(document).ready(function() {

	instanceJsCHRIST = new JsCHRIST((typeof JsCHRIST_Config !== "undefined") ? JsCHRIST_Config : {
		data_dt_url: "../app/RestJson/data_dt/",
		reports_url: "../app/RestJson/reports"
	});
	instanceJsCHRIST.onready();

	new JsCHRIST_Graph(instanceJsCHRIST, byId('screen'));
	new JsCHRIST_Graph(instanceJsCHRIST, byId('canard3Box'));
	new JsCHRIST_Infos(instanceJsCHRIST, byId('infosBox'));
	new JsCHRIST_Table(instanceJsCHRIST, byId('canardBox'));
});
