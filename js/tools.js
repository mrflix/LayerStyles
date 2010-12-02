var tools = {
	browserPrefix: $.browser.webkit ? '-webkit-' : $.browser.mozilla ? '-moz-' : '',
	/**
	 * @method  toColor
	 * @param   array {Array}   RGB or RGBA Color Array 
	 * @return  CSS Color {String}
	 * @example toColor([255,255,255]) returns 'rgb(255,255,255)'
	 *          toColor([255,255,255,0.5]) returns 'rgba(255,255,255,0.5)'
	 */
	toColor: function(array){
	    var mode = array.length === 3 ? 'rgb' : 'rgba';
	    return mode+'('+array.join(',')+')';
	},
	/**
	 * @method  getCenter	returns the center between a starting and an ending point
	 * @param   start {integer}	
	 * 			end {integer}
	 * 			offset {integer} [optional] if the center has an offset
	 * @return  center {integer}
	 * @example getCenter(0, 60) returns 30
	 * 			getCenter(0, 60, 75) returns 45
	 */
	getCenter: function(start, end, offset){
	    var o = offset || 50;
	    return start + Math.round(o/100*(end-start));
	},
	/**
	 * @method  getMiddlepoint	returns the color at a specific position on a color gradient defined through a start and end color
	 * @param   start {array}	eiter a rgb color (like [255,255,255])or a rgb color and a positon (e.g. [[255,255,255], 10])
	 * 			pos {integer}	position
	 * 			end {array}		rgb color [r, g, b]
	 * @return  {array} of the rgb color {array} and relative index {integer}
	 * @example getCenter(0, 60) returns 30
	 * 			getCenter(0, 60, 75) returns 45
	 */
	getMiddlepoint: function(start, pos, end){
	    var startColor = start,
	        endColor = end,    
	        startIndex = 0,
	        endIndex = 100,
	        index = 0,
	        color = [];
	    if(start.length === 2){ startIndex = start[1]; startColor = start[0]; }
	    if(end.length === 2){ endIndex = end[1]; endColor = end[0]; }
	    index = this.getCenter(startIndex, endIndex, pos);
	    for (var i=0, l = startColor.length; i<l; i++) {
	        color[i] = startColor[i] + Math.round((endColor[i] - startColor[i])/2);
	    }
	    return [color, index];
	},
	/**
	 * @method  decodeStops
	 * @param   stops {array}	encoded color stops
	 * @return  {array} decoded color stops: rgb strings
	 * @example decodeStops([0,0,0], 10, [255,255,255]) returns ['rgb(0,0,0)', 'rgb(128,128,128)', 'rgb(255,255,255)']
	 */
	decodeStops: function(stops){
	    var steps = [];
	    for(var i=0, length=stops.length; i<length; i++){
	        var stop = stops[i];
	        switch(typeof stop){
	        case 'object': // => [255,255,255] or [[255,255,255], 33]
	            if(stop.length === 3){ // => [255,255,255]
	                steps[i] = this.toColor(stop);
	            }
	            else { // => [[255,255,255], 33]
	                steps[i] = this.toColor(stop[0])+" "+stop[1]+"%";
	            }
	            break;
	        case 'number': // => 11
	            var middlepoint = this.getMiddlepoint(stops[i-1], stop, stops[i+1]);
	            steps[i] = this.toColor(middlepoint[0])+" "+middlepoint[1]+"%";
	            break;
	        }           
	    }
	    return steps;
	},
	/**
	 * @method  opposite	
	 * @param   direction {String}
	 * @return  {String} opposite direction
	 * @example opposite('top') returns 'bottom'
	 */
	opposite: function(direction) {
        switch(direction){
        case 'top':
            return 'bottom';
        case 'right':
            return 'left';
        case 'bottom':
            return 'top';
        case 'left':
            return 'right';
        }
    },
	/**
	 * @method  cssGradient	
	 * @param   gradient {object}
	 * @return  {array} decoded color stops: rgb strings
	 * @example cssGradient([0,0,0], 10, [255,255,255]) returns ['rgb(0,0,0)', 'rgb(128,128,128)', 'rgb(255,255,255)']
	 */
	cssGradient: function(gradient){
	    var pos = gradient.position,
	        type = gradient.type,
	        steps = gradient.steps;
	    if (this.browserPrefix === '-webkit-') {
	        if (typeof pos === 'number') { // -90 => '50% 0, 50% 100%'
	            var rad = pos/(180/Math.PI);
	            var opp = Math.round(Math.tan(rad)*50);
	            var adj = Math.round(50/Math.tan(rad));
	            // dang: 45deg is left bottom, not right top -> fix please!
	            var start, stop; // [x, y]
	            if (-45 < pos && pos < 45) { 
	                start = ['100%', opp+'%'];
	                stop = ['0', opp+50+'%'];
	            }
	            if (45 < pos && pos < 135) {
	                start = [adj+'%', '0'];
	                stop = [adj+50+'%', '100%'];
	            }
	            if (135 < pos && pos < -135) {
	                start = ['0', opp+50+'%'];
	                stop = ['100%', opp+'%'];
	            }
	            if (-135 < pos && pos < -45) {
	                start = [adj+50+'%', '100%'];
	                stop = [adj+'%', '0'];
	            }
	            pos = start.join(" ")+', '+stop.join(" ");
	        }
	        else { 
	            if (pos.indexOf(" ") !== -1) { // 'left top' => 'left top, right bottom'
	                pos = pos.split(" ");
	                pos = pos[0]+" "+pos[1]+", "+this.opposite(pos[0])+" "+this.opposite(pos[1]);
	            }
	            else {
	                if (pos === 'top' || pos === 'bottom') { // 'top' => 'center top, center bottom'
	                    pos = 'center '+pos+', center '+this.opposite(pos);
	                }
	                else { // 'left' => 'left center, right center'
	                    pos = pos+' center, '+this.opposite(pos)+' center';
	                }
	            }
	        }
	        // form webkit gradient-stops syntax
	        var stops = "from("+steps.shift()+"), to("+steps.pop()+")";
	        for (var i=0,length=steps.length; i<length; i++) {
	            var step = steps[i];
	            if(step.indexOf(" ") !== -1) { // "rgb(0,0,0) 25%" => "25%, rgb(0,0,0)"
	                step = step.split(" ").reverse().join(", ");
	            }
	            else { // "rgb(0,0,0)" => "50%, rgb(0,0,0)"
	                var percentage = 100/(length+1);
	                step = percentage+"%, "+step;
	            }
	            stops+= ", color-stop("+ step +")";
	        }
	        return this.browserPrefix +'gradient('+ type +', '+ pos +', '+ stops +')';
	    }
	    else {
	        if (type === 'linear') {
	            // -90 => add deg
	            pos = typeof pos === 'number' ? pos+'deg' : pos;
	            return this.browserPrefix +'linear-gradient('+ pos +', '+ steps.join(", ") +')';
	        }
	    }
	},
	drawGradient: function(o, type, position, stops){
	    $(o).css({
	        'background': 
	            this.cssGradient({
	                'type': type,
	                'position': position,
	                'steps': this.decodeStops(stops)
	            })
	    });
	},
	focusWindow: function(o){
		$(o).addClass('focused').siblings().removeClass('focused');
	}
}