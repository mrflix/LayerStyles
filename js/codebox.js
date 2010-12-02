var codebox = {
	$box: $('#codeBox code'),
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
		this.$box.click( $.proxy(this, "select"));
	}
};