var css = {
    colors: {
        'rgb(0,0,0)': "black",
        'rgb(255,255,255)': "white"
    },
    directions: {
        315: "top left",
        270: "top",
        225: "top right",
        180: "right",
        135: "bottom right",
        90: "bottom",
        45: "bottom left",
        0: "left"
    },
    newGradientDirections: {
        315: "to bottom right",
        270: "to bottom",
        225: "to bottom left",
        180: "to left",
        135: "to top left",
        90: "to top",
        45: "to top right",
        0: "to right"
    },
    /**
     * @method  cssGradient    
     * @param   gradient {object}
     * @return  {array} decoded color stops: rgb strings
     * @example cssGradient([0,0,0], 10, [255,255,255]) returns "-moz-linear-gradient(top, 'rgb(0,0,0)', 'rgb(25,25,25) 10%', 'rgb(255,255,255)')"
     */
    cssGradient: function(stops, angle, style, prefix){
        var tempStops, shape = "", cssString = "", pos;
        if(tools.browserPrefix === '-moz-'){
            shape = "circle ";
        }
        if((prefix === "-webkit-" && Modernizr.oldwebkitgradient) || prefix === "-oldwebkit-"){
            cssString = this.oldWebkitGradient(stops, angle, style);
        } else {
            switch(style){
                case "linear": case "reflected":
                    tempStops = style === "reflected" ? tools.reflectStops(stops) : stops;

                    if (this.directions[angle]) {
                        pos = prefix === "" ? this.newGradientDirections[angle] : this.directions[angle];
                    } else {
                        pos = angle+"deg";
                    }
                    cssString = prefix +'linear-gradient('+ pos +', '+ tools.decodeStops(tempStops).join(", ") +')';
                    break;
                case "contain":
                    cssString = prefix +'radial-gradient(center center, '+shape+'contain, '+ tools.decodeStops(stops).join(", ") +')';
                    break;
                case "cover":
                    cssString = prefix +'radial-gradient(center center, '+shape+'cover, '+ tools.decodeStops(stops).join(", ") +')';
                    break;
            }
        }
        return cssString;
    },
    webkitAnglePos: {
        180: "right center, left center",
        225: "right top, left bottom",
        270: "center top, center bottom",
        315: "left top, right bottom",
        0: "left center, right center",
        45: "left bottom, right top",
        90: "center bottom, center top",
        135: "right bottom, left top"
    },
    oldWebkitGradient: function(stops, angle, style){
        var roundedAngle = tools.roundToMultiple(angle, 45),
            pos = this.webkitAnglePos[roundedAngle],
            radius = "", steps, width, height;
        
        if(style === "reflected"){
            style = "linear";
            stops = tools.reflectStops(stops);
        }
        else if(style === "contain" || style === "cover"){
            width = currentStyle.width;
            height = currentStyle.height;
            if(style === "contain"){
                radius = width < height ? width/2 : height/2;
            } else {
                radius = Math.round(Math.sqrt( width * width + height * height )/2);
            }
            pos = "center center, 0, center center, " + radius;
            style = "radial";
        }
        
        steps = tools.decodeStops(stops);
            
        // form old webkit gradient-stops syntax
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
        return '-webkit-gradient('+ style +', '+ pos +', '+ stops +')';
    },
    drawGradient: function(style, prefix){
        var cssString = "",
            model = style.background, 
            tempAngle, tempOpacity, tempStops,
            browserPrefix = prefix || "";
        
        if(model.isActive) {
            tempAngle = model.angle+180;
            if(tempAngle >= 360) tempAngle -= 360;
            tempOpacity = model.opacity;
            if(tempOpacity != 100){
                tempOpacity = model.opacity/100;
            }
            if(!model.translucidStops) model.translucidStops = $.extend(true, [], model.stops);
            
            // inject opacity into the rgb values or slice off the injection if opacity is 100
            for(var i=0, l=model.translucidStops.length; i<l; i++){
                switch(model.stops[i].length){
                case 2: // [[255,255,255], 45]
                    if(tempOpacity === 100){
                        model.translucidStops[i][0] = model.translucidStops[i][0].slice(0,3);
                    } else {
                        model.translucidStops[i][0][3] = tempOpacity;
                    }
                    break;
                case 3: case 4: // [255,255,255] or [255,255,255,0.5]
                    if(tempOpacity === 100){
                        model.translucidStops[i] = model.translucidStops[i].slice(0,3);
                    } else {
                        model.translucidStops[i][3] = tempOpacity;
                    }
                    break;
                }
            }
            tempStops = model.translucidStops.slice(0); // no deep copy!
            if(model.hasGlobalLight) tempAngle = style.globalAngle;
            if(model.isReverse) tempStops = tools.reverseStops(tempStops);
            cssString = this.cssGradient( tempStops, tempAngle, model.style, browserPrefix );
        }
        return cssString;
    },
    boxShadow: function(style){
        var cssString = "", radiants, dropColor, tempSize, tempX, tempY, tempBlur,
            shadows = ["dropShadow", "innerShadow"];
        
        for(var i=0; i<shadows.length; i++){
            var model = style[shadows[i]];
            if(model.isActive){
                if(cssString != "") cssString += ", ";
                if(model.hasGlobalLight) model.angle = style.globalAngle;
                radiants = (Math.PI / 180) * model.angle;
                model.dropX = Math.round(-model.distance * Math.cos(radiants));
                model.dropY = Math.round(model.distance * Math.sin(radiants));
                tempX = model.dropX === 0 ? "0 " : model.dropX + "px ";
                tempY = model.dropY === 0 ? "0 " : model.dropY + "px ";
                tempBlur = model.blur === 0 ? "0 " : model.blur + "px ";
                tempSize = model.size === 0 ? "" : model.size+"px ";
                if(model.opacity != 100){
                    dropColor = model.color.slice(0);
                    dropColor.push(model.opacity/100);
                } else {
                    dropColor = model.color;
                }
                if(model.isInset) cssString += "inset ";
                cssString += tempX + tempY + tempBlur + tempSize + tools.toColor(dropColor);
            }
        }
        return cssString;
    },
    border: function(style){
        var cssString = "",
            dropColor, model = style.border;
        if(model.isActive){
            if(model.opacity != 100){
                dropColor = model.color.slice(0);
                dropColor.push(model.opacity/100);
            } else {
                dropColor = model.color;
            }
            cssString += model.size+'px '+model.style+' '+tools.toColor(dropColor);
        }
        return cssString;
    },
    borderRadius: function(style){
        var cssObject = { "border-radius": 0 },
            model = style.borderRadius;
        
        if(model.isActive){
            var radii = [];
            for(var i=0; i<4; i++){
                var radius = model.radii[i]; // [pos, unit]
                if(radius[0] !== 0){
                    radii[i] = radius[0] + radius[1];
                } else {
                    radii[i] = 0;
                }
            }
            // check if radii are the same
            if(    radii[0] === radii[1] &&
                radii[1] === radii[2] &&
                radii[2] === radii[3] &&
                radii[3] === radii[0] ){
                    cssObject["border-radius"] = radii[0];
            } else {
                var topLeft = radii[0],
                    topRight = radii[1],
                    bottomRight = radii[2],
                    bottomLeft = radii[3];
            
                if(topRight === bottomLeft){
                    if(topLeft === bottomRight){
                        cssObject["border-radius"] = topLeft+" "+topRight;
                    } else {
                        cssObject["border-radius"] = topLeft+" "+topRight+" "+bottomRight;
                    }
                } else {
                    delete cssObject["border-radius"];
                    if(topLeft !== 0){
                        $.extend( cssObject, {'border-top-left-radius': topLeft} );
                    }
                    if(topRight !== 0){
                        $.extend( cssObject, {'border-top-right-radius': topRight} );
                    }
                    if(bottomRight !== 0){
                        $.extend( cssObject, {'border-bottom-right-radius': bottomRight} );
                    }
                    if(bottomLeft !== 0){
                        $.extend( cssObject, {'border-bottom-left-radius': bottomLeft} );
                    }
                }
            }
        } // if borderRadius active
        return cssObject;
    },
    displayCss: function(style){
        var cssObj = {
            'background': this.drawGradient(style, tools.browserPrefix),
            'border': this.border(style)
        };
        // the box-shadow problem: firefox 4.0 doesn't support the old -moz-box-shadow
        // but for safari we still need -webkit-box-shadow
        // so now we have the Modernizr.nonprefixboxshadow thingy which will only add the prefix to browsers who need prefixes - whola :-)
        var boxShadowKey = Modernizr.nonprefixboxshadow ? 'box-shadow' : tools.browserPrefix+'box-shadow';
        cssObj[boxShadowKey] = this.boxShadow(style);

        $.extend(true, cssObj, this.borderRadius(style));
        return cssObj;
    },
    render: function(){
        $layer.css( this.displayCss(currentStyle) );
    }
};