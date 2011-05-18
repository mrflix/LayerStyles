var pot = {
    init: function(el){
        // el = background, dropShadow, innerShadow
        this.$el = $("#"+el+" .pot");
        this.height = this.$el.height();
        this.width = this.$el.width();
        this.$pointer = this.$el.find('> div');
        this.model = el;
        this.$el.bind("mousedown", $.proxy( this, "start" ) );
        this.$input = this.$el.next('div').children('input:first-child');
        this.$input.change( $.proxy( this, "get" ) );
    },
    start: function(event){
        var myOffset = this.$el.offset();
        this.offset = { x: myOffset.left+(this.width/2), y: myOffset.top+(this.height/2) };
        this.turn(event);
        $(document).bind('mousemove.global', $.proxy( this, "turn") );
    },
    get: function(){
        var value = parseInt(this.$input.val());
        this.update(value);
    },
    set: function(value){
        this.$input.val(value);
    },
    update: function(value){
        this.move(value);
        if(currentStyle[this.model].hasGlobalLight) currentStyle.globalAngle = value;
        currentStyle[this.model].angle = value;
        this.set(value);
        style[this.model].paint();
    },
    move: function(degrees){
        this.$pointer.css(tools.browserPrefix+'transform', 'rotate('+-degrees+'deg)');
    },
    turn: function(event){
        event.preventDefault();
        var opposite = this.offset.y - event.pageY,
            adjacent = event.pageX - this.offset.x,
            radiants = Math.atan(opposite/adjacent),
            degrees = Math.round(radiants*(180/Math.PI), 10);
        
        if(event.shiftKey) degrees = tools.roundToMultiple(degrees, 15);
        
        if(adjacent < 0 && opposite >= 0){ degrees+= 180; }
        else if(opposite < 0 && adjacent < 0){ degrees-= 180; }
        if(degrees === -180) degrees = 180;
        
        this.update(degrees);
    }
};

var toggle = {
    _treshhold: 2,
    _moving: false,
    init: function(el, toggle, thisArg, callback){
        this.$el = $("#"+el);
        this.$slider = this.$el.find('.slidePanel');
        this.width = this.$el.width();
        this.toggle = toggle;
        this.model = thisArg;
        // render befor the callback gets asigned to not call the callback at init
        this.render();
        this.callback = callback;
        this.$el.bind('mousedown', $.proxy( this, "start" ) );
    },
    start: function(event){
        event.preventDefault();
        this._startPos = event.pageX - this.$el.offset().left;
        this.$el.addClass('down');
        $(document).bind('mousemove.global', $.proxy( this, "move") );
        $(document).one('mouseup', $.proxy( this, "stop") );
    },
    move: function(event){
        var distance = event.pageX - this._startPos;
        if(!this._moving && Math.abs(distance) > this._treshhold){
            this.$el.addClass('moving');
            this._moving = true;
        }
        if(this._moving){
            this._pos = Math.min(0, Math.max(-this.width/2, this._offset + distance));
            this.$slider.css('left', this._pos);
        }
    },
    render: function(){
        this._offset = this.model[this.toggle] ? -this.width/2 : 0;
        this.$slider.css('left', this._offset);
        if(this.callback) this.callback();
    },
    stop: function(event){
        this.$el.removeClass('down');
        if(this._moving){
            this._moving = false;
            this.$el.removeClass('moving');
            if(this._pos >= -this.width/4){
                this.model[this.toggle] = false;
            } else {
                this.model[this.toggle] = true;
            }
        } else {
            this.model[this.toggle] = !this.model[this.toggle];
        }    
        this.render();
    }
};

var slider = {
    init: function(el, model){
        this.$el = $("#"+el+" ."+model).prev("div.slider");
        this.$pointer = this.$el.find('> div:nth-child(2)');
        this.$input = this.$el.next('input');
        this.max = this.$input.data("max");
        this.length = this.$el.width();
        this.ease = this.$el.data("easing");
        this.style = el;
        this.model = model;
        this.$el.bind("mousedown", $.proxy( this, "start" ) );
        this.$input.change( $.proxy( this, "get" ) );
    },
    acc: function(x){
        return this.ease ? x*x : x;
    },
    invAcc: function(x){
        return this.ease ? Math.sqrt(x) : x;
    },
    get: function(){
        var value = parseInt(this.$input.val());
        this.update(value);
    },
    set: function(value){
        this.$input.val(value);
    },
    update: function(value, position){
        this.move(this.toPos(value));
        currentStyle[this.style][this.model] = value;
        this.move(position || this.toPos(value));
        this.set(value);
        style[this.style].paint();
    },
    move: function(x){
        this.$pointer.css({ left: x+'px' });
    },
    toPos: function(value){
        var percentage = this.invAcc(value/this.max);
        return Math.round(this.length*percentage);
    },
    toValue: function(position){
        var percentage = this.acc(position/this.length);
        return Math.round(percentage*this.max);
    },
    start: function(event){
        this.offset = { x: this.$el.offset().left };
        this.slide(event);
        $(document).bind('mousemove.global', $.proxy( this, "slide" ) );
    },
    slide: function(event){
        event.preventDefault();
        var value, position = Math.max(0, Math.min(this.length, event.pageX - this.offset.x));    
        
        value = this.toValue(position);
        this.update(value, position);
    }
};