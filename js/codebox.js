var codebox = {
	$box: $('#codeBox code'),
	/**
	 * @method  initClipboard - a click on the button with the id 'copyCode' will copy 'this.$box.text()' into the clipboard
	 * @see		http://code.google.com/p/zeroclipboard/wiki/Instructions
	 */
	initClipboard: function(){
		ZeroClipboard.setMoviePath( 'http://localhost/~mrflix/LayerStyles/js/zeroclipboard/ZeroClipboard.swf' );
		var clip = new ZeroClipboard.Client();
		clip.setText(this.$box.text());
		clip.glue( 'copyCode' );
	},
	/**
	 * @method  select - selects the code for easier copy&paste
	 * @see		http://stackoverflow.com/questions/985272/
	 */
	select: function(){
	  	var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(this.$box.get(0));
        selection.removeAllRanges();
        selection.addRange(range);
	},
	init: function(){
		this.initClipboard();
		this.$box.click( $.proxy(this, "select") );
	}
};