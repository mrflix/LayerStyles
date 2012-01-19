var codeBox = {
    options: {
        visible: true,
        height: 163
    },
    minHeight: 100,
    init: function(){
        if(localStorage["codeBoxOptions"]) this.options = JSON.parse(localStorage["codeBoxOptions"]);
        this.$el = $('#codeBox');
        this.$box = this.$el.find('code');
        this.$body = this.$el.find('.body');
        this.$copyCode = this.$el.find('#copyCode');
        this.$dragger = this.$el.find('.dragger.y');
        this.$codeBoxToggle = $('#codeBoxToggle');
        this.$colorToggle = Object.create(toggle);
        this.$colorToggle.init("colorSwitch", "hex", tools.options, $.proxy( this, "render" ));
        
        this.location = window.location.href.slice(0, window.location.href.lastIndexOf("/"));
        this.initClipboard();
        
        this.$copyCode.add(this.$body).add(this.$box)
            .bind('mousedown', function(e){ e.stopPropagation(); });
        this.$codeBoxToggle.click( $.proxy( this, "toggle" ) );
        this.$dragger.mousedown( $.proxy( this, "drag") );
        
        this.updateView();
    },
    toggle: function(){
        if(this.$el.height() === 0){
            this.options.visible = true;
        } else {
            this.options.visible = false;
        }
        this.storeSettings();
        this.updateView();
        $(window).trigger('resize');
    },
    updateView: function(){
        if(this.options.visible){
            this.$el.height(this.options.height);
        } else {
            this.$el.height(0);
        }
    },
    drag: function(event){
        event.preventDefault();
        var my_offset = $(event.target).offset();
        offset = { y: event.pageY-my_offset.top };
        this.$el.addClass("resizing");
        this.resize(event);
        $(document).one('mouseup', function(){ codeBox.$el.removeClass('resizing') } );
        $(document).bind('mousemove.global', $.proxy( this, "resize") );
    },
    resize: function(event){
        this.options.height = Math.max(this.minHeight, $(document).height() - event.pageY + offset.y);
        this.$el.height(this.options.height);
        $(window).trigger('resize');
        this.storeSettings();
    },
    storeSettings: function(){
        localStorage["codeBoxOptions"] = JSON.stringify(this.options);
    },
    /**
     * @method  initClipboard - a click on the button with the id 'copyCode' will copy 'this.$box.text()' into the clipboard
     * @see        http://code.google.com/p/zeroclipboard/wiki/Instructions
     */
    initClipboard: function(){
        ZeroClipboard.setMoviePath( this.location + '/js/zeroclipboard/ZeroClipboard.swf' );
        this.clip = new ZeroClipboard.Client();
        this.clip.addEventListener( 'onMouseDown', $.proxy( this, "copy" ) );
        this.clip.setHandCursor(true);
        var flash = this.clip.getHTML(this.$copyCode.width(), this.$copyCode.height());
        this.$copyCode.append(flash);
    },
    copy: function(){
        var text = this.code.replace(/<br>/g, "\n").replace(/&nbsp;/g, "");
        this.clip.setText(text);
    },
    tabs: function(count){
        var tabString = "",
            tabs = count || this.options.tabs;
        
        for(;tabs--;){
            tabString += "&nbsp;";
        }
        return tabString;
    },
    render: function(){
        var borderRadiusObject;
        this.code = "";
        // add border
        this.code += currentStyle.border.isActive ? "border: " + css.border(currentStyle) + ";<br>" : "";
        // add border-radius
        if(currentStyle.borderRadius.isActive){
            borderRadiusObject = css.borderRadius(currentStyle);
            for(var key in borderRadiusObject){
                var radius = borderRadiusObject[key];
                if(radius !== 0){
                    this.code += key + ": " + radius + ";<br>";
                }
            }
        }
        // add gradient
        if(currentStyle.background.isActive){
            this.code += "background: " + tools.averageGradientColor(currentStyle.background.stops) + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "-oldwebkit-") + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "-webkit-") + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "-moz-") + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "-o-") + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "-ms-") + ";<br>";
            this.code += "background-image: " + css.drawGradient(currentStyle, "") + ";<br>";
        }
        // add dropShadow and innerShadow
        if(currentStyle.dropShadow.isActive || currentStyle.innerShadow.isActive){
            this.code += "-webkit-box-shadow: " + css.boxShadow(currentStyle) + ";<br>";
            this.code += "-moz-box-shadow: " + css.boxShadow(currentStyle) + ";<br>";
            this.code += "box-shadow: " + css.boxShadow(currentStyle) + ";<br>";
        }
        this.$box.html(this.code);
    }
};