var lsse;
var graph;

$(function(){
	var socket = io.connect();
	lsse = new LSSE(socket, '/find');

	graph = new Visualization({
		container: $('#graph_container').get(0),
	//	click: function(){console.log(this, arguments)},
		dblclick: function(node){
			lsse.search(node.id, lsse.lastQuery.model, 20, function(data){
				graph.addData(data, 20, false);
			}, true);
		}
	});

	var showImages = false;

	var sampleSearch = [
		"fruit",
		"vehicle",
		"computational linguistics",
		"machine learning",
		"weapon",
		"machine gun",
		"antelope",
		"airplane",
		"mango",
		"strawberry",
		"Russia",
		"Belgium",
		"France",
		"mathematics",
		"biology",
		"moose",
		"racoon",
		"dog",
		"cat",
		"animal",
		"vegetable",
		"Moscow",
		"Stanford",
		"Brussels",
		"Vienna",
		"Berlin",
		"ferrari",
		"porsche",
		"lamborghini",
		"pizza",
		"hot dog",
		"hamburger",
		"soft drink",
		"cottage cheese",
		"local speciality"
	];

	var suggestTimeout = null;

	if (advanced)
		switchImages();

	// $('select.relevance_select').change(function(){

	// 	$(this).parents('div.relevance').hide();

	// 	var relevance = parseInt($(this).val());
	// 	if (relevance <= 3 && relevance >= 1)
	// 		lsse.saveRelevance(relevance);
	// });
	
	$('ul.relevance_select>li').click(function(){
		var relevance = parseInt($(this).data('relevance'));
		if (relevance <= 3 && relevance >= 1)
			lsse.saveRelevance(relevance);
		$(this).parents('div.relevance').hide();
	});

	$('#input_form').submit(function(){
		$('#result').empty();
		$('#show_all').hide();
		$('#suggest_results').hide();
		clearTimeout(suggestTimeout);

		lsse.search($('#input_word').val(), $('#model').val(), 20, displayResults);
		return false;
	});

	// $(document).on("click", "#result a", function(){

	// 	var newWord = (location.hash = $(this).attr('href')).slice(1);
	// 	lsse.completeLog(newWord);

	// 	$('#input_word').val(newWord);
	// 	$('#input_form').submit();


	// 	return false;
	// });

	$('#model').change(function(){
		$('#input_form').submit();
	});

	$('#show_all').click(function(){
		$('#show_all').hide();

		lsse.search($('#input_word').val(), $('#model').val(), 0, displayResults);

		return false;
	});
	$('#show_all').hide();


	$(window).unload(function(){
		lsse.completeLog();
	});
	
	$(window).on('hashchange', function(){
		$('#input_word').val(location.hash.slice(1));
		$('#input_form').submit();
	});

	
	var currentHighLight = -1;
	var suggestLength = 0;
	$('#input_word').keydown(function(e){
		// UP - 38 DOWN - 40 ENTER - 13;
		if (e.keyCode == 13)
		{
			if (currentHighLight != -1)
			{
				location.hash = '#' + $('#suggest_results>li').eq(currentHighLight).text();
				return false;
			}
				// $(this).val($('#suggest_results>li').eq(currentHighLight).text());
			return;
		}
		else
		if (e.keyCode == 40)
		{
			if(++currentHighLight >= suggestLength)
				currentHighLight = suggestLength - 1;
			$('#suggest_results>li').removeClass('active').eq(currentHighLight).addClass('active');
			return false;
		}
		else
		if (e.keyCode == 38)
		{
			if(--currentHighLight < 0)
				currentHighLight = 0;
			$('#suggest_results>li').removeClass('active').eq(currentHighLight).addClass('active');
			return false;
		}
		clearTimeout(suggestTimeout);
		setTimeout(function(){
			currentHighLight = -1;
			suggestLength = 0;
			var word = $('#input_word').val().replace(/[^a-zA-Z0-9\s]/, '');
			if (word.length >= 2)
			{
				lsse.suggest(word, function(words){
					suggestLength = words.length;
					if (suggestLength > 0)
					{
						var res = '<li>' + words.join('</li><li>') + '</li>';
						$('#suggest_results').html(res).show();
					}
					else
						$('#suggest_results').hide();
				});
			}
		}, 200);
	});

	$('#switch_images').click(switchImages);

	$(document).on("click", "#suggest_results>li", function(){
		location.hash = '#' + $(this).text();
		// $('#input_word').val($(this).text());
		// $('#input_form').submit();
	})

	$('#grpah_options>a[href="#close"]').click(function(){
		$(this).parent().hide();
		return false;
	});


	if (location.hash != "")
	{
		$('#input_word').val(location.hash.slice(1));
		$('#input_form').submit();
	}

	var currentExample = sampleSearch[ Math.floor( Math.random() * sampleSearch.length ) ];
	$('#example_search>a').attr('href', '#' + currentExample).text(currentExample);

	function switchImages()
	{
		showImages = !showImages;
		if(showImages)
		{
			$('#switch_images').text(lingua.hide_images);
			$('img.result_icon').show();
		}
		else
		{
			$('#switch_images').text(lingua.show_images);
			$('img.result_icon').hide();
		}
		return false;
	}

	function displayResults(data)
	{
	
		$('#suggest_results').hide();
		var result;
		
		$('#graph_container>div').show();
		
		graph.clear();
		
		if (data.totalRelations > 0)
		{
			graph.addData(data, 20, true);
			graph.update();

			result = '<span>' + lingua.results_count+ ': ' + data.totalRelations + '</span>';
			var i;
			result += '<table>';
			var firstRel = -1;

			for(i = 0; i < data.relations.length; i++)
			{
				result += ('<tr><td>'+ (i + 1)+ '</td>');
				result += ('<td><img ' + (showImages ? '' : 'style="display: none" ')+ 'src="/svg/' + (data.relations[i].icon ? data.relations[i].word : 'no') + '.svg" class="result_icon" /></td>');
				result += ('<td><a href="#' + data.relations[i].word + '">' + data.relations[i].word + '</a>');
				if (advanced)
					result += (' - ' + data.relations[i].value);
				result += '</td></tr>';
			}
			result += '</table>';
			if (data.relations.length < data.totalRelations)
				$('#show_all').show();

			$('div.relevance').show().find('select').val(0);
		}
		else
		{
			$('div.relevance').hide();

			var pLen = data.perhaps.length;
			if (pLen > 0)
			{
				result = lingua.not_found_try_perhaps.replace('%s', data.word);

				data.perhaps.sort(function(a, b){
					return b.totalRelations - a.totalRelations;
				});;

				result += "<ul>";
				var i;
				for(i = 0; i < pLen; i++)
				{
					result += ('<li><a href="#' + data.perhaps[i].word + '">' + data.perhaps[i].word + '</a>');
					result += (' - ' + data.perhaps[i].totalRelations + ' ' + lingua.results);
				}
				result += "</ul>";
			}
			else
				result = lingua.not_found;
		}

		$('#result').html(result);
	}
});
