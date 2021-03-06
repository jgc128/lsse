var fs = require("fs");

var allowedPages = {
	about: {
		view: "about"
	},
	advanced: {
		view: "advanced",
		models: require('./../data_models').models,
		modelStats: JSON.parse(fs.readFileSync('./stats.json'))
	},
	images: {
		view: "images",
		models: require('./../data_models').models,
	}
};

exports.page = function(req, res){
	if (typeof req.params.page != "undefined" && typeof allowedPages[req.params.page] != "undefined")
		res.render(allowedPages[req.params.page].view, allowedPages[req.params.page]);
	else
	{
		res.status(404);
		res.send();
	}	
};
exports.allowedPages = allowedPages;