var gradienteditor = {
	callback: null,
	thisArg: null,
	changed: false,
	puff: null,
	gradientDimensions: null,
	gradientOffset: null,
	prevStops: null,
	currentGradient: null,
	currentPick: null,
	currentStopColor: null,
	currentPosition: null,
	currentColorField: null,
	tempStops: null,
	gradients: [
		{'name': "Black and White", 'stops': [[255, 255, 255], [0, 0, 0]] },
	    {'name': "Plain Gray", 'stops': [[252, 252, 252], 23, [[242, 242, 242], 12], 89, [191, 191, 191]] },
	    {'name': "Be Water", 'stops': [[209, 237, 233], 23, [[177, 228, 220], 12], 89, [0, 191, 162]] },
	    {'name': "Rainbow", 'stops': [[255, 0, 0], [[255, 0, 255], 15], [[0, 0, 255], 33], [[0, 255, 255], 49], [[0, 255, 0], 67], [[255, 255, 0], 84], [255, 0, 0]] },
	    {'name': "Teal, Magenta, Yellow", 'stops': [[255, 185, 13], [[204, 0, 69], 50], [0, 153, 128]] },
	    {'name': "Peach", 'stops': [[242, 171, 43], [225, 123, 25]] },
	    {'name': "Yellow, Orange", 'stops': [[255, 238, 88], [[252, 199, 54], 28], [[241, 141, 70], 67], [[233, 93, 59], 89], [228, 42, 50]] },
		{'name': "PS i love you", 'stops': [[22,127,232],[0,60,123]] },
		{'name': "Vista", 'stops': [[116,116,116], [[109,109,109], 50], [[126,126,126], 50], [133,133,133]]}
	],
	edit: function(stops, callback, thisArg){
		var name = lang.Custom;
		this.callback = callback;
		this.thisArg = thisArg;
		this.prevStops = stops;
		// if the gradient is known, display its name
		for(var i=0, l=this.gradients.length; i<l; i++){
			if(this.gradients[i].stops === stops){
				name = this.gradients[i].name;
			}
		}
		// if the gradient is new, set changed to true to allow it to be stored
		if(name === lang.Custom) this.changed = true;
		this.setGradient({ name: name, stops: stops });
		nav.goTo(2);
	},
	picker: {
		init: function(color, position){
			this.color = color;
			this.position = position;
			this.$el = this.create();
			this.$colorField = this.$el.find('.color_field');
			return this.$el;
		},
		create: function(){
			$('<div class="picker bottom" />')
		        .css({ 'left': position+'%' })
		        .bind({
		            mousedown: $.proxy( this, "select" ),
		            dblclick: $.proxy( this, "pick" )
		        })
		        .append($('<div class="arrow" />'))
		        .append($('<div class="box" />')
		            .append($('<div class="color_field" />').css({ 'background': tools.toColor(color) }))
		        );
		},
		select: function(){
			// fire "unselect" event
			// show middlepoints
			// add active class to this one
			// show color and position below
			// add pick event listener to the colorField
			// add event listener to the input field to update the position
			// add event listener on "unselect" to unselect
		},
		blur: function(){
			// remove active class
			// hide middle points
			// remove "unselect" listener
		},
		pick: function(){
			colorpicker.pick(this.color, this.updateColor, this);
		},
		updateColor: function(newColor){
			var colorString = color.toColor(newColor);
			this.color = newColor;
			this.$stopColor.css("background", colorString);
			this.$colorField.css("background", colorString);
			// add color to stops
		},
		updatePosition: function(newPos){
			this.position = newPos;
			// update position at stops
		}
	},
	middlepoint: {
		threshhold: 5,
		position: null,
		percentage: null,
		init: function(position, percentage){
			this.position = position;
			this.percentage = percentage;
			this.$el = this.create();
			return this.$el;
		},
		create: function(){
			return $('<span class="middlepoint bottom"><span /></span>')
		        .attr({
					'data-percentage': this.percentage,
				})
		        .css({ 'left': this.position+'%' })
		        .bind(mousedown, $.proxy( this, "startMoving" ));
		},
		startMoving: function(event){
			event.preventDefault();
			this.select();
			gradienteditor.gradientOffset = gradienteditor.$gradient.offset();
			$(document).bind('mousemove.global', $.proxy(this, "move") );
			// add event listener to listen to input field changes
			// show percentage in the input field
		},
		move: function(event){
			
			// stay in the range of the previous and following step +/- 5 (min 5, max 95)
			// if position is 55-65 round to 50
			// update input field value
		},
		show: function(){
			this.$el.addClass('visible');
		},
		hide: function(){
			this.$el.removeClass('visible');
		},
		select: function(){
			this.$el.addClass('selected');
		},
		unselect: function(){
			this.$el.removeClass('selected');
		}
	},
	addPicker: function(position, rgb){
	    return $('<div class="picker bottom" />')
	        .css({ 'left': position+'%' })
			.attr({
				'data-color': JSON.stringify(rgb),
				'data-percentage': position
			})
	        .bind({
	            mousedown: $.proxy( this, "selectPicker" ),
	            dblclick: $.proxy( this, "startPicking" )
	        })
	        .append($('<div class="arrow" />'))
	        .append($('<div class="box" />')
	            .append($('<div class="color_field" />').css({ 'background': tools.toColor(rgb) }))
	        );
	},
	selectPicker: function(event){
		event.preventDefault();
		var obj = $(event.target).parents('.picker');
		this.selectStop(obj);
		this.showMiddlepoints(obj);
		this.gradientOffset = this.$gradient.offset();
		this.extract();
		$(document).bind('mousemove.global', $.proxy(this, "movePicker") );
		$(document).one('mouseup', $.proxy(this, "stopPicking") );
	},
	startPicking: function(event){
		event.preventDefault();
		colorpicker.pick(this.currentStopColor, this.updatePicker, this);
	},
	stopPicking: function(){
		if(this.changed){
			this.currentPick.attr('data-percentage', this.currentPercentage);
		}
	},
	extract: function(){
		this.tempStops = this.expand( $.extend(true, [], this.currentGradient.stops) );
		this.tempStops.splice(this.currentPosition,1);
	},
	inject: function(percentage){
		if(this._percentage === undefined || percentage !== this._percentage){
			var injectedStops = $.extend(true, [], this.tempStops),
				pos = injectedStops.length,
				stop = [this.currentStopColor, percentage];

			for(var i = 0, l = injectedStops.length; i<l; i++){
				var tempStop = injectedStops[i];
				if(typeof tempStop === 'object' && tempStop[1] > percentage){
					pos = i;
					break;
				}
			}
			injectedStops.splice(pos, 0, stop);
			this.updateGradient( this.shrink(injectedStops) );
			this._percentage = percentage;
		}
	},
	expand: function(stops){
		var last = stops.length-1;
		if(stops[0].length === 3) stops[0] = [stops[0], 0];
		if(stops[last].length === 3) stops[last] = [stops[last], 100];
		return stops;
	},
	shrink: function(stops){
		var last = stops.length-1;
		if(stops[0][1] === 0) stops[0] = stops[0][0];
		if(stops[last][1] === 100) stops[last] = stops[last][0];
		return stops;
	},
	getArrayPos: function(percentage, stops){
		for(var i = 0, l = stops.length; i<l; i++){
			var stop = stops[i];
			if(typeof stop === 'object'){
				if(percentage === 0 || percentage === 100){
					return percentage === 0 ? 0 : l-1;
				}
				if(stop[1] === percentage){
					return i;
				}
			}
		}
	},
	movePicker: function(event){
		event.preventDefault();
		var x = Math.max(0, Math.min(this.gradientDimensions.width, event.pageX-this.gradientOffset.left)),
			y = 33,
			percentage = Math.round(x/this.gradientDimensions.width*100);
		if( // out of range - remove gesture
			event.pageX < (this.gradientOffset.left - 26) ||
			event.pageX > (this.gradientOffset.left + this.gradientDimensions.width + 26) ||
			event.pageY < (this.gradientOffset.top - 26) ||
			event.pageY > (this.gradientOffset.top + this.gradientDimensions.height + 69) ){
				// more than 2 color stops 
				if(!this._hasMinimumSize){
					x = event.pageX - this.gradientOffset.left;
					y = event.pageY - this.gradientOffset.top;
				
					if (this.puff === null) {
						this.puff = $('<div id="puff" />').appendTo($body);
						$(document).bind('mouseup.puff', $.proxy( this, "removeCurrentPicker" ));
					}
					this.puff.css({ 'left': event.pageX+2, 'top': event.pageY+16 });
					this.updateGradient( this.shrink(this.tempStops) );
				}	
		}
		else {
			// move picker
			this.currentPercentage = percentage;
			this.$stopLocation.val(percentage);
			this.inject(percentage);
			
			if(!this.changed){
				this.$gradientName.val(lang.Custom);
				this.changed = true;
			};
			
			if(this.puff != null){
				$(document).unbind('mouseup.puff');
				$('#puff').remove();
				this.puff = null;
			}
		}
		
		$(this.currentPick).css({ 'left': x+'px', 'top': y+'px' });
	},
	removeCurrentPicker: function(event){
		this.puff = null;
		$('#puff').remove();
		$(this).unbind(event);
	},
	updatePicker: function(newColor){
		var colorString, stops;
		// newColor RGB-{Array}
		if(!this.changed){
			this.$gradientName.val(lang.Custom);
			this.changed = true;
		};
		colorString = tools.toColor(newColor);
		$(this.currentPick).attr('data-color', JSON.stringify(newColor));
		this.currentColorField.css("background", colorString);
		this.$stopColor.css("background", colorString);
		stops = gradienteditor.currentGradient.stops;
		// search for the position and inject new color
		if(this.currentPosition > 0 && this.currentPosition < stops.length-1){
			stops[this.currentPosition][1] = newColor;
		}
		else {
			stops[this.currentPosition] = newColor;
		}
		this.updateGradient(stops);
	},
	addMiddlepoint: function(position, realpos){
	    return $('<span class="middlepoint bottom"><span /></span>')
	        .attr({
				'data-percentage': realpos,
			})
	        .css({ 'left': position+'%' })
	        .bind({
	            mousedown: function(e){ 
					gradienteditor.selectStop(this);
					//gradienteditor.selectMiddlePoint(this);
				}
	        });
	},
	updateGradient: function(stops){
		gradienteditor.currentGradient.stops = stops;
		this.$gradient.css('background', css.cssGradient( stops, 0, "linear", tools.browserPrefix ));
		if(gradienteditor.callback) gradienteditor.callback.call(gradienteditor.thisArg, stops);
	},
	setGradient: function(gradient){
	    this.hideStop();
	    this.currentGradient = $.extend(true, [], gradient);
		this.$gradient.css('background', css.cssGradient( this.currentGradient.stops, 0, "linear", tools.browserPrefix ));
	    this.$gradientName.val(this.currentGradient.name);
	    this.$gradient.children().remove();
		var helpers = $('<div/>');
	    for(var i=0,length = this.currentGradient.stops.length; i<length; i++){
	        var stop = this.currentGradient.stops[i];
	        var pos, color;
	        switch(typeof stop){
	        case 'object': // => [255,255,255] or [[255,255,255], 33]
	            if(stop.length === 3){ // => [255,255,255]
	                color = stop;
	                pos = i === 0 ? 0 : 100;
	            }
	            else {
	                color = stop[0];
	                pos = stop[1];                  
	            }
	            helpers.append( this.addPicker(pos, color) );
	            if(typeof this.currentGradient.stops[i+1] !== 'number' && i != length-1){
	                var nextStop = this.currentGradient.stops[i+1];
	                var nextPos = nextStop.length !== 3 ? nextStop[1] : 100;
	                helpers.append( this.addMiddlepoint(tools.getCenter(pos, nextPos), 50) );
	            }
	            break;
	        case 'number':
	            var middlepoint = tools.getMiddlepoint(this.currentGradient.stops[i-1], stop, this.currentGradient.stops[i+1]);
	            helpers.append( this.addMiddlepoint(middlepoint[1], middlepoint[1]) );
	            break;
	  		}
	    }
		this.$gradient.append(helpers);
	},
	addGradientPreset: function(name, stops){
	    var preset = $('<div class="swatch" />')
	            .attr({'title': name})
	            .css({
	                'background': css.cssGradient( stops, 135, "linear", tools.browserPrefix )
	            })
				.bind('click', $.proxy( this, "handlePreset" ))
	 	return preset.get(0);
	},
	handlePreset: function(e){
        e.stopPropagation();
        // find out the gradients position in the gradient array
        var family = $(e.target).parent().children();
        var pos = family.index(e.target);
        // if alt is pressed while clicking: remove gradient
        if(e.altKey){
            // slice out the gradient from the gradient array (method by John Resig)
            var rest = this.gradients.slice(pos + 1);
            this.gradients.length = pos;
            this.gradients.push.apply(this.gradients, rest);
			localStorage["gradients"] = JSON.stringify(this.gradients);
            $(e.target).remove();
        }
        else {
            // else get the gradient
            this.setGradient(this.gradients[pos]);
			this.updateGradient(this.gradients[pos].stops);
       	}
	},
	showStop: function(pos, color){
	    this.$stopLocation.prop("disabled", false).val(pos).parent().removeClass("disabled");
	    if (color !== null) {
	        if(!this._hasMinimumSize) this.$removeStop.prop("disabled", false);
	        this.$stopColor.css({'background-color': color}).parent().removeClass("disabled");
			this.$stopColor.bind('mousedown', $.proxy( this, "startPicking" ));
	    }
	    else {
	        this.$removeStop.prop("disabled", true);
	        this.$stopColor.css({'background-color': 'transparent'}).parent().addClass("disabled");
	    }
	},
	updateStopColor: function(color){
	    this.$stopColor.css({'background-color': color});
	},
	hideStop: function(){
	    this.$removeStop.prop("disabled", true);
	    this.$stopLocation.prop("disabled", true).val("").parent().addClass("disabled");
	    this.$stopColor.css({'background-color': 'transparent'}).parent().addClass("disabled");
	},
	selectStop: function(object){
    	var $o = $(object), color;
		this.currentPick = $o;
	    this.currentPercentage = parseInt($o.attr('data-percentage'), 10);
		this.currentPosition = this.getArrayPos(this.currentPercentage, this.currentGradient.stops);
	    this.currentColorField = $o.find('.color_field');
		color = $o.attr('data-color');
		this.currentStopColor = color ? JSON.parse(color) : null;
		this._hasMinimumSize = this.currentGradient.stops.length == 2 ? true : false;
	    this.showStop(this.currentPercentage, this.currentStopColor);
	    $o.siblings().removeClass('selected');
	    $o.addClass('selected');
	},
	showMiddlepoints: function(object){
	    $(object).siblings('span').removeClass('visible');
	    $(object).next('span').add($(object).prev('span')).addClass('visible');
	},
	cancelAction: function(){
		gradienteditor.updateGradient(gradienteditor.prevStops);
		nav.goTo(1);
	},
	okAction: function(){
		nav.goTo(1);
	},
	newAction: function(){
		if(this.changed){
			var newGradient = {
				'name': this.$gradientName.val(),
				'stops': this.currentGradient.stops
			};
			this.gradients.push(newGradient);
			this.renderPresets([newGradient]);
			localStorage["gradients"] = JSON.stringify(this.gradients);
			this.changed = false;
		};
	},
	renderPresets: function(gradients){
		var presets = document.createDocumentFragment();
	    for(var i = 0, length = gradients.length; i<length; i++){
	        presets.appendChild( this.addGradientPreset(gradients[i].name, gradients[i].stops) );
	    }
		this.$gradientPresets.append(presets);
	},
	init: function(){
		this.$o = $('#gradient_editor');
		this.$gradientPresets = $('#gradient_presets');
		this.$gradientName = $('#gradient_name');
		this.$gradientHolder = $('#gradient_holder');
		this.$gradient = $('#gradient');
		this.$stopColor = $('#stop_color');
		this.$stopLocation = $('#stop_location');
		this.$removeStop = $('#remove_stop');
		this.$okButton = $('#gradient_ok');
		this.$cancelButton = $('#gradient_cancel');
		this.$newButton = $('#gradient_new');
		
		if(localStorage["gradients"]) this.gradients = JSON.parse(localStorage["gradients"]);
		this.currentGradient = this.gradients[0];
		this.setGradient(this.currentGradient);
		// draw gradient presets
		this.renderPresets(this.gradients);
		
		this.$removeStop.click( $.proxy( this, "removeCurrentPicker") );
		this.$cancelButton.click( $.proxy( this, "cancelAction" ) );
		this.$okButton.click( $.proxy( this, "okAction" ) );
		this.$newButton.click( $.proxy( this, "newAction" ) );
		this.$gradientName.mousedown( function(e){ e.stopPropagation(); });
		this.$stopLocation.bind({
			mousedown: function(e){ e.stopPropagation(); },
	        focus: function(e){ numbers.initNumberField(this, 'style'); },
	        keydown: numbers.restrictCharacters,
	        keyup: numbers.keyUp,
	        blur: numbers.validateInput
	    });
		
		this.gradientDimensions = { 'width': this.$gradient.width(), 'height': this.$gradient.height() };
	}
};