function AudioVisualizer (audio, bars_count, channels) {
    this._bars_count         = bars_count;
    this._on_tick_func_left  = this._dummy_func;
    this._on_tick_func_right = this._dummy_func;
    this._channels           = channels || 1;
    this._bands_left         = new Uint8Array(bars_count);
    this._bands_right        = new Uint8Array(bars_count);
    this._init(audio);
}
AudioVisualizer.prototype = {
    _init : function (audio) {
        if (! window.AudioContext) {
            if (! window.webkitAudioContext) {
                alert('no audiocontext found');
                return;
            }
            window.AudioContext = window.webkitAudioContext;
        }
        this._context = new AudioContext();
        this._load_sound(audio);
    },
    //--------------------------------------------------------------------------------
    _dummy_func : function () {},
    //--------------------------------------------------------------------------------
    set_on_tick : function (func_left, func_right) {
        this._on_tick_func_left  = func_left || this._dummy_func;
        this._on_tick_func_right = func_right || this._dummy_func;
    },
    //--------------------------------------------------------------------------------
    _load_sound : function (audio) {
        if (typeof(audio) == 'string') {
            var request = new XMLHttpRequest();
            request.open('GET', audio_file_path, true);
            request.responseType = 'arraybuffer';
            request.onload = this.on_load_sound.bind(this);
            request.send();
        } else {
            this._create_modules(audio);
        }
    },
    //--------------------------------------------------------------------------------
    on_load_sound : function (event) {
        this._context.decodeAudioData(
            event.target.response,
            this.on_decode_sound.bind(this),
            this.on_error.bind(this)
        );
    },
    //--------------------------------------------------------------------------------
    on_decode_sound : function (buffer) {
        this._create_modules();

        this._source.buffer = buffer;
        this.play();
    },
    //--------------------------------------------------------------------------------
    _create_modules : function (audio) {
        this._create_source(audio);
        this._create_analysers();
        this._create_handler();
    },
    //--------------------------------------------------------------------------------
    _create_source : function (audio) {
        if (audio) {
            this._source = this._context.createMediaElementSource(audio);
        } else {
            this._source = this._context.createBufferSource();
        }
        this._source.connect(this._context.destination);

        if (this._channels > 1) {
            this._split_channels();
        }
    },
    //--------------------------------------------------------------------------------
    _split_channels : function () {
        this._splitter = this._context.createChannelSplitter();
        this._source.connect(this._splitter);
    },
    //--------------------------------------------------------------------------------
    _create_analysers : function () {
        this._analyser_left = this._context.createAnalyser();
        this._analyser_left.fftSize = this._bars_count * 2;

        if (this._channels > 1) {
            this._splitter.connect(this._analyser_left, 0, 0);

            this._analyser_right = this._context.createAnalyser();
            this._analyser_right.fftSize = this._bars_count * 2;
            this._splitter.connect(this._analyser_right, 1, 0);
        } else {
            this._source.connect(this._analyser_left);
        }
    },
    //--------------------------------------------------------------------------------
    _create_handler : function () {
        this._handler = this._context.createScriptProcessor(0, 1, 1);
        this._handler.onaudioprocess = this.on_process_sound.bind(this);
        this._analyser_left.connect(this._handler);
        this._handler.connect(this._context.destination);

        if (this._channels > 1) {
            this._analyser_right.connect(this._handler);
        }
    },
    //--------------------------------------------------------------------------------
    on_process_sound : function () {
        this._analyser_left.getByteFrequencyData(this._bands_left);
        this._on_tick_func_left(this._bands_left);

        if (this._channels > 1) {
            this._analyser_right.getByteFrequencyData(this._bands_right);
            this._on_tick_func_right(this._bands_right);
        }
    },
    //--------------------------------------------------------------------------------
    play : function () {
        this._source.loop = true;
        this._source.start(0);
    },
    //--------------------------------------------------------------------------------
    on_error : function () {
        alert('Can not decode this audio file!');
    },
    //--------------------------------------------------------------------------------
    get_average_volume : function () {
        if (this._channels > 1) {
            return [
                this._get_average(this._bands_left),
                this._get_average(this._bands_right)
            ];
        } else {
            return this._get_average(this._bands_left);
        }
    },
    //--------------------------------------------------------------------------------
    _get_average : function (values) {
        var sum = 0,
            n = values.length;
        if (n <= 0) {
            return 0;
        }
        for (var i = 0; i < n; ++i) {
            sum += values[i];
        }
        return sum / n;
    },
};