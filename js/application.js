/*!
 *     _                                       ________                  _
 *    | |                                     |  ______|                | |
 *    | |                                     | |          _            | |
 *    | |       _____ ___  ___ _____  _____   | |______  _| |_ ___  ___ | |     _____  _____
 *    | |      |  _  |\  \/  /|  _  ||   __|  |______  ||_   _|\  \/  / | |    |  _  ||  ___|
 *    | |_____ | |_| | /   /  |  ___||  |      ______| |  | |   /   /   | |___ |  ___||___  |
 *    |_______||___,\|/___/   |_____||__|     |________|  |_|  /___/    |_____||_____||_____|
 *    
 *       http://www.layerstyles.org
 *    
 *    Copyright (c) 2011 Felix Niklas
 *    This script is freely distributable under the terms of the MIT license.
 */

localStorage['version'] = "0.1";

var movePos = { x: 0, y: 0 }, bytes, reader;
var browserPrefix = '';
var $body = $('body');
var $overlay = $('#overlay');
var $workspace = $('#workspace');
var dimensions = { width: $workspace.width(), height: $workspace.height() };
var $dialog = $('#dialog');
var $layerstyle = $('#layerstyle');
var $navElements = $('#nav ul li');
var $holderElements = $('#holder > div');
var $pots = $('.pot');
var potDimensions = {'height': 40, 'width': 40};
var $sliders = $('.slider'), shouldEase = false;
var $numericalInputs = $('input[type=text]', $dialog);
var $buttons = { 'ok': $('#ok'), 'cancel': $('#cancel'), 'newStyle': $('#new_style')  };
var $layer = $('#layer');
var resizeArea = $('#resize');
var $backgroundLayer = $('#background_layer');//.css("height", dimensions.height);
var $parallelUniverse = $('#parallel_universe').attr({height: dimensions.height, width: dimensions.width});
var pu = $parallelUniverse.get(0).getContext('2d');
var $innerShadowUniverse = $('#innerShadow_universe').attr({height: dimensions.height, width: dimensions.width});
var iu = $innerShadowUniverse.get(0).getContext('2d');
var moveAreas = $('.moveable'), movingWindow;
var offset = { x: 0, y: 0 };
var $colorfields = $('.color_field');
var currentStyle, lang;
var background = {
        background: [{
                stops: [[255,255,255,1], [255,255,255,0]],
                style: 'radial',
                position: 'center',
                angle: 90
            },
            {
                stops: [[226, 226, 226], [171, 171, 171]],
                style: 'linear',
                angle: 90
            }
        ]
};

// array compare function - thanks to David and Anentropic
// http://stackoverflow.com/questions/1773069/using-jquery-to-compare-two-arrays
// (sort removed and extended to deep comparison)
// syntax: $.compare(a, b);

jQuery.extend({
    compare: function (b, a) {
        if (a.length != b.length) { return false; }
        for (var i = 0, l = a.length; i < l; i++) {
            if (a[i] !== b[i]) { 
                if(typeof a[i] === 'object'){
                    return jQuery.compare(a[i],b[i]);
                } else {
                    return false;
                }
            }
        }
        return true;
    }
});

// Object.create implementation for older browsers
// by Ben Newman

if(Object.create === undefined){
    Object.create = function( proto, props ) {
      var ctor = function( ps ) {
        if ( ps )
          Object.defineProperties( this, ps );
      };
      ctor.prototype = proto;
      return new ctor( props );
    };
}

/*

things to store:
    - styles, gradients and colors
    - layerstyles version
    - currentStyle

*/
var defaults = {
        height: 300,
        width: 300,
        ratio: 1,
        globalAngle: 90,
        dropShadow: {
            isActive: true,
            color: [0,0,0],
            opacity: 75,
            angle: 90,
            hasGlobalLight: false,
            distance: 1,
            blur: 5,
            size: 0
        },
        innerShadow: {
            isActive: false,
            color: [255,255,255],
            opacity: 100,
            angle: 90,
            hasGlobalLight: false,
            distance: 1,
            blur: 0,
            size: 0,
            isInset: true
        },
        background: {
            isActive: true,
            opacity: 100,
            stops: [[252, 252, 252], 23, [[242, 242, 242], 12], 89, [191, 191, 191]],
            isReverse: false,
            style: 'linear',
            angle: 90,
            hasGlobalLight: false
        },
        border: {
            isActive: true,
            color: [0,0,0],
            opacity: 100,
            size: 1,
            style: 'solid'
        },
        borderRadius: {
            isActive: false,
            radii: [[0, "px"],[0, "px"],[0, "px"],[0, "px"]],
            isSelected: [true,true,true,true],
            hasPercentage: [false, false, false, false]
        }
};

var nav = {
    $el: $layerstyle,
    $pages: null,
    width: null,
    page: null,
    prev: null,
    speed: 0,
    goTo: function(pageNr){
        // parse Int
        pageNr = pageNr*1;
        localStorage["pageNr"] = pageNr;
        if(pageNr === -1){
            pageNr = this.prev; // go back
        }
        else {
            pageNr--; // pages area 1,2,3 - but in the array they are 0,1,2
        }
        var goPage = this.$pages.eq(pageNr);
        var currentPage = this.$pages.eq(this.page);
        var direction = pageNr > this.page ? 1 : -1; // 1 = right, -1 = left
        var offset = this.width;
        this.$el.css('overflow', 'hidden');
        currentPage
            .animate({
                'margin-left': -direction*offset+'px',
                'opacity': 0
            }, this.speed, function(){ nav.$pages.eq(nav.page).css('visibility', 'hidden'); });
        goPage
            .css({
                'margin-left': direction*offset+'px',
                'visibility': 'visible',
                'opacity': 0
            })
            .animate({
                'margin-left': 0,
                'opacity': 1
            }, this.speed, function(){ nav.$el.css('overflow', 'visible'); });
        this.prev = this.page;
        this.page = pageNr;
    },
    show: function(pageNr){
        pageNr--;
        $(this.$pages[pageNr]).css('visibility', 'visible');
        this.page = pageNr;
    },
    init: function(){
        this.width = this.$el.width();
        this.$pages = $('> .window', this.$el);
        this.show(1);
    }
}

function moveWindow(event){
    movingWindow.css({ top: event.pageY - movePos.y, left: event.pageX - movePos.x });
}

function resizeLayer(event, x, y){
    var halfWidth, halfHeight, maxWidth, maxHeight;
     halfWidth = parseInt(( x != null ? x/2 : event.pageX - dimensions.width/2 + offset.x), 10);
    halfHeight = event != null && event.shiftKey ? halfWidth / currentStyle.ratio : parseInt(( y != null ? y/2 : event.pageY - dimensions.height/2 + offset.y), 10);
    maxWidth = dimensions.width/2;
    maxHeight = dimensions.height/2;
    halfWidth =  halfWidth < 8 ? 8 : halfWidth > maxWidth ? maxWidth : halfWidth;
    halfHeight = halfHeight < 8 ? 8 : halfHeight > maxHeight ? maxHeight : halfHeight;
    currentStyle.width = halfWidth*2;
    currentStyle.height = halfHeight*2;
    $layer.css({
        'width': currentStyle.width,
        'height': currentStyle.height,
        'margin-top': -halfHeight,
        'margin-left': -halfWidth
    });
}

function showSlide(pos){
    $navElements.removeClass('active');
    $navElements.eq(pos).addClass('active');
    $holderElements.removeClass('active').eq(pos).addClass('active');
}

function dragenter(e) {
      e.stopPropagation();
      e.preventDefault();
    $body.addClass("dragging");
}

function dragleave(e) {
      e.stopPropagation();
      e.preventDefault();
    $body.removeClass("dragging");
}

function dragover(e) {
      e.stopPropagation();
      e.preventDefault();
}

function drop(e) {
      e.stopPropagation();
      e.preventDefault();

    dropPos = { x: e.pageX, y: e.pageY };
    
      var dt = e.dataTransfer;
    var files = dt.files;
    
    for (var i = 0, l=files.length; i < l; i++) {
        var data = files[i];
        //bytes = new Stream(data);
        reader = new FileReader();
        reader.onload = function(e){
            
            var img = new Image(),
                $canvas = $("<canvas></canvas>"),
                ctx = $canvas.get(0).getContext('2d');
            
            img.src = e.target.result;
            
            img.onload = function(){
                
                  $canvas.attr({
                    title: data.name,
                    width: img.width,
                    height: img.height
                });

                $canvas.css({ left: dropPos.x-img.width/2, top: dropPos.y-img.height/2, position: "absolute" });
                $canvas.addClass("moveable");

                ctx.drawImage(img, 0, 0);

                $canvas.appendTo($workspace);
            };
        };
        reader.readAsDataURL(data);
    }
    
    $body.removeClass("dragging");
}

function showPickArea(){
    $body.addClass("pick");
    // draw the parallel Universe for color picking
    parallelUniverse.draw();
    // redraw the parallelUniverse when the layer gets redrawn ("paint" event);
    $(document).bind('paint', $.proxy( parallelUniverse, "draw" ));
    $overlay.bind('mousedown', pick);
}

function hidePickArea(){
    $body.removeClass("pick");
    $(document).unbind('paint', $.proxy( parallelUniverse, "draw" ));
    $overlay.unbind('mousedown');
}

function pick(event){
    var pickedColor = pu.getImageData(event.pageX, event.pageY, 1, 1).data;
    colorpicker.setHex(color.hexFromRgb(pickedColor));
    colorpicker.update('hex');
}

function initialise() {
    // include 'dataTransfer' to jquerys event object
    jQuery.event.props.push('dataTransfer');
    
    // set language 
    // not yet elaborated - whats the best solution to change all titles in the html?
    // - create the html via js in the first place or select and change them all?
    // - regex over the all textnodes?
    lang = localization.en;

    $navElements.click(function(){
        var pos = $navElements.index(this);
        localStorage["slidePos"] = pos;
        showSlide(pos);
    });

    $numericalInputs.bind({
        mousedown: function(e){ e.stopPropagation(); },
        focus: function(e){ numbers.initNumberField(this, 'style'); },
        keydown: numbers.restrictCharacters,
        keyup: numbers.keyUp,
        blur: numbers.validateInput
    });
    
    moveAreas.live('mousedown', function(event){ 
        event.preventDefault();
        movingWindow = $(this).hasClass("head") ? $(this).parents('#layerstyle') : $(this);
        movingWindow.addClass("moving");
        $(document).one('mouseup', function(){ movingWindow.removeClass("moving"); });
        var myOffset = movingWindow.offset();
        movePos = { x:event.pageX-myOffset.left, y:event.pageY-myOffset.top };
        $(document).bind('mousemove.global', moveWindow);
    }); 
    resizeArea.bind({
        mousedown: function(event){
            event.preventDefault();
            event.stopPropagation();
            currentStyle.ratio = currentStyle.width/currentStyle.height;
            $(document).bind('mousemove.global', resizeLayer);
            $body.addClass("resize");
            $(document).one('mouseup', function(){ $body.removeClass('resize'); });
            var my_offset = $(this).offset();
            offset = { x: 15-(event.pageX-my_offset.left), y: 15-(event.pageY-my_offset.top) };
        },
        click: function(event){ event.stopPropagation(); } // prevent bubbling
    });
    $(document).bind({
        mousemove: function(e){ e.preventDefault(); },
        mouseup: function(){ $(this).unbind('mousemove.global'); },
        dragenter: dragenter,
        dragleave: dragleave,
        dragover: dragover,
        drop: drop
    });
    
    $(window).bind({
        resize: function(event){
            dimensions = { width: $workspace.width(), height: $workspace.height() };
            $parallelUniverse.attr({'width': dimensions.width, 'height': dimensions.height});
            $innerShadowUniverse.attr({'width': dimensions.width, 'height': dimensions.height});
            if (dimensions.width < currentStyle.width) { resizeLayer(null, dimensions.width, currentStyle.height); }
            if (dimensions.height < currentStyle.height) { resizeLayer(null, currentStyle.width, dimensions.height); }
        },
        keydown: function(event){
            if(event.altKey){
                $body.addClass('alt');
                $(this).one('keyup', function(){ $body.removeClass('alt'); });
            }
        }
    });
    $layer.dblclick(function(event){ $layerstyle.show(); });
    $buttons.ok.click(function(){ $layerstyle.hide(); });
    $buttons.cancel.click(function(){ $layerstyle.hide(); });
    $buttons.newStyle.click( $.proxy( styleStore, "create" ) );

    $('#infoButton').click(function(){ $body.removeClass('visited'); });
    
    tools.getBrowserPrefix();
    styleStore.init();
    nav.init();
    colorpicker.init();
    gradienteditor.init();
    codeBox.init();
    style.init();
    showSlide(localStorage["slidePos"] || 1);
    nav.goTo(localStorage["pageNr"] || 1);
    
    $(document)
        .bind('paint', $.proxy( codeBox, "render" ))
        .bind('paint', $.proxy( css, "render" ))
        .trigger('styleChange')
        .trigger('paint');
}

// isEven: (n % 2) == 0 -> true? even : odd

// GET THE BALL ROLLIN
$(document).ready(function(){
    initialise();
});