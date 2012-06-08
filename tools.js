var byId = function(id)
{
	return document.getElementById(id);
};

var _ = function(chaine)
{
	return chaine;
};

var newDom = function(nom)
{
	return document.createElement(nom);
};

var delDom = function(element)
{
	if (element.hasChildNodes())
	{
		element.removeChild(element.firstChild);
	};
};

var emptyDom = function(element)
{
	while(element.hasChildNodes())
	{
		element.removeChild(element.firstChild);
	};
};
var randInt = function(min, max)
{
    return Math.floor(Math.random()*(max-min))+min;
};

var arrayShuffle = function(tableau)
{
	tableau.sort(function(a, b)
	{
		return ((2 * Math.round(Math.random())) - 1);
	});

	return tableau;
};

var delChar = function(chaine, caractere)
{
	var index = chaine.indexOf(caractere);
	return chaine.substr(0,index)+chaine.substr(index+1);
};

var	log = function(element)
{
	window.console.log(element);
};

