var style = {
    background: {
        elements: {
            ".opacity": { name: "opacity", handle: "slider" },
            ".gradientField": "gradientField",
            ".reverse": "reverse",
            ".angle": { name: "angle", handle: "pot" },
            ".globalLight": "globalLight"
        },
        $styles: $('#background_style'),
        init: function(el){
            this.$el = $("#"+el);
            this.selector = el;
            this.$menuItem = $('.nav-'+el);
            this.$checkbox = this.$menuItem.find('input[type=checkbox]');
            this.$inputs = this.$el.find('input[type=text]');
            this.initElements();
            this.updateStops();
            this.$gradientField.click( $.proxy( this, "edit" ) );
            this.$reverse.change( $.proxy( this, "switchReverse" ) );
            this.$globalLight.click( $.proxy( this, "switchLight" ) );
            this.$checkbox.click( $.proxy( this, "check" ) );
            this.$menuItem.click( $.proxy( this, "select" ) );
            this.$styles.change( $.proxy( this, "updateStyle" ) );
            $(document).bind('styleChange', $.proxy( this, "populateInputs" ));
        },
        initElements: function(){
            for (var key in this.elements) {
                var el = this.elements[key];
                if(typeof el === 'object'){
                    this["$"+el.name] = $(key, this.$el);
                    switch(el.handle){
                        case "slider":
                            this[el.name+"Slider"] = Object.create(slider);
                            this[el.name+"Slider"].init(this.selector, el.name);
                            break;
                        case "pot":
                            this[el.name+"Pot"] = Object.create(pot);
                            this[el.name+"Pot"].init(this.selector);
                            break;
                    }
                } else {
                    this["$"+el] = $(key, this.$el);
                }
            }
        },
        populateInputs: function(){
            this.setActive();
            this.opacitySlider.update(currentStyle[this.selector].opacity);
            this.updateStops();
            this.setReverse();
            this.displayStyle();
            this.setLight();
        },
        select: function(){
            if(!currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = true;
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
                this.paint();
            }
        },
        check: function(e){
            e.stopPropagation();
            if(currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = false;
            } else {    
                currentStyle[this.selector].isActive = true;
            }    
            this.setActive();
            this.paint();
        },
        setActive: function(){
            if(currentStyle[this.selector].isActive){
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
            } else {    
                this.$checkbox.prop('checked', false);
                this.$el.addClass('inactive');
                this.$inputs.prop('disabled', true);
            }
        },
        edit: function(){
            gradienteditor.edit(currentStyle[this.selector].stops, this.updateStops, this);
        },
        setReverse: function(){
            if(currentStyle[this.selector].isReverse){
                this.$reverse.prop('checked', true);
            } else {    
                this.$reverse.prop('checked', false);
            }    
            this.updateStops();
            this.paint();
        },
        switchReverse: function(){
            if(currentStyle[this.selector].isReverse){
                currentStyle[this.selector].isReverse = false;
            } else {    
                currentStyle[this.selector].isReverse = true;
            }
            this.setReverse();
        },
        setLight: function(){
            if(currentStyle[this.selector].hasGlobalLight){
                this.$globalLight.prop('checked', true);
                this.anglePot.update(currentStyle.globalAngle);
            } else {
                this.$globalLight.prop('checked', false);
                this.anglePot.update(currentStyle[this.selector].angle);
            }    
        },
        switchLight: function(){
            if(currentStyle[this.selector].hasGlobalLight){
                currentStyle[this.selector].hasGlobalLight = false;
            } else {
                currentStyle[this.selector].hasGlobalLight = true;
            }
            this.setLight();
            this.paint();
        },
        updateStyle: function(){
            currentStyle[this.selector].style = this.$styles.val();
            this.paint();
        },
        displayStyle: function(){
            this.$styles.val(currentStyle[this.selector].style);
        },
        updateStops: function(stops){
            if(stops){
                currentStyle[this.selector].stops = stops;
                currentStyle[this.selector].translucidStops = $.extend(true, [], stops);
                this.paint();
            }
            this.$gradientField.css('background', css.cssGradient( currentStyle[this.selector].stops, currentStyle[this.selector].isReverse ? 180 : 0, "linear", tools.browserPrefix));
        },
        paint: function(){
            $(document).trigger('paint');
        }
    },
    shadow: {
        elements: {
            ".opacity": { name: "opacity", handle: "slider" },
            ".color_field": "color",
            ".angle": { name: "angle", handle: "pot" },
            ".globalLight": "globalLight",
            ".distance": { name: "distance", handle: "slider" },
            ".blur": { name: "blur", handle: "slider" },
            ".size": { name: "size", handle: "slider" }
        },
        init: function(el){
            this.$el = $("#"+el);
            this.selector = el;
            this.$menuItem = $('.nav-'+el);
            this.$checkbox = this.$menuItem.find('input[type=checkbox]');
            this.$inputs = this.$el.find('input[type=text]');
            this.initElements();
            this.updateColor();
            this.$color.click( $.proxy( this, "pick" ) );
            this.$checkbox.click( $.proxy( this, "check" ) );
            this.$menuItem.click( $.proxy( this, "select" ) );
            this.$globalLight.click( $.proxy( this, "switchLight" ) );
            $(document).bind('styleChange', $.proxy( this, "populateInputs" ));
        },
        initElements: function(){
            for (var key in this.elements) {
                var el = this.elements[key];
                if(typeof el === 'object'){
                    this["$"+el.name] = $(key, this.$el);
                    switch(el.handle){
                        case "slider":
                            this[el.name+"Slider"] = Object.create(slider);
                            this[el.name+"Slider"].init(this.selector, el.name);
                            //if(el.autoUpdate) currentStyle[this.selector].__defineSetter__( el.name , $.proxy( this[el.name+"Slider"], "set" ) );
                            break;
                        case "pot":
                            this[el.name+"Pot"] = Object.create(pot);
                            this[el.name+"Pot"].init(this.selector);
                            break;
                    }
                } else {
                    this["$"+el] = $(key, this.$el);
                }
            }
        },
        populateInputs: function(){
            this.setActive();
            this.updateColor();
            this.opacitySlider.update(currentStyle[this.selector].opacity);
            this.distanceSlider.update(currentStyle[this.selector].distance);
            this.blurSlider.update(currentStyle[this.selector].blur);
            this.sizeSlider.update(currentStyle[this.selector].size);
            this.setLight();
        },
        select: function(){
            if(!currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = true;
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
                this.paint();
            }
        },
        check: function(e){
            e.stopPropagation();
            if(currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = false;
            } else {    
                currentStyle[this.selector].isActive = true;
            }    
            this.setActive();
            this.paint();
        },
        setActive: function(){
            if(currentStyle[this.selector].isActive){
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
            } else {    
                this.$checkbox.prop('checked', false);
                this.$el.addClass('inactive');
                this.$inputs.prop('disabled', true);
            }
        },
        pick: function(){
            colorpicker.pick(currentStyle[this.selector].color, this.updateColor, this);
        },
        setLight: function(){
            if(currentStyle[this.selector].hasGlobalLight){
                this.$globalLight.prop('checked', true);
                this.anglePot.update(currentStyle.globalAngle);
            } else {
                this.$globalLight.prop('checked', false);
                this.anglePot.update(currentStyle[this.selector].angle);
            }
        },
        switchLight: function(){
            if(currentStyle[this.selector].hasGlobalLight){
                currentStyle[this.selector].hasGlobalLight = false;
            } else {
                currentStyle[this.selector].hasGlobalLight = true;
            }
            this.setLight();    
            this.paint();
        },
        updateColor: function(currentColor){
            if(currentColor){
                currentStyle[this.selector].color = currentColor;
                this.paint();
            }
            this.$color.css('background', '#'+color.hexFromRgb(currentStyle[this.selector].color));
        },
        paint: function(){
            $(document).trigger('paint');
        }
    },
    border: {
        elements: {
            ".color_field": "color",
            ".opacity": { name: "opacity", handle: "slider" },
            ".size": { name: "size", handle: "slider" }
        },
        $styles: $('#border_styles').find('> div'),
        init: function(el){
            this.$el = $("#"+el);
            this.selector = el;
            this.$menuItem = $('.nav-'+el);
            this.$checkbox = this.$menuItem.find('input[type=checkbox]');
            this.$inputs = this.$el.find('input[type=text]');
            this.initElements();
            this.updateColor();
            this.$color.click( $.proxy( this, "pick" ) );
            this.$checkbox.click( $.proxy( this, "check" ) );
            this.$menuItem.click( $.proxy( this, "select" ) );
            this.$styles.click( $.proxy( this, "updateStyle" ) );
            $(document).bind('styleChange', $.proxy( this, "populateInputs" ));
        },
        initElements: function(){
            for (var key in this.elements) {
                var el = this.elements[key];
                if(typeof el === 'object'){
                    this["$"+el.name] = $(key, this.$el);
                    switch(el.handle){
                        case "slider":
                            this[el.name+"Slider"] = Object.create(slider);
                            this[el.name+"Slider"].init(this.selector, el.name);
                            break;
                        case "pot":
                            this[el.name+"Pot"] = Object.create(pot);
                            this[el.name+"Pot"].init(this.selector);
                            break;
                    }
                } else {
                    this["$"+el] = $(key, this.$el);
                }
            }
        },
        populateInputs: function(){
            this.setActive();
            this.updateColor();
            this.opacitySlider.update(currentStyle[this.selector].opacity);
            this.sizeSlider.update(currentStyle[this.selector].size);
            this.setStyle();
        },
        select: function(){
            if(!currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = true;
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
                this.paint();
            }
        },
        check: function(e){
            e.stopPropagation();
            if(currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = false;
            } else {    
                currentStyle[this.selector].isActive = true;
            }    
            this.setActive();
            this.paint();
        },
        setActive: function(){
            if(currentStyle[this.selector].isActive){
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
            } else {    
                this.$checkbox.prop('checked', false);
                this.$el.addClass('inactive');
                this.$inputs.prop('disabled', true);
            }
        },
        pick: function(){
            colorpicker.pick(currentStyle[this.selector].color, this.updateColor, this);
        },
        setStyle: function(){
            for(var i=0, l=this.$styles.length; i<l; i++){
                if(this.$styles.eq(i).data('style') === currentStyle[this.selector].style){
                    this.updateStyle(null, this.$styles.eq(i));
                    return false;
                }    
            }
        },
        updateStyle: function(event, setStyle){
            var obj = $(setStyle || event.target);
            this.$styles.removeClass('active');
            obj.addClass('active');
            currentStyle[this.selector].style = obj.data('style');
            this.paint();
        },
        updateColor: function(currentColor){
            if(currentColor){
                currentStyle[this.selector].color = currentColor;
                this.paint();
            }
            this.$color.css('background', '#'+color.hexFromRgb(currentStyle[this.selector].color));
        },
        paint: function(){
            $(document).trigger('paint');
        }
    },
    borderRadius: {
        $pixel: $('#border_radius_pixel'),
        $percent: $('#border_radius_percent'),
        $preview: $('#border_radius_preview'),
        $topLeft: $('#topLeft'),
        $topRight: $('#topRight'),
        $bottomLeft: $('#bottomLeft'),
        $bottomRight: $('#bottomRight'),
        maxRadius: 200,
        init: function(el){
            this.$el = $("#"+el);
            this.selector = el;
            this.$menuItem = $('.nav-'+el);
            this.$checkbox = this.$menuItem.find('input[type=checkbox]');
            this.$inputs = this.$el.find('input[type=text]');
            this.$radius = $('.radius', this.$el);
            this.radiusSlider = Object.create(slider);
            this.radiusSlider.init(this.selector, "radius");
            this.$checkbox.click( $.proxy( this, "check" ) );
            this.$menuItem.click( $.proxy( this, "select" ) );
            this.$pixel.add(this.$percent).click( $.proxy( this, "updateUnit" ) );
            this.$preview.mousedown( $.proxy( this, "startSelection" ) );
            this.$fields = this.$preview.children();
            $(document).bind('styleChange', $.proxy( this, "populateInputs" ));
        },
        populateInputs: function(){
            this.setActive();
            currentStyle[this.selector].radius = 0;
            currentStyle[this.selector].__defineSetter__( "radius", $.proxy( this, "updateRadius" ) );
        },
        select: function(){
            if(!currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = true;
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
                this.paint();
            }
        },
        check: function(e){
            e.stopPropagation();
            if(currentStyle[this.selector].isActive){
                currentStyle[this.selector].isActive = false;
            } else {    
                currentStyle[this.selector].isActive = true;
            }    
            this.setActive();
            this.paint();
        },
        setActive: function(){
            if(currentStyle[this.selector].isActive){
                this.$checkbox.prop('checked', true);
                this.$el.removeClass('inactive');
                this.$inputs.prop('disabled', false);
            } else {    
                this.$checkbox.prop('checked', false);
                this.$el.addClass('inactive');
                this.$inputs.prop('disabled', true);
            }
        },
        startSelection: function(event){
            $(document).bind('mousemove.global', $.proxy( this, "updateSelection" ) );
            this.currentTarget = event.target;
            $(event.target).toggleClass("active");
            $(document).one('mouseup', $.proxy( this, "setSelection" ) );
        },
        updateSelection: function(event){
            if(event.target != this.currentTarget){
                $(event.target).toggleClass("active");
                this.currentTarget = event.target;
            }
        },
        updateRadius: function(value){
            for(var i=0; i<4; i++){
                if(currentStyle[this.selector].isSelected[i]){ 
                    currentStyle[this.selector].radii[i] = currentStyle[this.selector].hasPercentage[i] ? [value, "%"] : [value, "px"];
                }
            }
            this.paint();
        },
        setSelection: function(e){
            var value, sum = 0, amount = 0, average = 0, equal = false;
            for(var i=0; i<4; i++){
                if(this.$fields.eq(i).hasClass("active")){ 
                    currentStyle[this.selector].isSelected[i] = true;
                    // count the sum of all radii
                    value = parseInt(currentStyle[this.selector].radii[i][0], 10);
                    sum+=value;
                    amount++;
                    if(sum/amount === value){
                        equal = true;
                    } else {
                        equal = false;
                    }
                } else {
                    currentStyle[this.selector].isSelected[i] = false;
                }
            }
            // set radius value (average) but don't set css
            average = amount === 0 ? 0 : Math.floor(sum/amount);
            value = equal ? average : 0;
            this.radiusSlider.set(value);
            this.radiusSlider.move(this.radiusSlider.toPos(value));
        },
        updateUnit: function(event){
            var $el = $(event.target), average, sum = 0, amount = 0;
            switch($el.attr('data-unit')){
                case "%":
                    for(var i=0; i<4; i++){
                        if(currentStyle[this.selector].isSelected[i]){
                            var radius = currentStyle[this.selector].radii[i][0];
                            // recalculate value from pixel to percent and limit to 50
                            var value = Math.floor(Math.min(50, radius*100/currentStyle.height)); // height or width?
                            currentStyle[this.selector].radii[i] = [value, "%"];
                            currentStyle[this.selector].hasPercentage[i] = true;
                            sum += value;
                            amount++;
                        }
                    }
                    // limit slider to 50
                    this.radiusSlider.max = 50;
                    // uncheck pixel button
                    this.$pixel.removeClass("active");
                    break;
                case "px":
                    for(var i=0; i<4; i++){
                        if(currentStyle[this.selector].isSelected[i]){
                            var radius = currentStyle[this.selector].radii[i][0];
                            // recalculate value from percent to pixel and limit to maxRadius
                            var value = Math.floor(Math.min(currentStyle[this.selector].maxRadius, radius*currentStyle.height/100)); // height or width?
                            currentStyle[this.selector].radii[i] = [value, "px"];
                            currentStyle[this.selector].hasPercentage[i] = false;
                            sum += value;
                            amount++;
                        }
                    }
                    // reset limit
                    this.radiusSlider.max = this.maxRadius;
                    // uncheck percent button
                    this.$percent.removeClass("active");
                    break;
            }
            average = Math.floor(sum/amount);
            // update input value to the average value and trigger change() to adjust the slider
            this.radiusSlider.set(average);
            this.radiusSlider.move(this.radiusSlider.toPos(average));
            $el.addClass("active");
            this.paint();
        },
        paint: function(){
            $(document).trigger('paint');
        }
    },
    init: function(){
        this.background.init("background");
        
        this.dropShadow = Object.create(style.shadow);
        this.dropShadow.init("dropShadow");
        
        this.innerShadow = Object.create(style.shadow);
        this.innerShadow.init("innerShadow");
        
        this.border.init("border");
        
        this.borderRadius.init("borderRadius");
    }
};