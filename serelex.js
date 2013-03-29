var fs = require("fs");
var reader = require ("buffered-reader");
var DataReader = reader.DataReader;
var util = require('util');

var serelex = function() {
	this.fileName = "";
	this.data = {};
	this.wordId = {};
	this.wordsArray = [];
	this.relationsCount = {};
	var t = this;

	this.emptyResult = [];

	this.getWordId = function(word, db){
		var key = word + (db || "") + "13ashdf";
		if (typeof this.wordId[key] == "undefined")
		{
			this.wordsArray.push(word);
			return (this.wordId[key] = this.wordsArray.length - 1);
		}
		return this.wordId[key];
	}
	
	this.getWordById = function(id, db){
		return this.wordsArray[id];
	}

	this.setWordId = function(word, db, id)
	{
		this.wordsArray[id] = word;
		this.wordId[word + (db || "") + "13ashdf"] = id;
	}

	this.addRelationship = function(alias, word, pair, value){
		if (typeof this.data[alias][word] == "undefined")
		{
			this.relationsCount[alias]++;
			this.data[alias][word] = [];
		}	
		this.data[alias][word].push([pair, parseFloat(value)]);
	}

	this.loadCSV = function(file, alias, db, callback){
		if (!fs.existsSync(file))
		{
			callback("File dont exsists!");
			return;
		}

		var stats = fs.statSync(file);
		if (!stats.size)
		{
			callback("Size is zero!");
			return;
		}
		var loaded, lastLoaded;
		this.data[alias] = {};
		this.relationsCount[alias] = 0;

		new DataReader (file, { encoding: "utf8" })
			.on ("error", function (error){
				callback(error);
			})
			.on ("line", function (line, offset){
				var d = line.split(";");
				if (d.length == 3)
				{
					t.addRelationship(alias, t.getWordId(d[0], db), t.getWordId(d[1], db), d[2]);
				}
				if (offset == -1)
					offset = stats.size;
				loaded = Math.floor(offset/stats.size*100);
				if (loaded != lastLoaded)
				{
					lastLoaded = loaded;
					console.log("File " + file + " loading " + loaded + "%");
				}
			})
			.on ("end", function (){
			//	this.close();
				callback(null, t.getWordId(alias), t.data[alias]);
			})
			.read ();
	};

	this.getRelationships = function(alias, word){
		word = this.getWordId(word);
		
		if (typeof this.data[alias] == "undefined" || typeof this.data[alias][word] == "undefined")
			return this.emptyResult;
		
		var result = [];
		var array = this.data[alias][word];
		for(var i = 0; i < array.length; i++)
		{
			result.push({
				"word": this.getWordById(array[i][0]), 
				"value": array[i][1]
			});
		}
		return result;
	}
}

module.exports = serelex;