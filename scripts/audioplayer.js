(function(){

// little javascript extension for easy promises access

    if (jQuery.when.all===undefined) {
        jQuery.when.all = function(deferreds) {
            var deferred = new jQuery.Deferred();
            $.when.apply(jQuery, deferreds).then(
                function() {
                    deferred.resolve(Array.prototype.slice.call(arguments));
                },
                function() {
                    deferred.fail(Array.prototype.slice.call(arguments));
                });

            return deferred;
        }
    }



var folder = '../music/';

var tracklist = [
  'geronimo.mp3',
  'Streets.mp3'
];

var slider 		= $('#slider');

var player = new AudioPlayer(tracklist, {
    path : 'music/'
});

    player.init();

    /*

     Event Handlers

     */

	$('#slider').on('change', function(){
		player.changeDuration(parseInt(this.value));
	});

	$('#btn-pause').on('click', function(){
		player.pause();
	});

    


function AudioPlayer(tracklist, options) {


    var options = options || {};
	var tracklist = tracklist || [];
	var current;
	var audio;
	var playing = false;

	return {

		init : function() {
			current = typeof current == 'undefined' ? 0 : current;
			audio = new Audio(options.path + tracklist[current]);
			this.buildTrackList();

		},

		reset : function () {
			playing = false;
            current = 0;
            player.pause();
            player.currentTime = 0;
			this.init();
		},

		play : function() {
				playing = true;
				var that = this;
				current = typeof current == 'undefined' ? 0 : current;
				audio.play();

				setInterval(function(){
					if (playing) {
                        if (audio.currentTime === audio.duration) {
                            playing = false;
                            that.nextTrack();
                        }
					    $('.time').html( that.getCurrentTime() );
				    }
						
				}, 1000);
		},

		stop : function() {
			playing = false;
            player.pause();
            player.currentTime = 0;
            this.init();
		},

		pause : function() {
			playing = false;
			audio.pause();
		},

		ffwd : function() {
			audio.currentTime += 10;
		},

		rew : function() {
			
		},

		prevTrack : function() {

			if (current == 0)
			{
                current = tracklist.length - 1;
                this.stop();
                this.play();
				return;
				
			} else {
                current--;
                this.stop();
                this.play();
            }

		},

		nextTrack : function() {

			if (current >= tracklist.length - 1)
			{
                this.reset();
                this.play();

			} else {

                current++;
                this.stop();
                this.play();
            }

		
			
		},

		changeDuration : function(perc) {
			audio.currentTime = audio.duration * (perc / 100);

		},

		getCurrentTime : function() {
			var time = new Date(audio.currentTime * 1000);
			var result = '';

			if (time.getMinutes() <= 9)
			{
				result += '0';
			} 
			result += time.getMinutes();

			result += ':';
			if (time.getSeconds() <= 9)
			{
				result += 0;
			}
			result += time.getSeconds();

			return result;
		},

        getTrackData : function(index) {
            var promise = $.Deferred();

            ID3.loadTags(options.path + tracklist[index], function(){
               var data = [];
               var tags = ID3.getAllTags(options.path + tracklist[index]);
               data.push({
                   'artist' : tags.artist,
                   'title'  : tags.title
               });

               promise.resolve(data);
            });
            return promise;
        },

        getAllTrackData : function() {
            var promise = $.Deferred();
                var data = [];
                for (var i = 0; i < tracklist.length; i++) {
                    data.push(this.getTrackData(i));
                }
            $.when.all(data).then(function(result){
               var final = [];
               for(var i = 0; i < result.length; i++)
               {
                   final.push(result[i]);
               }

               promise.resolve(final);
            });

            return promise;
        },

		buildTrackList : function() {
           	var container = $('#tracklist');
            var that = this;
            var timeEl = '<span class="time pull-right"></span>';
            container.empty();
            var checkActive = function(num) {
                return num === current ? ' active' : '';
            };

            var trackData = this.getAllTrackData();

            trackData.done(function(data){
                for (var i = 0; i < data.length; i++)
                {
                    container.append('<li class="list-group-item '+ checkActive(i)  + '">' +  data[i][0].artist + ' | ' + data[i][0].title + '</li>')
                }

                if (current === i)
                {
                    $('li.active').append(timeEl);
                }

            });

            setTimeout(function(){
                $('li.active').append(timeEl).html(this.getCurrentTime());
            }, 500)
		}
	}
}
})();



