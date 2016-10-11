// this code is not DRY! just make it run!

$(function(){
	// select song
	$('#list_music_combo_box').change(function(){
		current_song_id = $(this).find(":selected").val();
		$.cookie('cookie_current_song_id_in_shuffle_list', JSON.stringify(current_song_id),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);
		$('audio#audio').attr('src', $('#music_dir_url').val() + $(this).find(":selected").text());
	});

	// shuffle song and save in Cookie
	$('button#shuffle').click(function(e) {
    	e.preventDefault();

    	var music_list = new Array;
    	current_song_id = null;
    	$("#list_music_combo_box option").each(function(){
	    	music_list.push($(this).val());
	    });
	    shuffle(music_list);

		current_song_id = music_list[0];
		$.cookie('cookie_current_song_id_in_shuffle_list', JSON.stringify(current_song_id),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);

    	$.cookie('cookie_shuffle_list', JSON.stringify(music_list),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);
    });

    $('button#next_song_in_shuffle_list').click(function(e) {
    	e.preventDefault();

		shuffle_list = JSON.parse($.cookie('cookie_shuffle_list'));
		current_song_id = JSON.parse($.cookie('cookie_current_song_id_in_shuffle_list'));

		current_index = shuffle_list.indexOf(current_song_id);

		if (current_index >= shuffle_list.length - 1) {
			current_index = 0;
		} else {
			current_index ++;
		}
		current_song_id = shuffle_list[current_index];
		$.cookie('cookie_current_song_id_in_shuffle_list', JSON.stringify(current_song_id),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);
	    $('#list_music_combo_box').val(current_song_id);
    	$('audio#audio').attr('src', $('#music_dir_url').val() + $('#list_music_combo_box').find(":selected").text());
	});

	$('button#prev_song_in_shuffle_list').click(function(e) {
    	e.preventDefault();

		shuffle_list = JSON.parse($.cookie('cookie_shuffle_list'));
		current_song_id = JSON.parse($.cookie('cookie_current_song_id_in_shuffle_list'));

		current_index = shuffle_list.indexOf(current_song_id);

		if (current_index <= 0) {
			current_index = shuffle_list.length - 1;
		} else {
			current_index--;
		}
		current_song_id = shuffle_list[current_index];
		$.cookie('cookie_current_song_id_in_shuffle_list', JSON.stringify(current_song_id),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);
	    $('#list_music_combo_box').val(current_song_id);
    	$('audio#audio').attr('src', $('#music_dir_url').val() + $('#list_music_combo_box').find(":selected").text());
	});

	$("audio#audio").bind("ended", function(){
		shuffle_list = JSON.parse($.cookie('cookie_shuffle_list'));
		current_song_id = JSON.parse($.cookie('cookie_current_song_id_in_shuffle_list'));

		current_index = shuffle_list.indexOf(current_song_id);

		if (current_index >= shuffle_list.length - 1) {
			current_index = 0;
		} else {
			current_index ++;
		}
		current_song_id = shuffle_list[current_index];
		$.cookie('cookie_current_song_id_in_shuffle_list', JSON.stringify(current_song_id),
    		{
    			expires: 30,  // expire: 30 days
    			path: '/'     // cover: all pages
    		}
    	);
	    $('#list_music_combo_box').val(current_song_id);
    	$('audio#audio').attr('src', $('#music_dir_url').val() + $('#list_music_combo_box').find(":selected").text());
	});
});

/**
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}