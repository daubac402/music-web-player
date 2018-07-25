<?php
    $project_name = '/music-web-player';
    $music_dir = $_SERVER['DOCUMENT_ROOT'] . $project_name . '/Musics/';
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" >
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.js"></script>

<style>
    * {
        font-family: Verdana,sans-serif;
    }
    body {
        background: url("Images/bg.jpg") no-repeat center center;
        background-color: #000;
    }
    audio {
        width: 100%;
    }
    .bars {
        margin: 0;
        padding: 0;
        list-style-type: none;
        width: 100%;
        height: 300px;
        position: relative;
    }
    .bars li {
        position: absolute;
        bottom: 0;
        left: 50%;
        display: block;
        width: 4px;
        border-radius: 4px;
        transform-origin: 50% 100%;

        /*background: linear-gradient(to top, #FF8EF0 0px, #fff968 30px, #8eff68 75px);*/

        background-color: white;
        box-shadow: 0 0 10px white;
    }
    .bars li:last-child {
        margin: 0;
    }

    #right_channel {
        top: -300px;
    }

    .drop-zone {
        width: 80%;
        height: 100px;
        background-color: #FFF;
        text-align: center;
        vertical-align: middle;
        margin: 0 auto;
        border-radius: 4px;
        opacity: 0.6;
        filter: alpha(opacity=60); /* For IE8 and earlier */
        line-height: 100px;
        transition: 0.4s;
    }
    .drop-zone.drag-over {
        opacity: 0.9;
        filter: alpha(opacity=90); /* For IE8 and earlier */
    }
    audio#audio {
        width: 100%;
    }
    button {
        height: 50px;
    }
    #list_music_combo_box {
        width: 100%;
        height: 50px;
    }
    .main_visual {
        position: relative;
    }
    #albumcover {
        width: 270px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>

<script src="JS/DOM.js"></script>
<script src="JS/AudioVisualizer.class.js"></script>
<script>
    $(function() {
        $('audio')[0].crossOrigin = "anonymous";
        $('.drop-zone').bind('dragover', function(e){
            event.preventDefault();
            event.stopPropagation();
            $(this).addClass('drag-over');
        });
        $('.drop-zone').bind('dragleave', function(e){
            event.preventDefault();
            event.stopPropagation();
            $(this).removeClass('drag-over');
        });
        $('.drop-zone').bind('drop', function(e){
            event.preventDefault();
            event.stopPropagation();
            
            var files = event.dataTransfer.files; // file list object
            for(i=0; f = files[i]; i++) {
                $(this).html('Playing: ' + f.name);
                $('#google_search_keyword').val(f.name).trigger('change');
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    $('audio')[0].src = e.target.result;
                    $('audio')[0].play();
                };
                reader.readAsDataURL(f);
                break;
            }
        });    
    });
    
    //--------------------------------------------------------------------------------
    EasingFunctions = {
      linear:         function (t) { return t },
      easeInQuad:     function (t) { return t*t },
      easeOutQuad:    function (t) { return t*(2-t) },
      easeInOutQuad:  function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
      easeInCubic:    function (t) { return t*t*t },
      easeOutCubic:   function (t) { return (--t)*t*t+1 },
      easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
      easeInQuart:    function (t) { return t*t*t*t },
      easeOutQuart:   function (t) { return 1-(--t)*t*t*t },
      easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
      easeInQuint:    function (t) { return t*t*t*t*t },
      easeOutQuint:   function (t) { return 1+(--t)*t*t*t*t },
      easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    };
    //--------------------------------------------------------------------------------
    var EASING              = EasingFunctions.easeInCubic;
    var BARS_COUNT          = 128;
    var VISIBLE_PART        = 0.67; // [0, 1]
    var BAR_HEIGHT          = 50;
    var RING_RADIUS         = 200;
    var BAR_DIRECTION       = 1; // 1 -> outter, -1 = inner
    var ARC                 = 180; // [1, 180]
    //--------------------------------------------------------------------------------
    var _VISIBLE_BARS_COUNT = Math.round(BARS_COUNT * VISIBLE_PART);
    var _ROTATE_LEFT        = -ARC / (_VISIBLE_BARS_COUNT);
    var _ROTATE_RIGHT       = ARC / (_VISIBLE_BARS_COUNT);
    var bars_left           = [];
    var bars_right          = [];
    var av;
    //--------------------------------------------------------------------------------
    function on_tick_audio_left (bands) {
        for (var i = 0; i < _VISIBLE_BARS_COUNT; ++i) {
            bars_left[i].style.height = (EASING(bands[i] / 256.0) * BAR_HEIGHT) + 'px';
        }
    }
    //--------------------------------------------------------------------------------
    function on_tick_audio_right (bands) {
        for (var i = 0; i < _VISIBLE_BARS_COUNT; ++i) {
            bars_right[i].style.height = (EASING(bands[i] / 256.0) * BAR_HEIGHT) + 'px';
        }
    }
    //--------------------------------------------------------------------------------
    function init () {
        // init HTML
        var base_html = '<li style="transform:rotate([ROTATION]deg) translate(0, -[RING_RADIUS]px) scaleY([BAR_DIRECTION]);"></li>';
        base_html = base_html.replace('[RING_RADIUS]', RING_RADIUS);
        base_html = base_html.replace('[BAR_DIRECTION]', BAR_DIRECTION);

        var bars_html = [];
        for (var i = 0; i < _VISIBLE_BARS_COUNT; ++i) {
            bars_html.push(base_html.replace('[ROTATION]', (i + 0.5) * _ROTATE_LEFT));
        }
        var root       = MyDOM.get('left_channel');
        root.innerHTML = bars_html.join('');
        bars_left      = root.children;

        bars_html = [];
        for (var i = 0; i < _VISIBLE_BARS_COUNT; ++i) {
            bars_html.push(base_html.replace('[ROTATION]', (i + 0.5) * _ROTATE_RIGHT));
        }
        root           = MyDOM.get('right_channel');
        root.innerHTML = bars_html.join('');
        bars_right     = root.children;

        // init AudioVisualizer
        av = new AudioVisualizer(MyDOM.get('audio'), BARS_COUNT, 2);
        av.set_on_tick(on_tick_audio_left, on_tick_audio_right);
    }
    //--------------------------------------------------------------------------------
    window.addEventListener('load', init);
</script>

</head>


<body>

<script src="JS/google_search_controller.js"></script>
<script src="JS/music_controller.js"></script>
<div class="drop-zone">Drop zone! Drop your music files here.</div>
<input type="hidden" id="music_dir_url" value="Musics/">
<input type="hidden" id="google_search_keyword" value="">
<div>
    <button id="shuffle">Shuffle</button>
    <button id="prev_song_in_shuffle_list">Previous in Shuffle list</button>
    <button id="next_song_in_shuffle_list">Next in Shuffle list</button> 
</div>

<br>
<select id="list_music_combo_box">
    <?php
        if ($dh = opendir($music_dir)){
            $index = -1;
            while (($file = readdir($dh)) !== false) {
                if ($file != '.' && $file != '..') {
                    $index++;
                    $filename = utf8_encode($file);
                    echo ('<option value="' . $index . '">' . str_replace('+', '%20', urlencode($filename)) . '</option>');
                }
            }
            closedir($dh);
        }
    ?>
</select>

<audio src="" id="audio" controls preload autoplay></audio>
<div class="main_visual">
    <ul id="left_channel" class="bars"></ul>
    <ul id="right_channel" class="bars"></ul>
    <img id="albumcover" src="https://www.google.co.jp/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png">
</div>

</body>
</html>