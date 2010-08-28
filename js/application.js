/*
 *    Copyright (c) 2010 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

var move_function, mouseup_function, movePos = { x: 0, y: 0 }, mousePos = { x: 0, y: 0 };
var browserPrefix = '';
var body = $('body');
var page = { width: body.width(), height: body.height() };
var $dialog = $('#dialog');
var $pots = $('.pot');
var pot_dimensions = {height: $pots.eq(0).height(), width: $pots.eq(0).width()};
var $sliders = $('.slider');
var $number_inputs = $('input[type=text]', $dialog);
var $buttons = { ok: $('#ok'), cancel: $('#cancel'), new_style: $('#new_style')  };
var $layer = $('#layer');
var resize_area = $('#resize');
var $background = $('#background');
var $parallel_universe = $('#parallel_universe').attr({height: page.height, width: page.width});
var pu = $parallel_universe.get(0).getContext('2d');
var windows = $('.window'), moving_window = null;
var move_areas = $('> h2', windows);
var colorpicker = new colorpicker($('#colorpicker'));
var offset = { x: 0, y: 0 };
var background = {
        'background': [{'type': 'radial', 'position': ['center', 'center'], 'steps': ['white', 'rgba(255,255,255,0))']},
                       {'type': 'linear', 'position': ['top', 'left'] , 'steps': ['#e2e2e2', '#ababab']} ]
};
var layer = {
        'height': 300,
        'width': 300,
        'boxShadow': [{ 'offset': [0, 1], 'blur': 5, 'color': 'rgba(0, 0, 0, 0.75)'}],
        'border': {'size': 1, 'style': 'solid', 'color': 'black'},
        'borderRadius': {'tl': { x: 13, y: 13 }, 'tr': { x: 13, y: 13 }, 'br': { x: 13, y: 13 }, 'bl': { x: 13, y: 13 }},
        'background': [{'type': 'plain', 'color': 'white'}]
};

function move_window(){
    moving_window.css({ top: mousePos.y - movePos.y, left: mousePos.x - movePos.x });
}

function resize_layer(x, y){
    var halfWidth = parseInt((x/2 || mousePos.x - page.width/2 + offset.x), 10);
    var halfHeight = parseInt((y/2 || mousePos.y - page.height/2 + offset.y), 10);
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

function parallelUniverse(){
    var x = roundToHalf(page.width/2 - layer.width/2),
        y = roundToHalf(page.height/2 - layer.height/2);
    var radius = layer.borderRadius;
    // clear the filed
    pu.clearRect(0,0,page.width,page.height);
    // paint the path
    roundedRect(x,y,layer.width,layer.height,radius);
    // shadow
    pu.shadowOffsetX = layer.boxShadow[0].offset[0];
    pu.shadowOffsetY = layer.boxShadow[0].offset[1];
    pu.shadowBlur = layer.boxShadow[0].blur;
    pu.shadowColor = layer.boxShadow[0].color;
    // background
    pu.fillStyle = layer.background[0].color;
    pu.fill();
    // border
    pu.strokeStyle = layer.border.color;
    pu.lineWidth = layer.border.size;
    pu.stroke();
    function roundedRect(x,y,width,height,radius){
        // pu.arc(8, 8, 7, -Math.PI/2, Math.PI/2, false); <- half circle
        pu.beginPath();
        pu.moveTo(x, y+radius.tl.y);
        pu.quadraticCurveTo(x, y, x+radius.tl.x, y);
        pu.lineTo(x+width-radius.tr.x, y);
        pu.quadraticCurveTo(x+width, y, x+width, y+radius.tr.y);
        pu.lineTo(x+width, y+height-radius.br.y);
        pu.quadraticCurveTo(x+width, y+height, x+width-radius.br.x, y+height);
        pu.lineTo(x+radius.bl.x, y+height);
        pu.quadraticCurveTo(x, y+height, x, y+height-radius.bl.y);
        pu.closePath();
    }
}
parallelUniverse();

function print(){
    document.location.href = $parallel_universe.get(0).toDataURL('image/png');
}

function roundToHalf(value){
    return (value - parseInt(value)) === 0.5 ? value+1 : value + 1.5;
}

function turn_pot(pot){
    var opposite = offset.y - mousePos.y,
        adjacent = mousePos.x - offset.x,
        radiants = Math.atan(opposite/adjacent),
        degrees = Math.round(radiants*(180/Math.PI), 10);
    if(adjacent <= 0 && opposite >= 0){ degrees += 180; }
    else if(opposite < 0 && adjacent < 0){ degrees-= 180; }
    rotate_pointer(pot, degrees);
    var input = $(pot).next('div').children('input:first-child').val(degrees);
}

function rotate_pointer(pot, degrees){
    var transform = browserPrefix+'transform';
    $('> div', pot).css(transform, 'rotate('+-degrees+'deg)');
}

function initialise_sliders(){
    $.each($sliders, function(i, slider){
        set_slider(slider);
    });
}

function set_slider(slider){
    var $input_field = $(slider).next('input'),
        value = $input_field.val(),
        max = $input_field.attr('max'),
        length = $(slider).width(),
        position = Math.round(length*value/max);
    move_slider(slider, position);
}

function slide(slider){
    var $input_field = $(slider).next('input'),
        max = $input_field.attr('max'),
        length = $(slider).width(),
        position = mousePos.x - offset.x;
    if(position < 0) position = 0;
    else if(position > length) position = length;
    move_slider(slider, position);
    $input_field.val(Math.round(position*max/length));
}

function move_slider(slider, x){
    $('> div:nth-child(2)', slider).css({ left: x+'px' });
}

function move(event){
    if(move_function){
        event.preventDefault();
        mousePos.x = event.pageX;
        mousePos.y = event.pageY;
        move_function.fn.apply(this, move_function.arguments);
    }
}

function initialise() {
    initialise_sliders()
    // find css3 prefix "-webkit-" or "-moz-"
    if($.browser.webkit) browserPrefix = '-webkit-';
    else if($.browser.mozilla) browserPrefix = '-moz-';
    
    $pots.bind('mousedown', function(event){
        var my_offset = $(this).offset();
        offset = { x: my_offset.left+(pot_dimensions.width/2), y: my_offset.top+(pot_dimensions.height/2) };
        move_function = { fn: turn_pot, 'arguments': [this] };
    });
    
    $sliders.bind('mousedown', function(event){
        var my_offset = $(this).offset();
        offset = { x: my_offset.left, y: 0 };
        move_function = { fn: slide, 'arguments': [this] };
    });

    $number_inputs.bind({
        focus: init_number_field,
        keydown: function(e){ restrictCharacters(e, digits) },
        keypress: accelerate,
        /*keyup: update_field,*/
        blur: validate_input
    });
    
    move_areas.bind('mousedown', function(event){ 
        event.preventDefault(); 
        move_function = { fn: move_window };
        moving_window = $(this).parent(); 
        var my_offset = moving_window.offset();
        movePos = { x:event.pageX-my_offset.left, y:event.pageY-my_offset.top };
        moving_window.css({ 'z-index': 2 }).siblings().css({ 'z-index': 1 });
    }); 
    resize_area.bind({
        mousedown: function(event){
            move_function = { fn: resize_layer };
            var my_offset = $(this).offset();
            offset = { x: 15-(event.pageX-my_offset.left), y: 15-(event.pageY-my_offset.top) };
            $parallel_universe.addClass('resize');
            resize_area.addClass('visible');
            mouseup_function = function(){ 
                resize_area.removeClass('visible');
                $parallel_universe.removeClass('resize');
            }
        },
        click: function(event){ event.stopPropagation(); } // prevent bubbling
    });
    $(window).bind({
        mousedown: function(event){ move(event); },
        mousemove: function(event){ move(event); },
        mouseup: function(event){ 
            if (mouseup_function) {
                mouseup_function(event); 
                mouseup_function = null;
            }
            move_function = null; 
        },
        resize: function(event){
            page = { width: body.width(), height: body.height() };
            if(page.width < layer.width) resize_layer(page.width, layer.height);
            if(page.height < layer.height) resize_layer(layer.width, page.height);
            $parallel_universe.attr({'width': page.width, 'height': page.height});
            parallelUniverse();
        },
        keydown: function(event){
            if(event.altKey){ 
                body.addClass('alt');
                $(this).one('keyup', function(){ body.removeClass('alt'); });
            }
        }
    });
    
    $layer.click(function(event){
        $dialog.show();
    });

    $buttons.ok.click(function(){
        $dialog.hide();
    });
    $buttons.cancel.click(function(){
        $dialog.hide();
    });
}

// isEven: (n % 2) == 0 -> true? even : odd

// GET THE BALL ROLLIN
initialise();