/*
 *      LayerStyles
 *       http://www.layerstyles.org
 *    
 *    Copyright (c) 2011 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

var colorpicker = {
    open: false,
    currentColor: "000000", // hex
    callback: null,
    thisArg: null,
    swatches: [
        {'title': 'White', 'hex': 'ffffff'},
        {'title': '10% Gray', 'hex': 'e5e5e5'},
        {'title': '20% Gray', 'hex': 'cccccc'},
        {'title': '30% Gray', 'hex': 'b3b3b3'},
        {'title': '40% Gray', 'hex': '999999'},
        {'title': '50% Gray', 'hex': '808080'},
        {'title': '60% Gray', 'hex': '666666'},
        {'title': '70% Gray', 'hex': '4d4d4d'},
        {'title': '80% Gray', 'hex': '333333'},
        {'title': '90% Gray', 'hex': '1a1a1a'},
        {'title': 'Black', 'hex': '000000'}
    ],
    $selectedInput: null,
    colorHistory: [],
    pointerPos: { 'x': 0, 'y': 0 },
    hsb: { h: 0, s: 0, b: 0 },
    rgb: { r: 0, g: 0, b: 0 },
    hex: '000000',
    mode: 'hsb_b',
    max: 0, // the maximum input value
    ratio: 0, // the ratio for the slider: its 0.7111 (hue), ~1 (rgb) or 2.56 (saturation/brightness)
    offset: 0, // the offset relative to the document will be stored in here to calculate mouse-dragging
    pick: function(rgbArray, callback, thisArg) {
        showPickArea();
        this.callback = callback;
        this.thisArg = thisArg;
        // set rgb
        this.setRgb(parseInt(rgbArray[0],10),parseInt(rgbArray[1],10),parseInt(rgbArray[2],10));
        // update
        this.update('rgb_r');
        // set currentColor
        this.setCurrentColor();
        // show it
        nav.goTo(3);
    },
    setCurrentColor: function(hex) {
        this.currentColor = hex || this.hex;
        this.$currentColor.css('background', '#'+this.currentColor);
    },
    pickCurrentColor: function(){
        this.setHex(this.currentColor);
        this.update('hex');
    },
    clickHex: function(){
        this.$hex.focus();
    },
    update: function(customMode) {
        var updateMode = customMode || this.mode;
        switch(updateMode){
        case 'hsb_h': case 'hsb_s': case 'hsb_b':
            this.getHsb();
            this.hsbToRgb();
            this.rgbToHex();
            break;
        case 'rgb_r': case 'rgb_g': case 'rgb_b':
            this.getRgb();
            this.rgbToHsb();
            this.rgbToHex();
            break;
        case 'hex':
            this.getHex();
            this.hexToRgb();
            this.rgbToHsb();
            break;
        }
        this.paintField();
        this.paintSlider();
        this.setNewColor();
        this.moveSlider(this.$selectedInput.val()*this.ratio);
        if(this.callback) this.callback.call(this.thisArg, color.rgbFromHex(this.hex));
    },
    paintField: function() {
        var xGradient, yGradient;
        this.cf.save();
        this.cf.clearRect(0,0,256,256);
        xGradient = this.cf.createLinearGradient(0, 0, 0, 256);
        yGradient = this.cf.createLinearGradient(0, 0, 256, 0);
        switch (this.mode) {
        case 'hsb_h': // rainbow
            var hue = color.rgbFromHsb([this.hsb.h, 100, 100]);
            yGradient.addColorStop(0, 'white');
            yGradient.addColorStop(1, 'rgb('+hue[0]+','+hue[1]+','+hue[2]+')');
            xGradient.addColorStop(0, 'transparent');
            xGradient.addColorStop(1, 'black');
            break;
        case 'hsb_s': // rainbow
            yGradient.addColorStop(0, 'rgb(255,0,0)');
            yGradient.addColorStop(1/6, 'rgb(255,255,0)');
            yGradient.addColorStop(2/6, 'rgb(0,255,0)');
            yGradient.addColorStop(3/6, 'rgb(0,255,255)');
            yGradient.addColorStop(4/6, 'rgb(0,0,255)');
            yGradient.addColorStop(5/6, 'rgb(255,0,255)');
            yGradient.addColorStop(1, 'rgb(255,0,0)');
            xGradient.addColorStop(0, 'rgba(0,0,0,'+(1-this.hsb.s/100)+')' );
            xGradient.addColorStop(1, 'black' );
            break;
        case 'hsb_b': // rainbow from saturated to unsaturated
            var grey = parseInt(this.hsb.b*2.56, 10);
            yGradient.addColorStop(0, 'rgb(255,0,0)');
            yGradient.addColorStop(1/6, 'rgb(255,255,0)');
            yGradient.addColorStop(2/6, 'rgb(0,255,0)');
            yGradient.addColorStop(3/6, 'rgb(0,255,255)');
            yGradient.addColorStop(4/6, 'rgb(0,0,255)');
            yGradient.addColorStop(5/6, 'rgb(255,0,255)');
            yGradient.addColorStop(1, 'rgb(255,0,0)');
            xGradient.addColorStop(0, 'rgba('+grey+','+grey+','+grey+','+(1-this.hsb.b/100)+')');
            xGradient.addColorStop(1, 'rgb('+grey+','+grey+','+grey+')');
            break;
        case 'rgb_r':
            this.cf.globalCompositeOperation = 'lighter';
            xGradient.addColorStop(0, 'rgb('+this.rgb.r+',255,0)');
            xGradient.addColorStop(1, 'rgb('+this.rgb.r+',0,0)');
            yGradient.addColorStop(0, 'rgb('+this.rgb.r+',0,0)');
            yGradient.addColorStop(1, 'rgb('+this.rgb.r+',0,255)');
            break;
        case 'rgb_g':
            this.cf.globalCompositeOperation = 'lighter';
            xGradient.addColorStop(0, 'rgb(255,'+this.rgb.g+',0)');
            xGradient.addColorStop(1, 'rgb(0,'+this.rgb.g+',0)');
            yGradient.addColorStop(0, 'rgb(0,'+this.rgb.g+',0)');
            yGradient.addColorStop(1, 'rgb(1,'+this.rgb.g+',255)');
            break;
        case 'rgb_b':
            this.cf.globalCompositeOperation = 'lighter';
            xGradient.addColorStop(0, 'rgb(0,255,'+this.rgb.b+')');
            xGradient.addColorStop(1, 'rgb(0,0,'+this.rgb.b+')');
            yGradient.addColorStop(0, 'rgb(0,0,'+this.rgb.b+')');
            yGradient.addColorStop(1, 'rgb(255,0,'+this.rgb.b+')');
            break;
        }
        this.cf.beginPath();
        this.cf.rect(0, 0, 256, 256);
        this.cf.closePath();
        this.cf.fillStyle = yGradient;
        this.cf.fill();
        this.cf.beginPath();
        this.cf.rect(0, 0, 256, 256);
        this.cf.closePath();
        this.cf.fillStyle = xGradient;
        this.cf.fill();
        this.cf.restore();
        this.movePointer();
    },
    startPointer: function(event) {
        this.offset = this.$circleField.offset();
        this.calculatePointer(event);
        $(document).bind('mousemove.global', jQuery.proxy(this, "calculatePointer"));
    },
    calculatePointer: function(event) {
        event.preventDefault();
        this.pointerPos.x = Math.max(0, Math.min(256, event.pageX-this.offset.left));
        this.pointerPos.y = Math.max(0, Math.min(256, event.pageY-this.offset.top));
        switch(this.mode){
        case 'hsb_h':
            this.$hsb_s.val(parseInt(this.pointerPos.x/2.56, 10));
            this.$hsb_b.val(100-parseInt(this.pointerPos.y/2.56, 10));
            break;
        case 'hsb_s':
            this.$hsb_h.val(parseInt(this.pointerPos.x/0.71111, 10));
            this.$hsb_b.val(100-parseInt(this.pointerPos.y/2.56, 10));
            break;
        case 'hsb_b':
            this.$hsb_h.val(parseInt(this.pointerPos.x/0.71111, 10));
            this.$hsb_s.val(100-parseInt(this.pointerPos.y/2.56, 10));
            break;
        case 'rgb_r':
            this.$rgb_b.val(parseInt(this.pointerPos.x/1.003921, 10));
            this.$rgb_g.val(255-parseInt(this.pointerPos.y/1.003921, 10));
            break;
        case 'rgb_g':
            this.$rgb_b.val(parseInt(this.pointerPos.x/1.003921, 10));
            this.$rgb_r.val(255-parseInt(this.pointerPos.y/1.003921, 10));
            break;
        case 'rgb_b':
            this.$rgb_r.val(parseInt(this.pointerPos.x/1.003921, 10));
            this.$rgb_g.val(255-parseInt(this.pointerPos.y/1.003921, 10));
            break;
        }
        this.movePointer();
        this.update();
    },
    movePointer: function(x, y) {
        this.pointerPos.x = x >= 0 ? x : this.pointerPos.x;
        this.pointerPos.y = y >= 0 ? y : this.pointerPos.y;
        this.cc.clearRect(0,0,256,256);
        // limit x and y to 0-255 cause we need +1 (=256) space to detect the underlaying color 
        var detectX = Math.min(255, this.pointerPos.x),
            detectY = Math.min(255, this.pointerPos.y);
        var background = this.cf.getImageData(detectX, detectY, 1, 1).data;
        // check if the underlying color is dark or light and set the circle color according to that
        // -> white circle if the underlying color is dark (treshhold of 128 - where 256 is white) - otherwise black
        this.cc.strokeStyle = ((background[0]+background[1]+background[2])/3) < 128 ? 'white' : 'black';
        this.cc.beginPath();
        this.cc.arc(detectX + 0.5, detectY + 0.5, 5, 0, Math.PI*2, true);
        this.cc.closePath();
        this.cc.stroke();
    },
    drawPointer: function() {
        var posX = 0,
            posY = 0;
        switch(this.mode){
        case 'hsb_h':
            posX = this.hsb.s*2.56;
            posY = (100-this.hsb.b)*2.56;
            break;
        case 'hsb_s':
            posX = this.hsb.h*0.71111;
            posY = (100-this.hsb.b)*2.56;
            break;
        case 'hsb_b':
            posX = this.hsb.h*0.71111;
            posY = (100-this.hsb.s)*2.56;
            break;
        case 'rgb_r':
            posX = this.rgb.b*1.003921;
            posY = (255-this.rgb.g)*1.003921;
            break;
        case 'rgb_g':
            posX = this.rgb.b*1.003921;
            posY = (255-this.rgb.r)*1.003921;
            break;
        case 'rgb_b':
            posX = this.rgb.r*1.003921;
            posY = (255-this.rgb.g)*1.003921;
            break;
        }
        this.movePointer(parseInt(posX, 10), parseInt(posY, 10));
    },
    paintSlider: function() {
        var gradient = this.cs.createLinearGradient(0, 0, 0, 256);
        this.cs.clearRect(0,0,19,256);
        switch (this.mode) {
        case 'hsb_h': // rainbow
            gradient.addColorStop(0, 'rgb(255,0,0)');
            gradient.addColorStop(1/6, 'rgb(255,0,255)');
            gradient.addColorStop(2/6, 'rgb(0,0,255)');
            gradient.addColorStop(3/6, 'rgb(0,255,255)');
            gradient.addColorStop(4/6, 'rgb(0,255,0)');
            gradient.addColorStop(5/6, 'rgb(255,255,0)');
            gradient.addColorStop(1, 'rgb(255,0,0)');
            break;
        case 'hsb_s': // max saturation to unsaturated
            var brightness = this.hsb.b;
            if(brightness <= 33) brightness = 33;
            var saturated = color.rgbFromHsb([this.hsb.h, 100, brightness]);
            var unsaturated = color.rgbFromHsb([this.hsb.h, 0, brightness]);
            gradient.addColorStop(0, 'rgb('+saturated[0]+','+saturated[1]+','+saturated[2]+')');
            gradient.addColorStop(1, 'rgb('+unsaturated[0]+','+unsaturated[1]+','+unsaturated[2]+')');
            break;
        case 'hsb_b': // max brightness to black
            var brightest = color.rgbFromHsb([this.hsb.h, this.hsb.s, 100]);
            gradient.addColorStop(0, 'rgb('+brightest[0]+','+brightest[1]+','+brightest[2]+')');
            gradient.addColorStop(1, 'black');
            break;
        case 'rgb_r':
            gradient.addColorStop(0, 'rgb(255,'+this.rgb.g+','+this.rgb.b+')');
            gradient.addColorStop(1, 'rgb(0,'+this.rgb.g+','+this.rgb.b+')');
            break;
        case 'rgb_g':
            gradient.addColorStop(0, 'rgb('+this.rgb.r+',255,'+this.rgb.b+')');
            gradient.addColorStop(1, 'rgb('+this.rgb.r+',0,'+this.rgb.b+')');
            break;
        case 'rgb_b':
            gradient.addColorStop(0, 'rgb('+this.rgb.r+','+this.rgb.g+',255)');
            gradient.addColorStop(1, 'rgb('+this.rgb.r+','+this.rgb.g+',0)');
            break;
        }
        this.cs.beginPath();
        this.cs.rect(0, 0, 19, 256);
        this.cs.closePath();
        this.cs.fillStyle = gradient;
        this.cs.fill();
    },
    startSlider: function(event) {
        this.offset = this.$slideArea.offset();
        this.slide(event);
        $(document).bind('mousemove.global', jQuery.proxy(this, "slide"));
    },
    slide: function(event) {
        event.preventDefault();
        var relativePosition = event.pageY - this.offset.top;
        if(relativePosition < 0) relativePosition = 0;
        if(relativePosition > 256) relativePosition = 256;
        // invert the value because the browsers coordination system has its origin at the top but the slider has its origin at the bottom
        relativePosition = 256 - relativePosition;
        this.moveSlider(relativePosition);
        this.$selectedInput.val(parseInt(relativePosition/this.ratio, 10));
        this.update();
    },
    moveSlider: function(position) {
        this.$slider.css({'top':(256-position)+'px'});
    },
    getHsb: function() {
        this.hsb.h = this.$hsb_h.val();
        this.hsb.s = this.$hsb_s.val();
        this.hsb.b = this.$hsb_b.val();
    },
    getRgb: function() {
        this.rgb.r = this.$rgb_r.val();
        this.rgb.g = this.$rgb_g.val();
        this.rgb.b = this.$rgb_b.val();
    },
    getHex: function() {
        var hex = this.$hex.val();
        var missingLength = 6 - hex.length;
        if(missingLength === 3){ 
            var parts = hex.split("");
            hex = parts[0]+parts[0]+parts[1]+parts[1]+parts[2]+parts[2];
        } else {
            for(var i = 0; i<missingLength; i++){ 
                hex = "0" + hex;
            }
        }
        this.hex = hex;
    },
    setHsb: function() {
        this.$hsb_h.val(this.hsb.h);
        this.$hsb_s.val(this.hsb.s);
        this.$hsb_b.val(this.hsb.b);
    },
    setRgb: function(r,g,b) {
        this.$rgb_r.val(r != null ? r : this.rgb.r);
        this.$rgb_g.val(g != null ? g : this.rgb.g);
        this.$rgb_b.val(b != null ? b : this.rgb.b);
    },
    setHex: function(hex) {
        var hexcode = hex || this.hex,
            parts = hexcode.split("");
        // "000" instead of "000000"
        hexcode = (parts[0]===parts[1]) && (parts[2]===parts[3]) && (parts[4]==parts[5]) ? parts[0]+parts[2]+parts[4] : hexcode;
        this.$hex.val(hexcode);
    },
    hsbToRgb: function() {
        var rgb = color.rgbFromHsb([this.hsb.h, this.hsb.s, this.hsb.b]);
        this.rgb.r = rgb[0];
        this.rgb.g = rgb[1];
        this.rgb.b = rgb[2];
        this.setRgb();
    },
    rgbToHex: function(){
        this.hex = color.hexFromRgb([this.rgb.r, this.rgb.g, this.rgb.b]);
        this.setHex();
    },
    hexToRgb: function(){
        var rgb = color.rgbFromHex(this.hex);
        this.rgb.r = rgb[0];
        this.rgb.g = rgb[1];
        this.rgb.b = rgb[2];
        this.setRgb();
    },
    setNewColor: function() {
        this.$newColor.css('background', '#'+this.hex);
    },
    rgbToHsb: function() {
        var hsb = color.hsbFromRgb([this.rgb.r, this.rgb.g, this.rgb.b]);
        this.hsb.h = hsb[0];
        this.hsb.s = hsb[1];
        this.hsb.b = hsb[2];
        this.setHsb();
    },
    addSwatch: function(title, hex) {
        return $('<span class="swatch" />')
                .attr({'title': title, 'data-hex': hex})
                .css({'background': '#'+hex})
                .bind('click', {self: this}, this.handleSwatch);
    },
    handleSwatch: function(e){
        e.stopPropagation();
        var self = e.data.self;
        // if alt is pressed while clicking: remove swatch
        if(e.altKey){
            // find out the swatches position in the swatch array
            var position = 0;
            var family = $(this).parent().children();
            for(var i = 0, length = family.length; i<length; i++){
                if(this===family[i]){ position = i; }
            }
            // slice out the swatch from the swatch array (method by John Resig)
            var rest = self.swatches.slice(position + 1);
            self.swatches.length = position;
            self.swatches.push.apply(self.swatches, rest);
            localStorage["swatches"] = JSON.stringify(self.swatches);
            $(this).remove();
        }
        // else get that swatches color
        else {
            var hex = $(this).attr('data-hex');
            self.setHex(hex);
            self.update('hex');
        }
    },
    okAction: function(){
        this.close("ok");
    },
    cancelAction: function(){
        this.close("cancel");
    },
    close: function(mode){
        var rgb;
        switch(mode){
            case "ok":
                this.setCurrentColor();
                this.colorHistory.push(this.currentColor);
                rgb = color.rgbFromHex(this.hex);
                break;
            case "cancel":
                rgb = color.rgbFromHex(this.currentColor);
                break;
        }
        if(this.callback) this.callback.call(this.thisArg, rgb);
        this.callback = null;
        this.open = false;
        hidePickArea();
        nav.goTo(-1);
    },
    newSwatch: function(event){
        var self = event.data.self;
        var title = prompt(lang.ColorSwatchName,"Swatch "+self.swatches.length);
        if(title){
            self.$swatchHolder.append(self.addSwatch(title, self.hex));
            self.swatches.push({'title': title, 'hex': self.hex});
            localStorage["swatches"] = JSON.stringify(self.swatches);
        }
    },
    drawSwatches: function(){
        var swatches = $('<div/>');
        for(var i = 0, length = this.swatches.length; i<length; i++){
            swatches.append( this.addSwatch(this.swatches[i].title, this.swatches[i].hex) );
        }
        this.$swatchHolder.append(swatches);
    },
    selectInput: function(pos){
        this.mode = this.$radioInputs.eq(pos).val();
        this.$selectedInput = this.$textInputs.eq(pos);
        this.$selectedInput.focus();
        this.max = this.$selectedInput.attr('data-max');
        this.ratio = 256/this.max;
        this.moveSlider(this.$selectedInput.val()*this.ratio);
        this.drawPointer();
    },
    findCheckedInput: function(){
        for (var i = 0; i<6; i++) {
            if (this.$radioInputs.eq(i).attr('checked')) {
                this.selectInput(i);
            }
        }
    },
    clickAll: function(event) {
        var self = event.data.self;
        var $currentRadio = $('input[type=radio]', this);
        var $currentText = $('input[type=text]', this);
        var clickTargetType = $(event.target).attr('type');
        switch(clickTargetType){
            case "radio":
                $currentText.focus();
                self.mode = $currentRadio.val();
                self.max = $currentText.attr('data-max');
                self.ratio = 256/self.max;
                self.$selectedInput = $currentText;
                self.update();
                self.moveSlider($currentText.val()*self.ratio);
                self.drawPointer();
                break;
            case "text": self.update(); break;
            case "number": self.update(); break;
            default:
                $currentRadio.attr('checked', 'ckecked');
                $currentText.focus();
                self.mode = $currentRadio.val();
                self.max = $currentText.attr('data-max');
                self.update();
        }
    },
    init: function() {
        this.$element = $('#colorpicker');
        this.$textHolder = this.$element.find('li');
        this.$hexHolder = $('#hex_holder');
        this.$swatchHolder = $('#swatches');
        this.$currentColor = $('#current_color');
        this.$newColor = $('#new_color');
        this.$textInputs = this.$element.find('li input[type=text]');
        this.$radioInputs = this.$element.find('li input[type=radio]');
        this.$hsb_h = $('#hsb_h');
        this.$hsb_s = $('#hsb_s');
        this.$hsb_b = $('#hsb_b');
        this.$rgb_r = $('#rgb_r');
        this.$rgb_g = $('#rgb_g');
        this.$rgb_b = $('#rgb_b');
        this.$hex = $('#hex');
        this.$button_ok = $('#color_ok');
        this.$button_cancel = $('#color_cancel');
        this.$circleField = $('#circle');
        this.$slideArea = $('#color_slider');
        this.$slider = this.$slideArea.find('> div');
        this.cf = $('#field').get(0).getContext('2d');
        this.cc = $('#circle').get(0).getContext('2d');
        this.cs = this.$slideArea.find('canvas').get(0).getContext('2d');
        
        if(localStorage["swatches"]) this.swatches = JSON.parse(localStorage["swatches"]);
        this.$currentColor.click( jQuery.proxy(this, "pickCurrentColor") );
        this.$button_ok.click( jQuery.proxy(this, "okAction") );
        this.$button_cancel.click( jQuery.proxy(this, "cancelAction") );
        this.$circleField.mousedown( jQuery.proxy(this, "startPointer") );
        this.$slideArea.mousedown( jQuery.proxy(this, "startSlider") );
        this.$textHolder.bind('click', {self: this}, this.clickAll);
        this.$hexHolder.click( jQuery.proxy(this, "clickHex") );
        this.$hex.bind({
            focus: function(){ numbers.initHexField(this, 'color'); },
            keydown: numbers.restrictCharacters,
            keyup: numbers.keyUp
        });
        this.$textInputs.bind({
            focus: function(){ numbers.initNumberField(this, 'color'); },
            keydown: numbers.restrictCharacters,
            keyup: numbers.keyUp,
            blur: numbers.validateInput
        });
        this.$swatchHolder.bind('click', {self: this}, this.newSwatch);
        // find initial checked input
        this.findCheckedInput();
        // draw swatches
        this.drawSwatches();
        this.update();
    }
};