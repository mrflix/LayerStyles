var info = {
	maxWidth: 982,
	i: 0,
	init: function(){
		this.$el = $('#info');
		this.headlines = this.$el.find('h2, h4');
		
		if(!$('body').hasClass('visited')){
			$.each(this.headlines, function(i, line){
				info.initText(line);
			});
		}
	},
	initText: function(obj){
		var o = $(obj);
		var text = o.text();
		var fontSize = parseInt(o.css('font-size').slice(0,-2), 10); // "50px" -> "50" -> 50
		if(!this.holder){
			this.holder = $('<h1></h1>')
				.addClass('hiddenFriend')
				.appendTo(this.$el);
		}
		this.holder.text(text).css('font-weight', o.css('font-weight'));
		var width = this.adjust(fontSize);
		var direction = width < this.maxWidth ? 1 : -1;
		this.adjustWidth(direction, o, fontSize);
	},
	adjustWidth: function(direction, o, fontSize){
		var unadjusted = true,
			newWidth;
		while(unadjusted){
			this.i++;
			fontSize += direction;
			newWidth = this.adjust(fontSize);
			if( direction === 1 && newWidth > this.maxWidth || direction === -1 && newWidth < this.maxWidth ){
				var adjustedSize = direction == 1 ? fontSize-1 : fontSize;
				o.css('font-size', adjustedSize);
				unadjusted = false;
				console.log(this.i);
			}
		}
	},
	adjust: function(fontSize){
		this.holder.css("font-size", fontSize);
		return this.holder.width();
	}
};	
info.init();