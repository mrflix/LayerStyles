var tools = {
    options: {
        hex: true
    },
    //browserPrefix: $.browser.webkit ? '-webkit-' : $.browser.mozilla ? '-moz-' : '',
    browserPrefix: "",
    // technic by Lea Verou
    // see http://leaverou.me/2009/02/find-the-vendor-prefix-of-the-current-browser/
    getBrowserPrefix: function(){
        var regex = /^(Moz|Webkit|Khtml|O|ms|Icab)(?=[A-Z])/;
        var tester = document.getElementsByTagName('script')[0];
        var prefix = "";
        for(var prop in tester.style) {
            if(regex.test(prop)) {
                prefix = prop.match(regex)[0];
                break;
            }
        }
        if('WebkitOpacity' in tester.style) prefix = 'Webkit';
        this.browserPrefix = prefix === "" ? "" : '-' + prefix.charAt(0).toLowerCase() + prefix.slice(1) +'-';
    },
    /**
     * @method  averageGradientColor
     * @param   fullStops {stops-array}
     * @return  color {string}
     * @example averageGradientColor([[255,255,255], [0,0,0]]) returns gray
     */
    averageGradientColor: function(fullStops){
        var stops = gradienteditor.expand( $.extend(true, [], fullStops) ),
            reducedArray = [],
            l = stops.length;

        for(var i = 0; i < l; i++){
            var stop = stops[i];
            if(typeof stop === 'number'){
                stops[i] = this.getMiddlepoint(stops[i-1], stop, stops[i+1]);
            }
        }    

        for(var i = 0; i < l-1; i++){
            var stopA = stops[i],
                stopB = stops[i+1];

            reducedArray.push(this.averageStop(stopA, stopB));
        }        
        // reduce array to one rgb array
        reducedArray = reducedArray.reduce(this.averageColor, [0,0,0]);

        // round its values
        for(var i=0; i<3; i++){
            reducedArray[i] = Math.round(reducedArray[i]);
        }

        // return said array as color string
        return this.toColor(reducedArray);
    },
    /**
     * @method  averageStop
     * @param   stopA {stop-array}
     * @param   stopB {stop-array}
     * @return  color-stop {stop-array}
     * @example averageStop([[255,255,255], 0], [[0,0,0], 100]) returns [[128,128,128], 50]
     */
    averageStop: function(stopA, stopB){
        var colorA = stopA[0],
            posA = stopA[1],
            colorB = stopB[0],
            posB = stopB[1];

        return [
            [
                this.getCenter(colorA[0],colorB[0]),
                this.getCenter(colorA[1],colorB[1]),
                this.getCenter(colorA[2],colorB[2])
            ], 
            posB - posA
        ];
    },
    /**
     * @method  averageColor
     * @param   previousValue {color-array}
     * @param   currentValue {stop-array}
     * @return  color {color-array}
     */
    averageColor: function(previousValue, currentValue, index, array){
        var color = currentValue[0],
            weight = currentValue[1]/100;

        return [
            previousValue[0] + color[0] * weight, // r
            previousValue[1] + color[1] * weight, // g
            previousValue[2] + color[2] * weight  // b
        ];
    },
    /**
     * @method  roundToMultiple
     * @param   number {integer}
     * @param    multiple {integer}    multiple to round to
     * @return  rounded number {integer}
     * @example roundToMultiple(35, 15) returns 30
     * @usage    in ui.js -> pot; to round to 15° steps
     */
    roundToMultiple: function(number, multiple){
        var value = number/multiple,
            integer = Math.floor(value),
            rest = value - integer;
        return rest > 0.5 ? (integer+1)*multiple : integer*multiple;
    },
    /**
     * @method  toColor
     * @param   rgb {array}   RGB or RGBA Color Array
     * @return  CSS Color {string}
     * @example toColor([255,255,255]) returns 'rgb(255,255,255)'
     *          toColor([255,255,255,0.5]) returns 'rgba(255,255,255,0.5)'
     */
    toColor: function(rgb){
        var mode = rgb.length === 3 ? 'rgb' : 'rgba',
            string = mode+'('+rgb.join(',')+')';
                
        if (css.colors[string]) {
            return css.colors[string];
        }
        else if(this.options.hex && mode === 'rgb'){
            return "#"+color.hexFromRgb(rgb);
        }
        return string;
    },
    /**
     * @method  getCenter    returns the center between a starting and an ending point
     * @param   start {integer}    
     *             end {integer}
     *             offset {integer} [optional] if the center has an offset
     * @return  center {integer}
     * @example getCenter(0, 60) returns 30
     *             getCenter(0, 60, 75) returns 45
     */
    getCenter: function(start, end, offset){
        var o = offset || 50;
        return start + Math.round(o/100*(end-start));
    },
    /**
     * @method  getMiddlepoint    returns the color at a specific position on a color gradient defined through a start and end color
     * @param   start {array}    eiter a rgb color (like [255,255,255])or a rgb color and a positon (e.g. [[255,255,255], 10])
     *             pos {integer}    position
     *             end {array}        rgb color [r, g, b]
     * @return  {array} of the rgb color {array} and relative index {integer}
     * @example getCenter(0, 60) returns 30
     *             getCenter(0, 60, 75) returns 45
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
     * @param   stops {array}    encoded color stops
     * @param    alpha {float} [optional]     opacity value between 0-1
     * @return  {array} decoded color stops: rgb strings
     * @example decodeStops([0,0,0], 10, [255,255,255]) returns ['rgb(0,0,0)', 'rgb(25,25,25) 10%', 'rgb(255,255,255)']
     */
    decodeStops: function(stops){
        var steps = [];
        for(var i=0, length=stops.length; i<length; i++){
            var stop = stops[i];
            switch(typeof stop){
            case 'object': // => [255,255,255] or [[255,255,255], 33]
                if(stop.length > 2){ // => [255,255,255]
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
     * @method  decodeCanvasGradient
     * @param   stops {array} the color stops
     * @param    angle {integer} the gradients angle
     * @param   ctx {canvas 2d context}    the context the gradient is for
     * @param   x {integer}    the x coordinate where the gradient should start
     * @param   y {integer}    the y coordinate where the gradient should start
     * @param   width {integer}    the width of the gradients box
     * @param   height {integer} the height of the gradients box
     * @return  {canvas-gradient}
     */
    decodeCanvasGradient: function(stops, angle, style, ctx, x, y, width, height){
        var gradient,
            // looks like stops is still referenced to currentStyle.background.translucentStops at this point
            tempStops = $.extend(true, [], stops);
        
        switch(style){
            case "linear":
                /*     missing: angle support
                    
                    0°     ->     x+width,    y,             x,             y
                    45° ->    x+width,    y,            x,            y+height
                    90°    ->    x,            y,            x,            y+height
                    135°->    x,            y,            x+width,    y+height
                    180°->    x,            y,            x+width,    y
                    225°->    x,            y+height,    x+width,    y
                    270°->    x,            y+height,    x,            y
                    315°->    x+width,    y+height,    x,            y
                    
                    there is a pattern :) something with sin & cos
                    for now now default to 90
                */
                gradient = ctx.createLinearGradient(x, y, x, y+height);
                break;
            case "reflected":
                tempStops = this.reflectStops(tempStops);
                gradient = ctx.createLinearGradient(x, y, x, y+height);
                break;
            case "contain":
                var closestSide = width < height ? width/2 : height/2;
                gradient = ctx.createRadialGradient(x+width/2, y+height/2, 0, x+width/2, y+height/2, closestSide); // centered
                break;
            case "cover":
                // farest corner = half diagonal side >> pitagoras
                var farestCorner = Math.sqrt( width * width + height * height )/2;
                gradient = ctx.createRadialGradient(x+width/2, y+height/2, 0, x+width/2, y+height/2, farestCorner); // centered
                break;
        }
        // bring the stops in the right order for canvas gradient:
        for(var i=0, length=tempStops.length; i<length; i++){
            var stop = tempStops[i], color, pos;
            // if the first stop has an offset add a color stop to 0
            if(i === 0 && stop.length === 2){
                gradient.addColorStop(0, this.toColor(stop[0]));
            }
            switch(typeof stop){
            case 'object': // => [255,255,255] or [[255,255,255], 33]
                if(stop.length === 3){ // => [255,255,255]
                    pos = i === 0 ? 0 : 100; // can either be the start or the end
                    color = this.toColor(stop);
                }
                else { // => [[255,255,255], 33]
                    color = this.toColor(stop[0]);
                    pos = stop[1];
                }
                break;
            case 'number': // => 11
                var middlepoint = this.getMiddlepoint(tempStops[i-1], stop, tempStops[i+1]);
                color = this.toColor(middlepoint[0]);
                pos = middlepoint[1];
                break;
            }
            // pos is now between 0-100 - for canvas we need it between 0-1
            pos = pos/100;
            pos = pos+''; // <-- to change from number to string seems to fix a bug in firefox on ubuntu
             gradient.addColorStop(pos, color);
        }
        return gradient;
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
    reflectStops: function(stops){
        var first = [],
            second = [];
            // bug: turns everything around
        for(var i=0, l=stops.length; i<l; i++){
            var stop = stops.shift(),
                start, end;
            switch(typeof stop){
                case "number":
                    start = Math.round(stop/2);
                    end = 100-start;
                    break;
                case "object":
                    start = stop.slice(0);
                    end = stop.slice(0);
                    if(stop.length === 2){
                        start[1] = Math.round(stop[1]/2);
                        end[1] = 100-start[1];
                    }
                    break;
            }
            
            // add 50% to the last element
            if(i === l-1) start = [start, 50];
            
            first.push(start);
            
            // don't add the last stop cause we only need one center
            if(i != l-1) second.unshift(end);
        }
        return first.concat(second);
    },
    reverseStops: function(stops){
        var reversed = [],
            stops = stops.slice(0);
        while(stops.length){
            var stop = stops.pop(), rev;
            switch(typeof stop){
                case "number":
                    rev = 100-stop;
                    break;
                case "object":    
                    rev = stop.slice(0);
                    if(stop.length === 2){
                        rev[1] = 100-stop[1];
                    }
                    break;
            }
            reversed.push(rev);
        }
        return reversed;
    },
}