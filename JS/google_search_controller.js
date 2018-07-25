// API key: AIzaSyDy-5R_RwAZJ8ycEFzoCKhgqNuqZW-gxr8

$(function(){
	$('#google_search_keyword').change(function() {
		var keyword = $(this).val() + ' album cover';
		$.getJSON("https://www.googleapis.com/customsearch/v1?key=AIzaSyDy-5R_RwAZJ8ycEFzoCKhgqNuqZW-gxr8&cx=005124428384360536924:rstfldysumw&q="+keyword+"&searchType=image&safe=high", function() {
    		console.log("Google search success");
  		})
  		.done(function(data) {
  			if (data.items && data.items.length > 0) {
  				$('#albumcover').attr('src', data.items[0].link);
  			}
    	}).fail(function(data) {
    		console.log("Google search error");
  		});
	});
});