/*
 *     _                                       ________                  _
 *    | |                                     |  ______|                | |
 *    | |                                     | |          _            | |
 *    | |       _____ ___  ___ _____  _____   | |______  _| |_ ___  ___ | |     _____  _____
 *    | |      |  _  |\  \/  /|  _  ||   __|  |______  ||_   _|\  \/  / | |    |  _  ||  ___|
 *    | |_____ | |_| | /   /  |  ___||  |      ______| |  | |   /   /   | |___ |  ___||___  |
 *    |_______||___,\|/___/   |_____||__|     |________|  |_|  /___/    |_____||_____||_____|
 *    
 *    Copyright (c) 2010 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

var movePos = { x: 0, y: 0 };
var shift = false;
var browserPrefix = '';
var $body = $('body');
var page = { width: $body.width(), height: $body.height() };
var $dialog = $('#dialog');
var $navElements = $('#nav ul li');
var $holderElements = $('#holder > div');
var $pots = $('.pot');
var potDimensions = {'height': 40, 'width': 40};
var $sliders = $('.slider');
var $numericalInputs = $('input[type=text]', $dialog);
var $buttons = { 'ok': $('#ok'), 'cancel': $('#cancel'), 'newStyle': $('#new_style')  };
var $layer = $('#layer');
var resizeArea = $('#resize');
var $background = $('#background');
var $parallelUniverse = $('#parallel_universe').attr({height: page.height, width: page.width});
var pu = $parallelUniverse.get(0).getContext('2d');
var windows = $('.window'), movingWindow = null;
var moveAreas = $('> h2', windows);
var offset = { x: 0, y: 0 };
var $colorfields = $('.color_field');
var background = {
        'background': [
               {'type': 'radial', 'position': 'center', 'steps': ['white', 'rgba(255,255,255,0)']},
               {'type': 'linear', 'position': 40, 'steps': ['#e2e2e2', '#ababab']}
        ]
};
var layer = {
        'height': 300,
        'width': 300,
        'dropShadow': { 'offset': [0, 1], 'blur': 5, 'color': 'rgba(0, 0, 0, 0.75)'},
		'innerShadow': {},
        'border': {'size': 1, 'style': 'solid', 'color': 'black'},
        'background': [{'type': 'solid', 'color': 'white'}]
};
var defaults = {
        'dropShadow': [{
            'active': true,
            'color': '000000',
            'opacity': 75,
            'angle': 90,
            'distance': 1,
            'spread': 0,
            'size': 1
        }],
        'innerShadow': [{
            'active': false,
            'color': '000000',
            'opacity': 75,
            'angle': 90,
            'distance': 1,
            'spread': 0,
            'size': 1
        }],
        'background': [{
            'active': false,
            'color': '000000',
            'opacity': 75,
            'angle': 90,
            'distance': 1,
            'spread': 0,
            'size': 1
        }]
};

function fn(rgb){
    // console.log(rgb.r, rgb.g, rgb.b);
}

function pickColor(e){
    e.preventDefault();
    var $field = $(this).hasClass('color_field') ? $(this) : $(this).find('.color_field');
    var currentColor = $field.css('background-color');
    colorpicker.pick(currentColor, fn);
}

var lang = localization.de;

function moveWindow(event){
    movingWindow.css({ top: event.pageY - movePos.y, left: event.pageX - movePos.x });
}

function roundToHalf(value){
    return (value - parseInt(value, 10)) === 0.5 ? value+1 : value + 1.5;
}

function parallelUniverse(){
    var x = roundToHalf(page.width/2 - layer.width/2);
    var y = roundToHalf(page.height/2 - layer.height/2);
	var radius = layer.borderRadius;
    function roundedRect(x,y,width,height,radius,fixedBorder){	
        pu.beginPath();
		// fixedBorder means its calculated in pixels - else in percentage
		if(!fixedBorder){ radius = (width+height)*radius/50; }
		if(radius > height/2) radius = height/2;
		if(radius > width/2) radius = width/2;
		if(typeof radius === "number"){
			pu.moveTo(x, y+radius);
			pu.arc(x+radius, y+radius, radius, Math.PI, Math.PI*3/2, false);
			pu.lineTo(x+width-radius, y);
			pu.arc(x+width-radius, y+radius, radius, Math.PI*3/2, 0, false);
			pu.lineTo(x+width, y+height-radius);
			pu.arc(x+width-radius, y+height-radius, radius, 0,  Math.PI/2,  false);
			pu.lineTo(x+radius, y+height);
			pu.arc(x+radius, y+height-radius, radius, Math.PI/2,  Math.PI,  false);
			pu.lineTo(x, y+radius);
		}
		else {
        	pu.moveTo(x, y+radius.tl.y);
	        pu.quadraticCurveTo(x, y, x+radius.tl.x, y);
	        pu.lineTo(x+width-radius.tr.x, y);
	        pu.quadraticCurveTo(x+width, y, x+width, y+radius.tr.y);
	        pu.lineTo(x+width, y+height-radius.br.y);
	        pu.quadraticCurveTo(x+width, y+height, x+width-radius.br.x, y+height);
	        pu.lineTo(x+radius.bl.x, y+height);
	        pu.quadraticCurveTo(x, y+height, x, y+height-radius.bl.y);
			pu.lineTo(x, y+radius.tl.y);
		}
        pu.closePath();
    }
    // clear the filed
    pu.clearRect(0,0,page.width,page.height);
    // shadow
    pu.shadowOffsetX = layer.dropShadow.offset[0];
    pu.shadowOffsetY = layer.dropShadow.offset[1];
    pu.shadowBlur = layer.dropShadow.blur;
    pu.shadowColor = layer.dropShadow.color;
    // background
    //pu.fillStyle = layer.background[0].color;
	var gradient = pu.createLinearGradient(x, 0, x+layer.width, 0);
	gradient.addColorStop(0, 'rgb(0,0,0)');
    gradient.addColorStop(1, 'rgb(255,255,255)');
	pu.fillStyle = gradient;
    // border
    pu.strokeStyle = layer.border.color;
    pu.lineWidth = layer.border.size;
    // paint the path
	if(!radius){
		pu.strokeRect(x,y,layer.width,layer.height);
	} else {
		roundedRect(x,y,layer.width,layer.height, radius, layer.borderRadiusFixed);
	}
	pu.fillRect(x,y,layer.width,layer.height);
}
parallelUniverse();

function resizeLayer(event, x, y){
    var halfWidth = parseInt((x/2 || event.pageX - page.width/2 + offset.x), 10);
    var halfHeight = parseInt((y/2 || event.pageY - page.height/2 + offset.y), 10);
    var maxWidth = page.width/2;
    var maxHeight = page.height/2;
    halfWidth =  halfWidth < 8 ? 8 : halfWidth > maxWidth ? maxWidth : halfWidth;
    halfHeight = halfHeight < 8 ? 8 : halfHeight > maxHeight ? maxHeight : halfHeight;
    layer.width = halfWidth*2;
    layer.height = halfHeight*2;
    $layer.css({
        'width': layer.width,
        'height': layer.height,
        'margin-top': -halfHeight,
        'margin-left': -halfWidth
    });
    parallelUniverse();
}

function print(){
    document.location.href = $parallelUniverse.get(0).toDataURL('image/png');
}

function rotatePointer(pot, degrees){
    var transform = browserPrefix+'transform';
    $('> div', pot).css(transform, 'rotate('+-degrees+'deg)');
}

function turnPot(event, pot){
	event.preventDefault();
    var pot = pot || event.data.pot,
		opposite = offset.y - event.pageY,
        adjacent = event.pageX - offset.x,
        radiants = Math.atan(opposite/adjacent),
        degrees = Math.round(radiants*(180/Math.PI), 10);
	if(shift){
		if(degrees <= 90 && degrees > 82) degrees = 90;	
		else if(degrees <= 82 && degrees > 67) degrees = 75;
		else if(degrees <= 67 && degrees > 52) degrees = 60;
		else if(degrees <= 52 && degrees > 37) degrees = 45;
		else if(degrees <= 37 && degrees > 22) degrees = 30;
		else if(degrees <= 22 && degrees > 7) degrees = 15;	
		else if(degrees <= 7 && degrees > -8) degrees = 0;	
		else if(degrees <= -8 && degrees > -23) degrees = -15;	
		else if(degrees <= -23 && degrees > -38) degrees = -30;	
		else if(degrees <= -38 && degrees > -53) degrees = -45;	
		else if(degrees <= -53 && degrees > -68) degrees = -60;	
		else if(degrees <= -68 && degrees > -83) degrees = -75;
		else if(degrees <= -83 && degrees > -90) degrees = -90;
	}
    if(adjacent < 0 && opposite >= 0){ degrees+= 180; }
    else if(opposite < 0 && adjacent < 0){ degrees-= 180; }
	if(degrees === -180) degrees = 180;
    rotatePointer(pot, degrees);
    var input = $(pot).next('div').children('input:first-child').val(degrees);
}

function moveSlider($slider, x){
    $('> div:nth-child(2)', $slider).css({ left: x+'px' });
}

function setSlider(slider){
    var $inputField = $(slider).next('input'),
        value = $inputField.val(),
        max = $inputField.attr('data-max'),
        length = $(slider).width(),
        position = Math.round(length*value/max);
    moveSlider(slider, position);
}

function initialiseSliders(){
    $.each($sliders, function(i, slider){
        setSlider(slider);
    });
}

function slide(event, slider){
	event.preventDefault();
    var $slider = $(slider || event.data.slider);
		$inputField = $slider.next('input'),
        max = $inputField.attr('data-max'),
        length = $slider.width(),
        position = event.pageX - offset.x;
    if (position < 0) {
        position = 0;
    }
    else if (position > length) {
        position = length;
    }
    moveSlider($slider, position);
    $inputField.val(Math.round(position*max/length));
}

function showSlide(pos){
    $holderElements.hide().eq(pos).show();
}

function initialise() {
    initialiseSliders();
    
    $navElements.click(function(){
        var pos = $navElements.removeClass('active').index(this);
        $(this).addClass('active');
        showSlide(pos);
    });
    
    $pots.bind('mousedown', function(event){
        var myOffset = $(this).offset();
        offset = { x: myOffset.left+(potDimensions.width/2), y: myOffset.top+(potDimensions.height/2) };
		turnPot(event, this);
        $(document).bind('mousemove.global', {pot: this}, turnPot);
    });
    
    $sliders.bind('mousedown', function(event){
        offset = { x: $(this).offset().left, y: 0 };
		slide(event, this);
        $(document).bind('mousemove.global', {slider: this}, slide);
    });

    $numericalInputs.bind({
        focus: numbers.initNumberField,
        keydown: function(e){ restrictCharacters(e, digits, this); },
        keyup: function(){ updateField('style'); },
        blur: function(e){ numbers.validateInput(e, this) }
    });
    
    $colorfields.bind({
        click: pickColor
    });
    
    moveAreas.bind('mousedown', function(event){ 
        event.preventDefault();
        movingWindow = $(this).parent();
        var myOffset = movingWindow.offset();
        movePos = { x:event.pageX-myOffset.left, y:event.pageY-myOffset.top };
		tools.focusWindow(movingWindow);
        $(document).bind('mousemove.global', moveWindow);
    }); 
    resizeArea.bind({
        mousedown: function(event){
            $(document).bind('mousemove.global', resizeLayer);
            var myOffset = $(this).offset();
            offset = { x: 15-(event.pageX-myOffset.left), y: 15-(event.pageY-myOffset.top) };
        },
        click: function(event){ event.stopPropagation(); } // prevent bubbling
    });
    $(document).bind({
		mousemove: function(e){ e.preventDefault(); },
        mouseup: function(){ $(this).unbind('mousemove.global'); },
        resize: function(event){
            page = { width: $body.width(), height: $body.height() };
            if (page.width < layer.width) { resizeLayer(null, page.width, layer.height); }
            if (page.height < layer.height) { resizeLayer(null, layer.width, page.height); }
            $parallelUniverse.attr({'width': page.width, 'height': page.height});
            parallelUniverse();
        },
        keydown: function(event){
            if(event.altKey){
                $body.addClass('alt');
				alt = true;
                $(this).one('keyup', function(){ $body.removeClass('alt'); });
            }
            if(event.shiftKey){
				shift = true;
                $(this).one('keyup', function(){ shift = false; });
            }
        },
		dblclick: function(event){ event.preventDefault(); }
    });

	/*new uploader('droparea', 'status', 'list');
	$('#droparea').bind({
		hover: function(){ console.log("yes", this); $(this).addClass('hello'); },
		dragEnter: function(e){ $(this).addClass('hello'); },
		drop: function(e){ 
			e.preventDefault();
			console.log(e.dataTransfer.files);
			$(this).removeClass('hello');
		}
	});//*/
    $layer.click(function(event){ $dialog.show(); });
    $buttons.ok.click(function(){ $dialog.hide(); });
    $buttons.cancel.click(function(){ $dialog.hide(); });

	colorpicker.init();
	gradientpicker.init();
	codebox.init();
}

// isEven: (n % 2) == 0 -> true? even : odd

// GET THE BALL ROLLIN
$(document).ready(function(){
	initialise();
});